import { Controller, Get, Query } from '@nestjs/common'
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'

import { UnauthorizedErrorResponse } from '../lib/error-responses.dto'
import { GetStatsOutputDto } from './dto/stats.dto'
import { GetStatsUseCase } from './use-cases/get-stats.use-case'

@ApiTags('Stats')
@ApiUnauthorizedResponse({ type: UnauthorizedErrorResponse })
@Controller('stats')
export class StatsController {
  constructor(private readonly getStats: GetStatsUseCase) {}

  @ApiOperation({
    summary: 'Get user stats',
    description:
      'Returns stats for the authenticated user within a date range, including workout streak, consistency, completion rate and total time.',
    operationId: 'getStats',
  })
  @Get()
  @ApiOkResponse({ type: GetStatsOutputDto })
  @ApiQuery({ name: 'from', type: String, example: '2026-01-01' })
  @ApiQuery({ name: 'to', type: String, example: '2026-03-05' })
  @ApiQuery({ name: 'timezoneOffset', type: Number, required: false, example: 180 })
  getStatsData(
    @Session() session: UserSession,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('timezoneOffset') timezoneOffset?: string,
  ) {
    return this.getStats.execute({
      from,
      to,
      timezoneOffset: timezoneOffset ? Number(timezoneOffset) : 0,
      userId: session.user.id,
    })
  }
}
