import { Injectable, NotFoundException } from '@nestjs/common'

import type { GetWorkoutPlanOutputDto } from '../dto/workout-plan.dto'
import { WorkoutPlanRepository } from '../repositories/workout-plan.repository'

@Injectable()
export class GetWorkoutPlanUseCase {
  constructor(private readonly repository: WorkoutPlanRepository) {}

  async execute(userId: string): Promise<GetWorkoutPlanOutputDto> {
    const activePlan = await this.repository.findOneActiveWithDays(userId)

    if (!activePlan) {
      throw new NotFoundException('No active workout plan found')
    }

    return {
      id: activePlan.id,
      name: activePlan.name,
      isActive: activePlan.isActive,
      workoutDays: activePlan.workoutDays.map((day) => ({
        id: day.id,
        name: day.name,
        weekDay: day.weekDay,
        isRest: day.isRest,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds,
        coverImageUrl: day.coverImageUrl,
        exerciseCount: day._count.exercises,
      })),
    }
  }
}
