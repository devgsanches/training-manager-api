import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import type { GetWorkoutDayOutputDto } from '../dto/workout-plan.dto'
import { WorkoutPlanRepository } from '../repositories/workout-plan.repository'

dayjs.extend(utc)

@Injectable()
export class GetWorkoutDayUseCase {
  constructor(private readonly repository: WorkoutPlanRepository) {}

  async execute(
    planId: string,
    dayId: string,
    userId: string,
  ): Promise<GetWorkoutDayOutputDto> {
    const day = await this.repository.findDayWithExercisesAndSessions(dayId)

    if (!day || day.workoutPlanId !== planId) {
      throw new NotFoundException('Workout day not found')
    }

    if (day.workoutPlan.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this workout plan',
      )
    }

    return {
      id: day.id,
      name: day.name,
      isRest: day.isRest,
      coverImageUrl: day.coverImageUrl,
      estimatedDurationInSeconds: day.estimatedDurationInSeconds,
      weekDay: day.weekDay,
      exercises: day.exercises.map((e) => ({
        id: e.id,
        name: e.name,
        order: e.order,
        workoutDayId: e.workoutDayId,
        sets: e.sets,
        reps: e.reps,
        restTimeInSeconds: e.restTimeInSeconds,
      })),
      sessions: day.sessions.map((s) => ({
        id: s.id,
        workoutDayId: s.workoutDayId,
        startedAt: dayjs.utc(s.startedAt).format('YYYY-MM-DD'),
        ...(s.completedAt && {
          completedAt: dayjs.utc(s.completedAt).format('YYYY-MM-DD'),
        }),
      })),
    }
  }
}
