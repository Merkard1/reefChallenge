import { Resolver, Query, Args } from '@nestjs/graphql';
import { SalesReport } from './sales-report.entity';
import { SalesReportService } from './sales-report.service';

@Resolver(() => SalesReport)
export class SalesReportResolver {
  constructor(private salesReportService: SalesReportService) {}

  @Query(() => SalesReport)
  async salesReport(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ): Promise<SalesReport> {
    return this.salesReportService.getSalesReport(startDate, endDate);
  }
}
