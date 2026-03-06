import { Injectable } from '@nestjs/common'

import type {
  CreateWorkoutPlanData,
  CreateWorkoutPlanOutputDto,
} from '../dto/workout-plan.dto'
import { WorkoutPlanRepository } from '../repositories/workout-plan.repository'

@Injectable()
export class CreateWorkoutPlanUseCase {
  constructor(private readonly repository: WorkoutPlanRepository) {}

  async execute(
    dto: CreateWorkoutPlanData,
  ): Promise<CreateWorkoutPlanOutputDto> {
    const result = await this.repository.create(dto)

    return {
      id: result.id,
    }
  }
}
