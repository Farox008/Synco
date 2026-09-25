import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, access granted
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    // In Supabase, custom roles can be stored in the user's app_metadata or user_metadata
    // For this example, assuming the role is stored in user.app_metadata.role
    const userRole = user.app_metadata?.role || user.user_metadata?.role;

    if (!userRole) {
        throw new ForbiddenException('User role not found');
    }

    const hasRole = requiredRoles.includes(userRole);
    
    if (!hasRole) {
        throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
