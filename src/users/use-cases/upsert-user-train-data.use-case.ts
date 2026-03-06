import { Injectable } from '@nestjs/common'

import type { UpsertUserTrainDataDto } from '../dto/users.dto'
import { UsersRepository } from '../repositories/users.repository'

@Injectable()
export class UpsertUserTrainDataUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(userId: string, data: UpsertUserTrainDataDto) {
    const user = await this.usersRepository.updateTrainData(userId, data)

    return {
      userId: user.id,
      userName: user.name,
      weightInGrams: user.weightInGrams!,
      heightInCentimeters: user.heightInCentimeters!,
      age: user.age!,
      bodyFatPercentage: user.bodyFatPercentage!,
    }
  }
}
