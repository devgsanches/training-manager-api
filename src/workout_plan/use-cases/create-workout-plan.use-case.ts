import { Injectable } from '@nestjs/common'

import type { CreateWorkoutPlanDto } from '../dto/create-workout_plan.dto'
import type { WorkoutPlanResponse } from '../entities/workout_plan.entity'
import { WorkoutPlanRepository } from '../repositories/workout-plan.repository'

@Injectable()
export class CreateWorkoutPlanUseCase {
  constructor(private readonly repository: WorkoutPlanRepository) {}

  async execute(dto: CreateWorkoutPlanDto): Promise<WorkoutPlanResponse> {
    const result = await this.repository.create(dto)

    return {
      id: result.id,
    }
  }
}
