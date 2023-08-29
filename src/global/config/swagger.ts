import { DocumentBuilder } from '@nestjs/swagger';

export const SwaggerDocConfig = new DocumentBuilder()
  .setTitle('API Docs')
  .setDescription('The api description')
  .setVersion('1.0')
  .addBearerAuth()
  .setContact(
    'Developer',
    'https://raupov_manuchehr.t.me',
    'manuchekhr.3232@gmail.com',
  )
  .build();
