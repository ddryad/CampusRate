import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CampusRate API')
    .setDescription(
      "API REST permettant à la communauté étudiante de consulter des endroits du campus et de publier des appréciations.",
    )
    .setVersion('1.0.0')
    .addTag('Places', 'Gestion des endroits évalués')
    .addTag('Reviews', 'Gestion des appréciations')
    .addTag('Health', 'État du service')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: 'docs/openapi.json',
    customSiteTitle: 'CampusRate — Documentation',
  });
}