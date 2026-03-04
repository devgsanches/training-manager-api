import { Module } from '@nestjs/common'

import { WorkoutPlanRepository } from './repositories/workout-plan.repository'
import { CreateWorkoutPlanUseCase } from './use-cases/create-workout-plan.use-case'
import { FindOneWorkoutPlanUseCase } from './use-cases/find-one-workout-plan.use-case'
import { RemoveWorkoutPlanUseCase } from './use-cases/remove-workout-plan.use-case'
import { WorkoutPlanController } from './workout_plan.controller'

@Module({
  controllers: [WorkoutPlanController],
  providers: [
    WorkoutPlanRepository,
    CreateWorkoutPlanUseCase,
    FindOneWorkoutPlanUseCase,
    RemoveWorkoutPlanUseCase,
  ],
})
export class WorkoutPlanModule {}
