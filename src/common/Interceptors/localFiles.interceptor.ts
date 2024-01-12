import {
  Injectable,
  NestInterceptor,
  Type,
  UnsupportedMediaTypeException,
  mixin,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Request } from 'express';
import { existsSync, promises as fsPromises } from 'fs';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { Observable } from 'rxjs';
import { v4 as uuidV4 } from 'uuid';

interface LocalFilesInterceptorOptions {
  fieldName: string;
  path?: string;
  limits?: MulterOptions['limits'];
  fileFilter?: MulterOptions['fileFilter'];
}

export default function LocalFilesInterceptor(
  options: LocalFilesInterceptorOptions
): Type<NestInterceptor> {
  const { fieldName, path } = options;
  const multerDefaultOptions: MulterOptions = {
    limits: { fileSize: 1024 * 1024 * 10 }, // 10 MB
    fileFilter: (req: Request, file: Express.Multer.File, cb) => {
      const isValidMimeType = RegExp('(text/csv)|(text/xml)').test(file.mimetype);

      if (isValidMimeType) {
        cb(null, true);
      } else {
        cb(
          new UnsupportedMediaTypeException(
            `Unsupported file type: '${extname(file.originalname)}'`
          ),
          false
        );
      }
    },
    storage: !path
      ? memoryStorage()
      : diskStorage({
          destination: async (req: Request, file: Express.Multer.File, cb) => {
            if (!existsSync(path)) {
              await fsPromises.mkdir(path, {
                recursive: true,
              });
            }
            return cb(null, `${path}`);
          },
          filename: (req: Request, file: Express.Multer.File, cb) => {
            const { originalname } = file;
            const filename = `${originalname}_${uuidV4()}${extname(originalname)}`;
            return cb(null, filename);
          },
        }),
  };

  const multerOptions = {
    storage: multerDefaultOptions.storage,
    limits: options.limits || multerDefaultOptions.limits,
    fileFilter: options.fileFilter || multerDefaultOptions.fileFilter,
  };

  @Injectable()
  class Interceptor implements NestInterceptor {
    private readonly fileInterceptor: NestInterceptor;

    constructor() {
      this.fileInterceptor = new (FileInterceptor(fieldName, multerOptions))();
    }

    intercept(
      ...args: Parameters<NestInterceptor['intercept']>
    ): Observable<any> | Promise<Observable<any>> {
      return this.fileInterceptor.intercept(...args);
    }
  }

  return mixin(Interceptor);
}
