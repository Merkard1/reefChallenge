import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SeederService } from './seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.use((req, res, next) => {
    res.removeHeader('ETag');
    next();
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  const port = process.env.PORT || 4444;

  try {
    await app.listen(port);
    console.log(
      `🚀 Backend Application is running on: http://localhost:${port}`,
    );
  } catch (err: any) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use.`);
    } else {
      console.error(`Failed to start the application: ${err.message}`);
    }
    process.exit(1);
  }

  try {
    const seederService = app.get(SeederService);
    await seederService.seed();
    console.log('Database seeded successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

bootstrap();
