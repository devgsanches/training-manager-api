import { Injectable } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'
import type { UpsertUserTrainDataDto } from '../dto/users.dto'

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany()
  }

  async findById(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId },
    })
  }

  async updateTrainData(userId: string, data: UpsertUserTrainDataDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        weightInGrams: data.weightInGrams,
        heightInCentimeters: data.heightInCentimeters,
        age: data.age,
        bodyFatPercentage: data.bodyFatPercentage,
      },
    })
  }
}
