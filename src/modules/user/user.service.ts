import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { paginate, PaginationResult } from '../../utils/pagination';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async create(createUserDto: CreateUserDto, avatarBuffer?: Buffer) {
        try {
            let avatarUrl = null;
            if (avatarBuffer) {
                avatarUrl = await this.cloudinaryService.uploadImageFromBuffer(avatarBuffer, 'avatars');
            }
            const user = this.userRepository.create({ ...createUserDto, avatarUrl });
            const data = await this.userRepository.save(user);
            return {
                error: false,
                data,
                message: 'User created successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to create user',
            };
        }
    }

    async findAll(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            const users = await this.userRepository.find();
            const paginated = paginate(users, page, pageSize);
            return {
                error: false,
                data: paginated,
                message: 'All users fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch users',
            };
        }
    }

    async findOne(id: number) {
        try {
            const data = await this.userRepository.findOne({ where: { userId: id } });
            return {
                error: false,
                data,
                message: 'User fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch user',
            };
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto, user: any, avatarBuffer?: Buffer) {
        try {
            if (user.userId !== id) throw new ForbiddenException('You can only update your own profile');
            let avatarUrl = updateUserDto.avatarUrl;
            if (avatarBuffer) {
                avatarUrl = await this.cloudinaryService.uploadImageFromBuffer(avatarBuffer, 'avatars');
            }
            await this.userRepository.update(id, { ...updateUserDto, avatarUrl });
            return {
                error: false,
                data: await this.userRepository.findOne({ where: { userId: id } }),
                message: 'User updated successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to update user',
            };
        }
    }

    async remove(id: number, user: any) {
        try {
            if (user.userId !== id) return { error: true, data: null, message: 'You can only delete your own profile' };
            const data = await this.userRepository.delete(id);
            return {
                error: false,
                data,
                message: 'User deleted successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to delete user',
            };
        }
    }
}
