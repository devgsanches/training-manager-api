import { Injectable } from '@nestjs/common'

import { WorkoutPlanRepository } from '../repositories/workout-plan.repository'
import { FindOneWorkoutPlanUseCase } from './find-one-workout-plan.use-case'

@Injectable()
export class RemoveWorkoutPlanUseCase {
  constructor(
    private readonly repository: WorkoutPlanRepository,
    private readonly findOne: FindOneWorkoutPlanUseCase,
  ) {}

  async execute(id: string) {
    await this.findOne.execute(id)

    return this.repository.remove(id)
  }
}
