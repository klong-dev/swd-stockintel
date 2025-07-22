import { Injectable, Logger } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { configureCloudinary } from '../../configs/cloudinary.config';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);
    private readonly cloudinary;

    constructor() {
        this.cloudinary = configureCloudinary();
    }

    async uploadImageFromBuffer(buffer: Buffer, folder?: string): Promise<string> {
        return this.uploadWithRetry(() =>
            new Promise<string>((resolve, reject) => {
                this.cloudinary.uploader.upload_stream(
                    { folder },
                    (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    },
                ).end(buffer);
            })
        );
    }

    async uploadAudioFromBuffer(buffer: Buffer, folder?: string): Promise<string> {
        return this.uploadWithRetry(() =>
            new Promise<string>((resolve, reject) => {
                this.cloudinary.uploader.upload_stream(
                    {
                        folder,
                        resource_type: 'video' // Cloudinary uses 'video' resource type for audio files
                    },
                    (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    },
                ).end(buffer);
            })
        );
    }

    async uploadImageFromPath(filePath: string, folder?: string): Promise<string> {
        return this.uploadWithRetry(() =>
            new Promise<string>((resolve, reject) => {
                this.cloudinary.uploader.upload(
                    filePath,
                    { folder },
                    (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    },
                );
            })
        );
    }

    async deleteImage(publicId: string): Promise<boolean> {
        try {
            await this.cloudinary.uploader.destroy(publicId);
            return true;
        } catch (error) {
            this.logger.error('Cloudinary delete error', error);
            return false;
        }
    }

    async deleteFile(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<boolean> {
        try {
            await this.cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            return true;
        } catch (error) {
            this.logger.error('Cloudinary delete error', error);
            return false;
        }
    }

    private async uploadWithRetry(fn: () => Promise<string>, retry = 1): Promise<string> {
        try {
            return await fn();
        } catch (err) {
            this.logger.warn('Cloudinary upload failed, retrying...', err);
            if (retry > 0) {
                return fn();
            }
            throw err;
        }
    }
}
