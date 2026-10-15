import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  isDuplicateKeyError,
  MongoDuplicateKeyError,
} from '../database/mongo-errors';
import { ProblemDetailsDto } from '../dto/problem-details.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const problem = this.createProblemDetails(exception, request.url);

    if (problem.status >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `${request.method} ${request.url} -> ${problem.status}`,
        stack,
      );
    }

    response
      .status(problem.status)
      .contentType('application/problem+json')
      .json(problem);
  }

  private createProblemDetails(
    exception: unknown,
    instance: string,
  ): ProblemDetailsDto {
    if (isDuplicateKeyError(exception)) {
      return {
        type: 'about:blank',
        title: 'Conflict',
        status: HttpStatus.CONFLICT,
        detail: this.getDuplicateDetail(exception),
        instance,
      };
    }

    if (exception instanceof HttpException) {
      return this.createHttpProblem(exception, instance);
    }

    const bodyError = (exception as { type?: string } | null)?.type;
    if (bodyError === 'entity.too.large') {
      return this.createHttpProblem(
        new HttpException(
          'Le corps de la requête est trop volumineux.',
          HttpStatus.PAYLOAD_TOO_LARGE,
        ),
        instance,
      );
    }
    if (bodyError === 'entity.parse.failed') {
      return this.createHttpProblem(
        new HttpException('Le JSON reçu est invalide.', HttpStatus.BAD_REQUEST),
        instance,
      );
    }

    return {
      type: 'about:blank',
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'Une erreur interne est survenue.',
      instance,
    };
  }

  private getDuplicateDetail(exception: MongoDuplicateKeyError): string {
    if (exception.keyPattern?.name) {
      return 'Un endroit portant ce nom existe déjà.';
    }
    return 'Une ressource possédant ces valeurs existe déjà.';
  }

  private createHttpProblem(
    exception: HttpException,
    instance: string,
  ): ProblemDetailsDto {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let detail = 'Une erreur est survenue.';
    let errors: string[] | undefined;

    if (typeof exceptionResponse === 'string') {
      detail = exceptionResponse;
    } else {
      const message = (exceptionResponse as Record<string, unknown>).message;
      if (Array.isArray(message)) {
        detail = 'La requête contient des données invalides.';
        errors = message as string[];
      } else if (typeof message === 'string') {
        detail = message;
      }
    }

    return {
      type: 'about:blank',
      title: HttpStatus[status] ?? 'Error',
      status,
      detail,
      instance,
      errors,
    };
  }
}
