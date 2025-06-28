import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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
        let avatarUrl = null;
        if (avatarBuffer) {
            avatarUrl = await this.cloudinaryService.uploadImageFromBuffer(avatarBuffer, 'avatars');
        }
        const user = this.userRepository.create({ ...createUserDto, avatarUrl });
        return this.userRepository.save(user);
    }

    findAll() {
        return this.userRepository.find();
    }

    findOne(id: number) {
        return this.userRepository.findOne({ where: { userId: id } });
    }

    async update(id: number, updateUserDto: UpdateUserDto, user: any, avatarBuffer?: Buffer) {
        if (user.userId !== id) throw new ForbiddenException('You can only update your own profile');
        let avatarUrl = updateUserDto.avatarUrl;
        if (avatarBuffer) {
            avatarUrl = await this.cloudinaryService.uploadImageFromBuffer(avatarBuffer, 'avatars');
        }
        await this.userRepository.update(id, { ...updateUserDto, avatarUrl });
        return this.findOne(id);
    }

    async remove(id: number, user: any) {
        if (user.userId !== id) throw new ForbiddenException('You can only delete your own profile');
        return this.userRepository.delete(id);
    }
}
