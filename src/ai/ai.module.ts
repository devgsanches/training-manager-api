import { Module } from '@nestjs/common'

import { UsersModule } from '../users/users.module'
import { WorkoutPlanModule } from '../workout_plan/workout_plan.module'
import { AiController } from './ai.controller'

@Module({
  imports: [UsersModule, WorkoutPlanModule],
  controllers: [AiController],
})
export class AiModule {}
