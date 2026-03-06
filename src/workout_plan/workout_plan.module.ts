import { Module } from '@nestjs/common'

import { WorkoutPlanRepository } from './repositories/workout-plan.repository'
import { CreateWorkoutPlanUseCase } from './use-cases/create-workout-plan.use-case'
import { GetAllWorkoutPlanUseCase } from './use-cases/get-all-workout-plans.use-case'
import { GetWorkoutDayUseCase } from './use-cases/get-workout-day.use-case'
import { GetWorkoutPlanUseCase } from './use-cases/get-workout-plan.use-case'
import { RemoveWorkoutPlanUseCase } from './use-cases/remove-workout-plan.use-case'
import { WorkoutPlanController } from './workout_plan.controller'

@Module({
  controllers: [WorkoutPlanController],
  providers: [
    WorkoutPlanRepository,
    CreateWorkoutPlanUseCase,
    GetAllWorkoutPlanUseCase,
    GetWorkoutPlanUseCase,
    GetWorkoutDayUseCase,
    RemoveWorkoutPlanUseCase,
  ],
  exports: [
    WorkoutPlanRepository,
    CreateWorkoutPlanUseCase,
    GetAllWorkoutPlanUseCase,
  ],
})
export class WorkoutPlanModule {}
