import { Injectable } from '@nestjs/common'

import type { WeekDay } from '../../../generated/prisma/client'
import { PrismaService } from '../../lib/prisma.service'
import type { CreateWorkoutPlanDto } from '../dto/create-workout_plan.dto'
import type { UpdateWorkoutPlanDto } from '../dto/update-workout_plan.dto'

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

  async create(dto: CreateWorkoutPlanDto) {
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

  async findAll(userId: string) {
    return this.prisma.workoutPlan.findMany({
      where: { userId },
      include: workoutPlanInclude,
    })
  }

  async findOne(id: string) {
    return this.prisma.workoutPlan.findFirst({
      where: { id },
      include: workoutPlanInclude,
    })
  }

  async update(id: string, dto: UpdateWorkoutPlanDto) {
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
