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
            // Only get active users (status = 1 or null)
            const users = await this.userRepository.find({
                where: [
                    { status: 1 },
                    { status: null }
                ]
            });
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

    async findAllIncludingDeleted(page: number = 1, pageSize: number = 10): Promise<{ error: boolean; data: any; message: string }> {
        try {
            // Get all users including deleted ones
            const users = await this.userRepository.find();
            const paginated = paginate(users, page, pageSize);
            return {
                error: false,
                data: paginated,
                message: 'All users (including deleted) fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch users',
            };
        }
    }

    async findOne(id: string) {
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

    async update(id: string, updateUserDto: UpdateUserDto, user: any, avatarBuffer?: Buffer) {
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

    async remove(id: string, user: any) {
        try {
            if (user.userId !== id) return { error: true, data: null, message: 'You can only delete your own profile' };

            // Soft delete: update status to 0
            await this.userRepository.update(id, { status: 0 });
            const updatedUser = await this.userRepository.findOne({ where: { userId: id } });

            return {
                error: false,
                data: updatedUser,
                message: 'User deleted successfully (soft delete)',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to delete user',
            };
        }
    }

    async restore(id: string, user: any) {
        try {
            if (user.userId !== id) return { error: true, data: null, message: 'You can only restore your own profile' };

            // Restore user: update status to 1
            await this.userRepository.update(id, { status: 1 });
            const restoredUser = await this.userRepository.findOne({ where: { userId: id } });

            return {
                error: false,
                data: restoredUser,
                message: 'User restored successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to restore user',
            };
        }
    }
}
