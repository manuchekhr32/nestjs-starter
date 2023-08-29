import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerDocConfig } from './global/config/swagger';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: process.env.CORS?.split(','),
  });

  if (process.env?.SWAGGER === 'true') {
    const swaggerDoc = SwaggerModule.createDocument(app, SwaggerDocConfig);
    SwaggerModule.setup('swagger', app, swaggerDoc);
  }

  await app.listen(+process.env.PORT || 3000);
}
bootstrap();
