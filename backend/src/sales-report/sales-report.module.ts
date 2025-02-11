import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SalesReportService } from './sales-report.service';
import { SalesReportResolver } from './sales-report.resolver';

@Module({
  imports: [PrismaModule],
  providers: [SalesReportService, SalesReportResolver],
})
export class SalesReportModule {}
