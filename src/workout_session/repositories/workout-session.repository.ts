import { Injectable } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class WorkoutSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByDayId(workoutDayId: string) {
    return this.prisma.workoutSession.findFirst({
      where: { workoutDayId, completedAt: null },
    })
  }

  async findOneById(id: string) {
    return this.prisma.workoutSession.findFirst({
      where: { id },
      include: {
        workoutDay: {
          include: {
            workoutPlan: true,
          },
        },
      },
    })
  }

  async create(workoutDayId: string) {
    return this.prisma.workoutSession.create({
      data: {
        workoutDayId,
        startedAt: new Date(),
      },
    })
  }

  async complete(id: string, completedAt: Date) {
    return this.prisma.workoutSession.update({
      where: { id },
      data: { completedAt },
    })
  }

  async findInRange(userId: string, start: Date, end: Date) {
    return this.prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: { userId },
        },
        startedAt: { gte: start, lte: end },
      },
    })
  }

  async findCompletedDesc(userId: string) {
    return this.prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: { userId, isActive: true },
        },
        completedAt: { not: null },
      },
      include: { workoutDay: true },
      orderBy: { startedAt: 'desc' },
    })
  }
}
