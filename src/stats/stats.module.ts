import { Module } from '@nestjs/common'

import { StatsController } from './stats.controller'
import { GetStatsUseCase } from './use-cases/get-stats.use-case'

@Module({
  controllers: [StatsController],
  providers: [GetStatsUseCase],
})
export class StatsModule {}
