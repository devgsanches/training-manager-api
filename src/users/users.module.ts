import { Module } from '@nestjs/common'

import { UsersRepository } from './repositories/users.repository'
import { GetUserByIdUseCase } from './use-cases/get-user-by-id.use-case'
import { GetUserTrainDataUseCase } from './use-cases/get-user-train-data.use-case'
import { GetUsersUseCase } from './use-cases/get-users.use-case'
import { UpsertUserTrainDataUseCase } from './use-cases/upsert-user-train-data.use-case'
import { UsersController } from './users.controller'

@Module({
  controllers: [UsersController],
  providers: [
    UsersRepository,
    GetUserTrainDataUseCase,
    GetUsersUseCase,
    GetUserByIdUseCase,
    UpsertUserTrainDataUseCase,
  ],
})
export class UsersModule {}
