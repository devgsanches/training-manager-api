import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '@thallesp/nestjs-better-auth'

import { AppService } from './app.service'
import { envSchema } from './env'
import { HealthCheckController } from './health_check.controller'
import { auth } from './lib/auth'
import { PrismaModule } from './lib/prisma.module'
import { UsersModule } from './users/users.module'
import { WorkoutPlanModule } from './workout_plan/workout_plan.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule.forRoot({ auth }),
    PrismaModule,
    UsersModule,
    WorkoutPlanModule,
  ],
  controllers: [HealthCheckController],
  providers: [AppService],
})
export class AppModule {}
