// abilities.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_ABILITY } from './abilities.decorator';
@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const abilityRequirement = this.reflector.get(CHECK_ABILITY, context.getHandler());
    if (!abilityRequirement) return true;

    const { action, subject } = abilityRequirement; 
    const req = context.switchToHttp().getRequest();
    const ability = req.ability;

    if (ability.can(action, subject)) return true;
    throw new ForbiddenException('Access denied by CASL');
  }
}
