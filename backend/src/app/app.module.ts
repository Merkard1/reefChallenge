import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductModule } from 'src/product/product.module';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';
import { SalesReportModule } from 'src/sales-report/sales-report.module';
import { AuthModule } from 'src/auth/auth.module';
import { AdminDashboardModule } from 'src/admin-dashboard/admin-dashboard.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { SeederModule } from 'src/seeder/seeder.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      debug: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    SeederModule,
    NotificationsModule,
    AuthModule,
    PrismaModule,
    ProductModule,
    OrderModule,
    UserModule,
    SalesReportModule,
    AdminDashboardModule,
  ],
})
export class AppModule {}
