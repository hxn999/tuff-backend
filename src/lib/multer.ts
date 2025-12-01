import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';

export const multerConfig:MulterOptions = {
  // storage: diskStorage({
  //   destination: './uploads',
  //   filename: (req, file, callback) => {
  //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  //     const ext = extname(file.originalname);
  //     const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
  //     callback(null, filename);
  //   }
  // }),
  storage:memoryStorage(),
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
      return callback(new Error('Only image and PDF files are allowed!'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
};