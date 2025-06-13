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

    create(createCommentDto: CreateCommentDto) {
        const comment = this.commentRepository.create(createCommentDto);
        return this.commentRepository.save(comment);
    }

    findAll() {
        return this.commentRepository.find();
    }

    findOne(id: number) {
        return this.commentRepository.findOne({ where: { commentId: id } });
    }

    async update(id: number, updateCommentDto: UpdateCommentDto) {
        await this.commentRepository.update(id, updateCommentDto);
        return this.findOne(id);
    }

    remove(id: number) {
        return this.commentRepository.delete(id);
    }
}
