import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        });
    }

    async validate(payload: any) {
        const { userId } = payload;

        // Find the user by ID
        const user = await this.userRepository.findOne({
            where: { userId: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Return user object that will be attached to req.user
        return {
            userId: user.userId,
            email: user.email,
            fullName: user.fullName,
            isExpert: user.isExpert,
        };
    }
}
