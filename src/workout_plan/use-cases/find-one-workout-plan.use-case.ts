import { Injectable, NotFoundException } from '@nestjs/common'

import { WorkoutPlanRepository } from '../repositories/workout-plan.repository'

@Injectable()
export class FindOneWorkoutPlanUseCase {
  constructor(private readonly repository: WorkoutPlanRepository) {}

  async execute(id: string) {
    const plan = await this.repository.findOne(id)

    if (!plan) {
      throw new NotFoundException(`WorkoutPlan #${id} not found`)
    }

    return plan
  }
}
