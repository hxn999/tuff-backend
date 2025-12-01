// src/auth/refresh-token.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from './schemas/refreshToken.schema';
import * as crypto from 'crypto';


@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {}

  async createToken(userId: Types.ObjectId, expiresInDays = 30) {
    const rawToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const created = await this.refreshTokenModel.create({
      userId,
      tokenHash,
      expiresAt,
    });

    // cookie value: "<id>.<raw>"
    const cookieValue = `${created._id}.${rawToken}`;
    return { cookieValue, expiresAt,userId };
  }

  async validateAndRotate(cookieValue: string) {
    const [id, raw] = cookieValue.split('.');
    if (!id || !raw) throw new UnauthorizedException('Malformed refresh token');

    const record = await this.refreshTokenModel.findById(id);
    if (!record || record.revoked) throw new UnauthorizedException('Token invalid');
    if (record.expiresAt < new Date()) throw new UnauthorizedException('Token expired');

    const match = await bcrypt.compare(raw, record.tokenHash);
    if (!match) {
      // Possible token reuse — revoke all for user
      await this.revokeAllForUser(record.userId);
      throw new Error('Possible token reuse detected');
    }

    // rotate: delete old, issue new
    await this.refreshTokenModel.findByIdAndDelete(id);
    return this.createToken(record.userId);
  }

  async revoke(id: string) {
    await this.refreshTokenModel.findByIdAndUpdate(id, { revoked: true });
  }

  async revokeAllForUser(userId: Types.ObjectId) {
    await this.refreshTokenModel.updateMany({ userId }, { revoked: true });
  }
}
