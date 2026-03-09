import { Injectable, NotFoundException } from '@nestjs/common'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import type { WeekDay } from '../../../generated/prisma/client'
import { PrismaService } from '../../lib/prisma.service'
import type { GetStatsDto, GetStatsResponseDto } from '../dto/stats.dto'

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
export class GetStatsUseCase {
  constructor(private readonly prisma: PrismaService) { }

  async execute(dto: GetStatsDto): Promise<GetStatsResponseDto> {
    const { from, to, timezoneOffset, userId } = dto

    const fromDate = dayjs.utc(from).startOf('day')
    const toDate = dayjs.utc(to).endOf('day')

    const workoutPlan = await this.prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
      include: {
        workoutDays: true,
      },
    })

    if (!workoutPlan) {
      throw new NotFoundException('Active workout plan not found')
    }

    const sessions = await this.prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlanId: workoutPlan.id,
        },
        startedAt: {
          gte: fromDate.toDate(),
          lte: toDate.toDate(),
        },
      },
    })

    const consistencyByDay: Record<
      string,
      { workoutDayCompleted: boolean; workoutDayStarted: boolean }
    > = {}

    for (const session of sessions) {
      const dateKey = this.toLocalDate(session.startedAt, timezoneOffset)

      if (!consistencyByDay[dateKey]) {
        consistencyByDay[dateKey] = {
          workoutDayCompleted: false,
          workoutDayStarted: false,
        }
      }

      consistencyByDay[dateKey].workoutDayStarted = true

      if (session.completedAt) {
        consistencyByDay[dateKey].workoutDayCompleted = true
      }
    }

    const completedSessions = sessions.filter((s) => s.completedAt !== null)
    const completedWorkoutsCount = completedSessions.length
    const conclusionRate =
      sessions.length > 0 ? completedWorkoutsCount / sessions.length : 0

    const totalTimeInSeconds = completedSessions.reduce((total, session) => {
      const start = dayjs.utc(session.startedAt)
      const end = dayjs.utc(session.completedAt)
      return total + end.diff(start, 'second')
    }, 0)

    const workoutStreak = await this.calculateStreak(
      workoutPlan.id,
      workoutPlan.workoutDays,
      toDate,
      timezoneOffset,
    )

    return {
      workoutStreak,
      consistencyByDay,
      completedWorkoutsCount,
      conclusionRate,
      totalTimeInSeconds,
    }
  }

  private toLocalDate(utcDate: Date, timezoneOffset: number): string {
    return dayjs.utc(utcDate).utcOffset(-timezoneOffset).format('YYYY-MM-DD')
  }

  private async calculateStreak(
    workoutPlanId: string,
    workoutDays: Array<{ weekDay: string; isRest: boolean }>,
    currentDate: dayjs.Dayjs,
    timezoneOffset: number,
  ): Promise<number> {
    const planWeekDays = new Set(workoutDays.map((d) => d.weekDay))
    const restWeekDays = new Set(
      workoutDays.filter((d) => d.isRest).map((d) => d.weekDay),
    )

    const allSessions = await this.prisma.workoutSession.findMany({
      where: {
        workoutDay: { workoutPlanId },
        completedAt: { not: null },
      },
      select: { startedAt: true },
    })

    const completedDates = new Set(
      allSessions.map((s) => this.toLocalDate(s.startedAt, timezoneOffset)),
    )

    let streak = 0
    let day = currentDate

    for (let i = 0; i < 365; i++) {
      const weekDay = WEEKDAY_MAP[day.day()]

      if (!planWeekDays.has(weekDay)) {
        day = day.subtract(1, 'day')
        continue
      }

      if (restWeekDays.has(weekDay)) {
        day = day.subtract(1, 'day')
        continue
      }

      const dateKey = day.format('YYYY-MM-DD')
      if (completedDates.has(dateKey)) {
        streak++
        day = day.subtract(1, 'day')
        continue
      }

      if (dateKey === currentDate.format('YYYY-MM-DD')) {
        day = day.subtract(1, 'day')
        continue
      }
      break
    }

    return streak
  }
}
