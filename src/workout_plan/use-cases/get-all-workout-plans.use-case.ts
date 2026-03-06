import { Injectable } from '@nestjs/common'

import type {
  GetAllWorkoutPlansOutput,
  GetAllWorkoutPlansQuery,
} from '../dto/workout-plan.dto'
import { WorkoutPlanRepository } from '../repositories/workout-plan.repository'

@Injectable()
export class GetAllWorkoutPlanUseCase {
  constructor(private readonly repository: WorkoutPlanRepository) {}

  async execute(
    userId: string,
    query: GetAllWorkoutPlansQuery,
  ): Promise<GetAllWorkoutPlansOutput> {
    const plans = await this.repository.findAll(
      userId,
      query.active ?? undefined,
    )

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      isActive: plan.isActive,
      workoutDays: plan.workoutDays.map((day) => ({
        id: day.id,
        name: day.name,
        weekDay: day.weekDay,
        isRest: day.isRest,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds,
        coverImageUrl: day.coverImageUrl,
        exerciseCount: day.exercises?.length ?? 0,
      })),
    }))
  }
}
