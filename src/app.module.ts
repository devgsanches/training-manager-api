import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '@thallesp/nestjs-better-auth'

import { AiModule } from './ai/ai.module'
import { AppService } from './app.service'
import { envSchema } from './lib/env'
import { HealthCheckController } from './health_check.controller'
import { HomeController } from './home/home.controller'
import { GetHomeDataUseCase } from './home/use-cases/get-home-data.use-case'
import { auth } from './lib/auth'
import { PrismaModule } from './lib/prisma.module'
import { StatsModule } from './stats/stats.module'
import { UsersModule } from './users/users.module'
import { WorkoutPlanModule } from './workout_plan/workout_plan.module'
import { WorkoutSessionModule } from './workout_session/workout_session.module'
import { LoggerModule } from 'nestjs-pino'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  messageKey: 'msg',
                },
              }
            : undefined,
      },
    }),
    AuthModule.forRoot({ auth }),
    PrismaModule,
    UsersModule,
    WorkoutPlanModule,
    WorkoutSessionModule,
    StatsModule,
    AiModule,
  ],
  controllers: [HealthCheckController, HomeController],
  providers: [AppService, GetHomeDataUseCase],
})
export class AppModule { }
