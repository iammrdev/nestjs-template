import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map(
          (error) => ({
            message: Object.values(error.constraints || {}).join('. '),
            field: error.property,
          }),
          // `${error.property} has wrong value ${JSON.stringify(
          //   error.value,
          // )}. ${Object.values(error.constraints || {}).join(';')}`,
        );
        return new BadRequestException({
          errorsMessages: messages,
        });
      },
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('App')
    .setDescription('API')
    .setVersion('1.0')
    .build();

  app.useGlobalPipes(new CustomValidationPipe());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('spec', app, document);

  await app.listen(5000);
}
bootstrap();
