import { Injectable, Inject } from '@nestjs/common';
import {
  UploadApiResponse,
  UploadApiErrorResponse,
  v2 as Cloudinary,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof Cloudinary) {}

  async uploadFile( file: Express.Multer.File,): Promise<UploadApiResponse | UploadApiErrorResponse> {

    return new Promise((resolve, reject) => {

      const uploadStream = this.cloudinary.uploader.upload_stream(

        { folder: 'nestjs_uploads' },

        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('No result returned from Cloudinary.'));
          resolve(result);
        },

      );

      uploadStream.end(file.buffer);
      
    });

  }

  async uploadMultiple(files: Express.Multer.File[]) {
    const uploadResults = await Promise.all(
      files.map(file => this.uploadFile(file))
    );
    return uploadResults;
  }

  async deleteFile(publicId: string) {
    return this.cloudinary.uploader.destroy(publicId);
  }
}
