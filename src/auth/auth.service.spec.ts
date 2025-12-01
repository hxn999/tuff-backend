import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from './refreshToken.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { BadRequestException, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('src/lib/mail', () => ({
  sendOtpEmail: jest.fn(),
}));

jest.mock('otplib', () => ({
  totp: {
    generate: jest.fn(),
    check: jest.fn(),
  },
  authenticator: {
    generateSecret: jest.fn(),
  },
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    _id: 'user-id-1',
    email: 'user@example.com',
    name: 'Test User',
    pfp: 'pfp.png',
    role: 'user',
    password: 'hashed-password',
  } as any;

  const userService = {
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
  } as unknown as jest.Mocked<UserService>;

  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  } as unknown as jest.Mocked<JwtService>;

  const refreshTokenService = {
    createToken: jest.fn(),
    revoke: jest.fn(),
    revokeAllForUser: jest.fn(),
    validateAndRotate: jest.fn(),
  } as unknown as jest.Mocked<RefreshTokenService>;

  const httpService = {} as unknown as jest.Mocked<HttpService>;
  const configService = {} as unknown as jest.Mocked<ConfigService>;

  const makeRes = () => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
        { provide: RefreshTokenService, useValue: refreshTokenService },
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('logs in successfully and sets cookies', async () => {
      const bcrypt = require('bcrypt');
      userService.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwtService.signAsync = jest.fn().mockResolvedValue('access-token');
      const expiresAt = new Date(Date.now() + 1000);
      refreshTokenService.createToken = jest.fn().mockResolvedValue({ cookieValue: 'id.random', expiresAt });

      const res = makeRes();

      const result = await service.login(mockUser.email, 'password', res as any);

      expect(userService.findOne).toHaveBeenCalledWith(mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalledWith('password', mockUser.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ role: mockUser.role, _id: mockUser._id });
      expect(refreshTokenService.createToken).toHaveBeenCalledWith(mockUser._id);
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'id.random', expect.objectContaining({ httpOnly: true }));
      expect(res.cookie).toHaveBeenCalledWith('accessToken', 'access-token', expect.objectContaining({ httpOnly: true }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: { name: mockUser.name, pfp: mockUser.pfp } });
      expect(result).toBe(res);
    });

    it('throws BadRequestException for wrong credentials', async () => {
      const bcrypt = require('bcrypt');
      userService.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      const res = makeRes();

      await expect(service.login(mockUser.email, 'wrong', res as any)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if user not found', async () => {
      userService.findOne = jest.fn().mockResolvedValue(null);
      const res = makeRes();
      await expect(service.login('no@user', 'pass', res as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('register', () => {
    it('registers and sets cookies', async () => {
      const bcrypt = require('bcrypt');
      userService.create = jest.fn().mockResolvedValue(mockUser);
      jwtService.signAsync = jest.fn().mockResolvedValue('access-token');
      refreshTokenService.createToken = jest.fn().mockResolvedValue({ cookieValue: 'id.random', expiresAt: new Date(Date.now() + 1000) });
      const res = makeRes();

      const result = await service.register({} as any, res as any);
      expect(userService.create).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(refreshTokenService.createToken).toHaveBeenCalledWith(mockUser._id);
      expect(res.cookie).toHaveBeenCalledWith('accessToken', 'access-token', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: { name: mockUser.name, pfp: mockUser.pfp } });
      expect(result).toBe(res);
    });
  });

  describe('changePassword', () => {
    it('changes password and rotates tokens', async () => {
      const bcrypt = require('bcrypt');
      userService.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('new-hash');
      refreshTokenService.revokeAllForUser = jest.fn().mockResolvedValue(undefined);
      jwtService.signAsync = jest.fn().mockResolvedValue('new-access');
      refreshTokenService.createToken = jest.fn().mockResolvedValue({ cookieValue: 'new.id', expiresAt: new Date(Date.now() + 1000) });

      const req: any = { user: { _id: mockUser._id } };
      const res = makeRes();

      const result = await service.changePassword(req as any, 'old', 'new', res as any);
      expect(userService.findOne).toHaveBeenCalledWith(mockUser._id);
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(userService.updateOne).toHaveBeenCalledWith(mockUser._id, { password: 'new-hash' });
      expect(refreshTokenService.revokeAllForUser).toHaveBeenCalledWith(mockUser._id);
      expect(res.cookie).toHaveBeenCalledWith('accessToken', 'new-access', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: { name: mockUser.name, pfp: mockUser.pfp } });
      expect(result).toBe(res);
    });

    it('throws NotAcceptableException for wrong previous password', async () => {
      const bcrypt = require('bcrypt');
      userService.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      const req: any = { user: { _id: mockUser._id } };
      const res = makeRes();

      await expect(service.changePassword(req as any, 'bad', 'new', res as any)).rejects.toThrow(NotAcceptableException);
    });
  });

  describe('resetPassword', () => {
    it('resets password using token and revokes tokens', async () => {
      const bcrypt = require('bcrypt');
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ _id: mockUser._id });
      userService.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue('reset-hash');
      refreshTokenService.revokeAllForUser = jest.fn().mockResolvedValue(undefined);

      const resp = await service.resetPassword('token', 'new');
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('token');
      expect(userService.updateOne).toHaveBeenCalledWith(mockUser._id, { password: 'reset-hash' });
      expect(refreshTokenService.revokeAllForUser).toHaveBeenCalled();
      expect(resp).toEqual({ message: 'Password reset was successful !' });
    });

    it('throws BadRequestException when user not found', async () => {
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ _id: 'missing' });
      userService.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.resetPassword('token', 'new')).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendOtp', () => {
    it('sends otp for existing user', async () => {
      const { authenticator, totp } = require('otplib');
      const { sendOtpEmail } = require('src/lib/mail');
      userService.findOne = jest.fn().mockResolvedValue(mockUser);
      authenticator.generateSecret.mockReturnValue('secret');
      totp.generate.mockReturnValue('123456');

      const result = await service.sendOtp(mockUser.email);
      expect(userService.findOne).toHaveBeenCalledWith(mockUser.email);
      expect(authenticator.generateSecret).toHaveBeenCalled();
      expect(totp.generate).toHaveBeenCalledWith('secret');
      expect(sendOtpEmail).toHaveBeenCalledWith(mockUser.email, '123456');
      expect(result).toEqual({ message: 'Sending otp...' });
    });

    it('throws BadRequestException for non-existent user', async () => {
      userService.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.sendOtp('no@user')).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendPasswordResetLink', () => {
    it('generates a reset token and returns message', async () => {
      userService.findOne = jest.fn().mockResolvedValue(mockUser);
      jwtService.signAsync = jest.fn().mockResolvedValue('reset-token');

      const result = await service.sendPasswordResetLink(mockUser.email);
      expect(userService.findOne).toHaveBeenCalledWith(mockUser.email);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ _id: mockUser._id });
      expect(result).toEqual({ message: 'Sending reset link...' });
    });

    it('throws BadRequestException when user not found', async () => {
      userService.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.sendPasswordResetLink('no@user')).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshAccessToken', () => {
    it('refreshes and sets new cookies', async () => {
      const req: any = { cookies: { refresh_token: '1.r' } };
      const res = makeRes();
      const userIdObj = { toString: () => mockUser._id } as any;
      refreshTokenService.validateAndRotate = jest.fn().mockResolvedValue({ cookieValue: '2.r', expiresAt: new Date(Date.now() + 1000), userId: userIdObj });
      userService.findOne = jest.fn().mockResolvedValue(mockUser);
      jwtService.signAsync = jest.fn().mockResolvedValue('new-access');

      const out = await service.refreshAccessToken(req as any, res as any);
      expect(refreshTokenService.validateAndRotate).toHaveBeenCalledWith('1.r');
      expect(userService.findOne).toHaveBeenCalledWith(mockUser._id);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ _id: userIdObj, role: mockUser.role });
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', '2.r', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('accessToken', 'new-access', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access token refreshed successfully' });
      expect(out).toBe(res);
    });

    it('throws UnauthorizedException when missing refresh token', async () => {
      const req: any = { cookies: {} };
      const res = makeRes();
      await expect(service.refreshAccessToken(req as any, res as any)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('revokes refresh token and clears cookies', async () => {
      const req: any = { cookies: { refresh_token: 'id.rand' } };
      const res = makeRes();

      await service.logout(req as any, res as any);
      expect(refreshTokenService.revoke).toHaveBeenCalledWith('id');
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
      expect(res.send).toHaveBeenCalled();
    });

    it('clears access token cookie even if no refresh token present', async () => {
      const req: any = { cookies: {} };
      const res = makeRes();
      await service.logout(req as any, res as any);
      expect(refreshTokenService.revoke).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
      expect(res.send).toHaveBeenCalled();
    });
  });
});
