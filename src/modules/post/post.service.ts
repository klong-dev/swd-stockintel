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

    async create(createPostDto: CreatePostDto, user: any) {
        try {
            const post = this.postRepository.create({
                ...createPostDto,
                expertId: user.userId,
            });
            const data = await this.postRepository.save(post);
            return {
                error: false,
                data,
                message: 'Post created successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to create post',
            };
        }
    }

    async findAll() {
        try {
            const data = await this.postRepository.find();
            return {
                error: false,
                data,
                message: 'All posts fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch posts',
            };
        }
    }

    async findOne(id: number) {
        try {
            const data = await this.postRepository.findOne({ where: { postId: id } });
            return {
                error: false,
                data,
                message: 'Post fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch post',
            };
        }
    }

    async update(id: number, updatePostDto: UpdatePostDto, user: any) {
        try {
            const post = await this.postRepository.findOne({ where: { postId: id } });
            if (!post) return { error: true, data: null, message: 'Post not found' };
            if (post.expertId !== user.userId) return { error: true, data: null, message: 'You can only update your own posts' };
            await this.postRepository.update(id, updatePostDto);
            const data = await this.postRepository.findOne({ where: { postId: id } });
            return {
                error: false,
                data,
                message: 'Post updated successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to update post',
            };
        }
    }

    async remove(id: number, user: any) {
        try {
            const post = await this.postRepository.findOne({ where: { postId: id } });
            if (!post) return { error: true, data: null, message: 'Post not found' };
            if (post.expertId !== user.userId) return { error: true, data: null, message: 'You can only delete your own posts' };
            const data = await this.postRepository.delete(id);
            return {
                error: false,
                data,
                message: 'Post deleted successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to delete post',
            };
        }
    }
}
