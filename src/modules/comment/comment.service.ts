import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
    ) { }

    async create(createCommentDto: CreateCommentDto) {
        try {
            const comment = this.commentRepository.create(createCommentDto);
            const data = await this.commentRepository.save(comment);
            return {
                error: false,
                data,
                message: 'Comment created successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to create comment',
            };
        }
    }

    async findAll() {
        try {
            const data = await this.commentRepository.find();
            return {
                error: false,
                data,
                message: 'All comments fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch comments',
            };
        }
    }

    async findOne(id: number) {
        try {
            const data = await this.commentRepository.findOne({ where: { commentId: id } });
            return {
                error: false,
                data,
                message: 'Comment fetched successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to fetch comment',
            };
        }
    }

    async update(id: number, updateCommentDto: UpdateCommentDto) {
        try {
            await this.commentRepository.update(id, updateCommentDto);
            const data = await this.commentRepository.findOne({ where: { commentId: id } });
            return {
                error: false,
                data,
                message: 'Comment updated successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to update comment',
            };
        }
    }

    async remove(id: number) {
        try {
            const data = await this.commentRepository.delete(id);
            return {
                error: false,
                data,
                message: 'Comment deleted successfully',
            };
        } catch (e) {
            return {
                error: true,
                data: null,
                message: e.message || 'Failed to delete comment',
            };
        }
    }
}
