import { Module } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardResolver } from './admin-dashboard.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AdminDashboardService, AdminDashboardResolver],
  exports: [AdminDashboardService],
})
export class AdminDashboardModule {}
