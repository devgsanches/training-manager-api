import { Controller, Get, Param, Query } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'

import {
  NotFoundErrorResponse,
  UnauthorizedErrorResponse,
} from '../lib/error-responses.dto'
import { HomeResponse } from './dto/home.dto'
import { GetHomeDataUseCase } from './use-cases/get-home-data.use-case'

@ApiTags('Home')
@ApiUnauthorizedResponse({ type: UnauthorizedErrorResponse })
@Controller('home')
export class HomeController {
  constructor(private readonly getHomeData: GetHomeDataUseCase) {}

  @ApiOperation({
    summary: 'Get home page data',
    description:
      'Returns the authenticated user home page data for a given date, including today workout, streak and weekly consistency.',
    operationId: 'getHomeData',
  })
  @Get(':date')
  @ApiParam({
    name: 'date',
    example: '2026-03-07',
    description: 'Data no formato YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'timezoneOffset',
    required: false,
    type: Number,
    example: -180,
    description: 'Offset do fuso horário em minutos (ex: -180 = UTC-3)',
  })
  @ApiOkResponse({ type: HomeResponse })
  @ApiNotFoundResponse({ type: NotFoundErrorResponse })
  getData(
    @Session() session: UserSession,
    @Param('date') date: string,
    @Query('timezoneOffset') timezoneOffset?: string,
  ) {
    return this.getHomeData.execute({
      date,
      timezoneOffset: timezoneOffset ? Number(timezoneOffset) : 0,
      userId: session.user.id,
    })
  }
}
