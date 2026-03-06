import { Module } from '@nestjs/common'

import { WorkoutPlanModule } from '../workout_plan/workout_plan.module'
import { WorkoutSessionRepository } from './repositories/workout-session.repository'
import { CompleteWorkoutSessionUseCase } from './use-cases/complete-workout-session.use-case'
import { StartWorkoutSessionUseCase } from './use-cases/start-workout-session.use-case'
import { WorkoutSessionController } from './workout_session.controller'

@Module({
  imports: [WorkoutPlanModule],
  controllers: [WorkoutSessionController],
  providers: [
    WorkoutSessionRepository,
    StartWorkoutSessionUseCase,
    CompleteWorkoutSessionUseCase,
  ],
  exports: [WorkoutSessionRepository],
})
export class WorkoutSessionModule {}
