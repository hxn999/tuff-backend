import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
  import { UserPayload } from './auth.service';
  import { User } from 'src/user/schemas/user.schema';
  
  @Injectable()
  export class PublicAuthGuard implements CanActivate {
    constructor(
      private jwtService: JwtService,
      private caslAbilityFactory: CaslAbilityFactory,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request: Request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        return true;
      }
  
      try {
        const payload: UserPayload = await this.jwtService.verifyAsync(token);
        request['user'] = payload;
        request['ability'] = this.caslAbilityFactory.createForUser(payload);
      } catch {
       return true;
      }
      return true;
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      return request.cookies?.accessToken;
    }
  }
  