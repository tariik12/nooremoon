import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { Role } from '../../rbac/entities/role.entity';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.roleId) throw new ForbiddenException('No role assigned');

    const cacheKey = `role_perms:${user.roleId}`;
    const cached = await this.redis.get(cacheKey);

    let permissionKeys: string[];

    if (cached) {
      permissionKeys = JSON.parse(cached);
    } else {
      const role = await this.roleRepo.findOne({
        where: { id: user.roleId },
        relations: { permissions: true },
      });

      if (!role) throw new ForbiddenException('Role not found');

      permissionKeys = role.permissions.map((p) => p.key);
      await this.redis.setex(cacheKey, 300, JSON.stringify(permissionKeys));
    }

    if (!permissionKeys.includes(requiredPermission)) {
      throw new ForbiddenException(`Permission '${requiredPermission}' required`);
    }

    return true;
  }
}
