import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import type {
  CompleteWorkoutSessionDto,
  CompleteWorkoutSessionResponseDto,
} from '../dto/workout-session.dto'
import { WorkoutSessionRepository } from '../repositories/workout-session.repository'

@Injectable()
export class CompleteWorkoutSessionUseCase {
  constructor(
    private readonly workoutSessionRepository: WorkoutSessionRepository,
  ) {}

  async execute(
    dto: CompleteWorkoutSessionDto,
  ): Promise<CompleteWorkoutSessionResponseDto> {
    const { sessionId, userId, completedAt } = dto

    const session = await this.workoutSessionRepository.findOneById(sessionId)

    if (!session) {
      throw new NotFoundException(`WorkoutSession #${sessionId} not found`)
    }

    if (session.workoutDay.workoutPlan.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this workout plan')
    }

    const updated = await this.workoutSessionRepository.complete(
      sessionId,
      new Date(completedAt),
    )

    return {
      id: updated.id,
      completedAt: updated.completedAt!.toISOString(),
      startedAt: updated.startedAt.toISOString(),
    }
  }
}
