import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
