import { Injectable, NotFoundException } from '@nestjs/common'

import { UsersRepository } from '../repositories/users.repository'

@Injectable()
export class GetUserTrainDataUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(userId: string) {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return {
      userId: user.id,
      userName: user.name,
      weightInGrams: user.weightInGrams,
      heightInCentimeters: user.heightInCentimeters,
      age: user.age,
      bodyFatPercentage: user.bodyFatPercentage,
    }
  }
}
