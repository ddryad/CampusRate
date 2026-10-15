import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';
import { configureSwagger } from './configure-swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useBodyParser('json', { limit: '10kb' });

  configureApp(app);
  configureSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
