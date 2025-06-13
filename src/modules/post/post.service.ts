import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
    ) { }

    create(createPostDto: CreatePostDto, user: any) {
        const post = this.postRepository.create({
            ...createPostDto,
            expertId: user.userId,
        });
        return this.postRepository.save(post);
    }

    findAll() {
        return this.postRepository.find();
    }

    findOne(id: number) {
        return this.postRepository.findOne({ where: { postId: id } });
    }

    async update(id: number, updatePostDto: UpdatePostDto, user: any) {
        const post = await this.postRepository.findOne({ where: { postId: id } });
        if (!post) throw new NotFoundException('Post not found');
        if (post.expertId !== user.userId) throw new ForbiddenException('You can only update your own posts');
        await this.postRepository.update(id, updatePostDto);
        return this.findOne(id);
    }

    async remove(id: number, user: any) {
        const post = await this.postRepository.findOne({ where: { postId: id } });
        if (!post) throw new NotFoundException('Post not found');
        if (post.expertId !== user.userId) throw new ForbiddenException('You can only delete your own posts');
        return this.postRepository.delete(id);
    }
}
