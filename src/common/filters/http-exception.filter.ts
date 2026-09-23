import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProblemDetailsDto } from '../dto/problem-details.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let detail = 'Une erreur est survenue.';
    let errors: string[] | undefined;

    if (typeof exceptionResponse === 'string') {
      detail = exceptionResponse;
    } else {
      const body = exceptionResponse as Record<string, unknown>;
      const message = body.message;

      if (Array.isArray(message)) {
        detail = 'La requête contient des données invalides.';
        errors = message as string[];
      } else if (typeof message === 'string') {
        detail = message;
      }
    }

    const problemDetails: ProblemDetailsDto = {
      type: 'about:blank',
      title: HttpStatus[status] ?? 'Error',
      status,
      detail,
      instance: request.url,
      errors,
    };

    response
      .status(status)
      .contentType('application/problem+json')
      .json(problemDetails);
  }
}