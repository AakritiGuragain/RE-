import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

// Configuration
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import externalConfig from './config/external.config';

// Core Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './database/prisma.service';

// Feature Modules
import { WasteModule } from './waste/waste.module';
import { RewardsModule } from './rewards/rewards.module';
import { CommunityModule } from './community/community.module';
import { BazarModule } from './bazar/bazar.module';
import { DropPointsModule } from './drop-points/drop-points.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GamificationModule } from './gamification/gamification.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig, externalConfig],
    }),
    
    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    
    // Task Scheduling
    ScheduleModule.forRoot(),
    
    // Queue Management
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    
    // Core Modules
    AuthModule,
    UsersModule,
    
    // Feature Modules
    WasteModule,
    RewardsModule,
    CommunityModule,
    BazarModule,
    DropPointsModule,
    NotificationsModule,
    GamificationModule,
    IntegrationsModule,
    AdminModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
