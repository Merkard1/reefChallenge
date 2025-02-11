import { Resolver, Query } from '@nestjs/graphql';
import { AdminDashboard } from './entities/admin-dashboard.entity';
import { AdminDashboardService } from './admin-dashboard.service';

@Resolver(() => AdminDashboard)
export class AdminDashboardResolver {
  constructor(private dashboardService: AdminDashboardService) {}

  @Query(() => AdminDashboard)
  async adminDashboard(): Promise<AdminDashboard> {
    return this.dashboardService.getDashboardData();
  }
}
