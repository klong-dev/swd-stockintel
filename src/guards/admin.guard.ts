import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../modules/admin/entities/admin.entity';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header missing');
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid Authorization format');
        }

        try {
            // Verify JWT token
            const decoded = this.jwtService.verify(token);

            // Check if user exists in admin table
            const admin = await this.adminRepository.findOne({
                where: {
                    id: decoded.userId || decoded.id,
                    status: 1 // Active admin status
                }
            });

            if (!admin) {
                throw new ForbiddenException('Access denied: Admin privileges required');
            }

            // Add admin info to request
            request.user = decoded;
            request.admin = admin;

            return true;
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid or expired token: ' + error.message);
        }
    }
}
