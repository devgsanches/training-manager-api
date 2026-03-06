import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '@thallesp/nestjs-better-auth'

import { AppService } from './app.service'
import { envSchema } from './env'
import { HealthCheckController } from './health_check.controller'
import { HomeController } from './home/home.controller'
import { GetHomeDataUseCase } from './home/use-cases/get-home-data.use-case'
import { auth } from './lib/auth'
import { PrismaModule } from './lib/prisma.module'
import { StatsModule } from './stats/stats.module'
import { UsersModule } from './users/users.module'
import { WorkoutPlanModule } from './workout_plan/workout_plan.module'
import { WorkoutSessionModule } from './workout_session/workout_session.module'

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
    WorkoutSessionModule,
    StatsModule,
  ],
  controllers: [HealthCheckController, HomeController],
  providers: [AppService, GetHomeDataUseCase],
})
export class AppModule {}
