import { Injectable } from '@nestjs/common'

import type { WeekDay } from '../../../generated/prisma/client'
import { PrismaService } from '../../lib/prisma.service'
import type {
  CreateWorkoutPlanData,
  UpdateWorkoutPlanInputDto,
} from '../dto/workout-plan.dto'

const workoutPlanInclude = {
  workoutDays: {
    include: {
      exercises: { orderBy: { order: 'asc' as const } },
    },
  },
}

@Injectable()
export class WorkoutPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkoutPlanData) {
    const { userId } = dto

    const existsPlanActive = await this.findOneActive(userId)

    return this.prisma.$transaction(async (tx) => {
      if (existsPlanActive) {
        await tx.workoutPlan.update({
          where: { id: existsPlanActive.id },
          data: { isActive: false },
        })
      }

      return tx.workoutPlan.create({
        data: {
          name: dto.name,
          userId,
          workoutDays: {
            create: dto.workoutDays.map((day) => ({
              name: day.name,
              weekDay: day.weekDay as WeekDay,
              isRest: day.isRest,
              estimatedDurationInSeconds: day.estimatedDurationInSeconds,
              coverImageUrl: day.coverImageUrl,
              exercises: {
                create: day.exercises.map((exercise) => ({
                  order: exercise.order,
                  name: exercise.name,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restTimeInSeconds: exercise.restTimeInSeconds,
                })),
              },
            })),
          },
        },
        include: workoutPlanInclude,
      })
    })
  }

  async findOneActive(userId: string) {
    return this.prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
    })
  }

  async findOneActiveWithDays(userId: string) {
    return this.prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
      include: {
        workoutDays: {
          include: {
            _count: { select: { exercises: true } },
          },
        },
      },
    })
  }

  async findDayWithExercisesAndSessions(dayId: string) {
    return this.prisma.workoutDay.findFirst({
      where: { id: dayId },
      include: {
        exercises: { orderBy: { order: 'asc' as const } },
        sessions: { orderBy: { startedAt: 'desc' as const } },
        workoutPlan: { select: { userId: true } },
      },
    })
  }

  async findAll(userId: string, active?: boolean) {
    return this.prisma.workoutPlan.findMany({
      where: { userId, isActive: active ?? undefined },
      include: workoutPlanInclude,
    })
  }

  async findOne(id: string) {
    return this.prisma.workoutPlan.findFirst({
      where: { id },
      include: workoutPlanInclude,
    })
  }

  async update(id: string, dto: UpdateWorkoutPlanInputDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.workoutDays) {
        await tx.workoutDay.deleteMany({ where: { workoutPlanId: id } })
      }

      return tx.workoutPlan.update({
        where: { id },
        data: {
          name: dto.name,
          ...(dto.workoutDays && {
            workoutDays: {
              create: dto.workoutDays.map((day) => ({
                name: day.name,
                weekDay: day.weekDay as WeekDay,
                isRest: day.isRest ?? false,
                estimatedDurationInSeconds: day.estimatedDurationInSeconds,
                coverImageUrl: day.coverImageUrl,
                exercises: {
                  create: day.exercises.map((exercise) => ({
                    order: exercise.order,
                    name: exercise.name,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    restTimeInSeconds: exercise.restTimeInSeconds,
                  })),
                },
              })),
            },
          }),
        },
        include: workoutPlanInclude,
      })
    })
  }

  async remove(id: string) {
    return this.prisma.workoutPlan.delete({
      where: { id },
    })
  }
}
