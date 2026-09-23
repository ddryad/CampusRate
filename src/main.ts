import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { configureApp } from './configure-app';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { configureSwagger } from './configure-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);
  configureSwagger(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
