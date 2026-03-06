import { Injectable } from '@nestjs/common'

import { WorkoutPlanRepository } from '../repositories/workout-plan.repository'

@Injectable()
export class RemoveWorkoutPlanUseCase {
  constructor(private readonly repository: WorkoutPlanRepository) {}

  async execute(id: string) {
    // await this.findOne.execute(id)

    return this.repository.remove(id)
  }
}
