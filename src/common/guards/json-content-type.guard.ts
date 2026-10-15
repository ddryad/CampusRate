import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JsonContentTypeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const hasBody = Number(req.headers['content-length'] ?? 0) > 0;

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && hasBody) {
      if (!req.is('application/json')) {
        throw new UnsupportedMediaTypeException(
          'Le Content-Type doit être application/json.',
        );
      }
    }
    return true;
  }
}
