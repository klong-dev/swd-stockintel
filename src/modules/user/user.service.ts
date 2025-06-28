import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { paginate, PaginationResult } from '../../utils/pagination';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async create(createUserDto: CreateUserDto) {
        try {
            const user = this.userRepository.create(createUserDto);
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

    async update(id: number, updateUserDto: UpdateUserDto, user: any) {
        try {
            if (user.userId !== id) return { error: true, data: null, message: 'You can only update your own profile' };
            await this.userRepository.update(id, updateUserDto);
            const data = await this.userRepository.findOne({ where: { userId: id } });
            return {
                error: false,
                data,
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
