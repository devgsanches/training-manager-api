import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '@thallesp/nestjs-better-auth'

import { AppService } from './app.service'
import { envSchema } from './env'
import { health_checkController } from './health-check.controller'
import { auth } from './lib/auth'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule.forRoot({ auth }),
    UsersModule,
  ],
  controllers: [health_checkController],
  providers: [AppService],
})
export class AppModule {}
