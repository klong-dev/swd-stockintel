import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    create(createUserDto: CreateUserDto) {
        const user = this.userRepository.create(createUserDto);
        return this.userRepository.save(user);
    }

    findAll() {
        return this.userRepository.find();
    }

    findOne(id: number) {
        return this.userRepository.findOne({ where: { userId: id } });
    }

    async update(id: number, updateUserDto: UpdateUserDto, user: any) {
        if (user.userId !== id) throw new ForbiddenException('You can only update your own profile');
        await this.userRepository.update(id, updateUserDto);
        return this.findOne(id);
    }

    async remove(id: number, user: any) {
        if (user.userId !== id) throw new ForbiddenException('You can only delete your own profile');
        return this.userRepository.delete(id);
    }
}
