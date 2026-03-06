import { Injectable, NotFoundException } from '@nestjs/common'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import type { WeekDay } from '../../../generated/prisma/client'
import { WorkoutPlanRepository } from '../../workout_plan/repositories/workout-plan.repository'
import { WorkoutSessionRepository } from '../../workout_session/repositories/workout-session.repository'
import type { GetHomeDataDto, HomeResponseDto } from '../dto/home.dto'

dayjs.extend(utc)

const WEEKDAY_MAP: Record<number, WeekDay> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
}

@Injectable()
export class GetHomeDataUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly workoutSessionRepository: WorkoutSessionRepository,
  ) {}

  async execute(dto: GetHomeDataDto): Promise<HomeResponseDto> {
    const { date, timezoneOffset, userId } = dto

    const currentDate = dayjs.utc(date)
    const currentWeekDay = WEEKDAY_MAP[currentDate.day()]

    const plan = await this.workoutPlanRepository.findOneActiveWithDays(userId)

    if (!plan) {
      throw new NotFoundException('No active workout plan found')
    }

    const todayDay = plan.workoutDays.find((d) => d.weekDay === currentWeekDay)

    const todayWorkoutDay = todayDay
      ? {
          workoutPlanId: plan.id,
          id: todayDay.id,
          name: todayDay.name,
          isRest: todayDay.isRest,
          weekDay: todayDay.weekDay,
          estimatedDurationInSeconds: todayDay.estimatedDurationInSeconds,
          coverImageUrl: todayDay.coverImageUrl ?? undefined,
          exercisesCount: todayDay._count.exercises,
        }
      : null

    const weekStart = currentDate.startOf('week').toDate()
    const weekEnd = currentDate.endOf('week').toDate()

    const sessions = await this.workoutSessionRepository.findInRange(
      userId,
      weekStart,
      weekEnd,
    )

    const sessionsByDate = new Map<
      string,
      { started: boolean; completed: boolean }
    >()

    for (const session of sessions) {
      const dateKey = this.toLocalDate(session.startedAt, timezoneOffset)
      const existing = sessionsByDate.get(dateKey) ?? {
        started: false,
        completed: false,
      }

      existing.started = true
      if (session.completedAt) {
        existing.completed = true
      }

      sessionsByDate.set(dateKey, existing)
    }

    const consistencyByDay: Record<
      string,
      { workoutDayCompleted: boolean; workoutDayStarted: boolean }
    > = {}

    for (let i = 0; i < 7; i++) {
      const day = dayjs.utc(weekStart).add(i, 'day')
      const dateKey = day.format('YYYY-MM-DD')
      const sessionData = sessionsByDate.get(dateKey)

      consistencyByDay[dateKey] = {
        workoutDayCompleted: sessionData?.completed ?? false,
        workoutDayStarted: sessionData?.started ?? false,
      }
    }

    const workoutStreak = await this.calculateStreak(
      userId,
      currentDate,
      plan,
      timezoneOffset,
    )

    return {
      activeWorkoutPlanId: plan.id,
      todayWorkoutDay,
      workoutStreak,
      consistencyByDay,
    }
  }

  private toLocalDate(utcDate: Date, timezoneOffset: number): string {
    return dayjs.utc(utcDate).utcOffset(-timezoneOffset).format('YYYY-MM-DD')
  }

  private async calculateStreak(
    userId: string,
    currentDate: dayjs.Dayjs,
    plan: Awaited<
      ReturnType<WorkoutPlanRepository['findOneActiveWithDays']>
    > & {},
    timezoneOffset: number,
  ): Promise<number> {
    const completedSessions =
      await this.workoutSessionRepository.findCompletedDesc(userId)

    const completedDates = new Set(
      completedSessions.map((s) =>
        this.toLocalDate(s.startedAt, timezoneOffset),
      ),
    )

    const nonRestPlanDays = new Set(
      plan.workoutDays.filter((d) => !d.isRest).map((d) => d.weekDay),
    )

    let streak = 0
    let day = currentDate

    for (let i = 0; i < 365; i++) {
      const dateKey = day.format('YYYY-MM-DD')
      const weekDay = WEEKDAY_MAP[day.day()]

      if (!nonRestPlanDays.has(weekDay)) {
        day = day.subtract(1, 'day')
        continue
      }

      if (completedDates.has(dateKey)) {
        streak++
      } else {
        break
      }

      day = day.subtract(1, 'day')
    }

    return streak
  }
}
