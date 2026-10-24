import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors();

  // Enable strict validation on all incoming request bodies
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away any properties not in the DTO
      forbidNonWhitelisted: true, // Throws error if unknown property sent
      transform: true, // Automatically converts payloads to DTO instances
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
