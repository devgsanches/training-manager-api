import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { WorkoutPlanRepository } from '../../workout_plan/repositories/workout-plan.repository'
import type {
  StartWorkoutSessionDto,
  StartWorkoutSessionResponseDto,
} from '../dto/workout-session.dto'
import { WorkoutPlanNotActiveError } from '../exceptions/workout-plan-not-active.error'
import { WorkoutSessionRepository } from '../repositories/workout-session.repository'

@Injectable()
export class StartWorkoutSessionUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly workoutSessionRepository: WorkoutSessionRepository,
  ) {}

  async execute(
    dto: StartWorkoutSessionDto,
  ): Promise<StartWorkoutSessionResponseDto> {
    const { planId, dayId, userId } = dto

    const plan = await this.workoutPlanRepository.findOne(planId)

    if (!plan) {
      throw new NotFoundException(`WorkoutPlan #${planId} not found`)
    }

    if (plan.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this workout plan')
    }

    if (!plan.isActive) {
      throw new WorkoutPlanNotActiveError()
    }

    const day = plan.workoutDays.find((d) => d.id === dayId)

    if (!day) {
      throw new NotFoundException(`WorkoutDay #${dayId} not found`)
    }

    const activeSession =
      await this.workoutSessionRepository.findActiveByDayId(dayId)

    if (activeSession) {
      throw new ConflictException('Session already in progress for this day')
    }

    const session = await this.workoutSessionRepository.create(dayId)

    return {
      userWorkoutSessionId: session.id,
    }
  }
}
