import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

import { AppService, HealthCheckResponse } from './app.service'

@ApiTags('Health Check')
@Controller()
export class HealthCheckController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Health Check',
    description: 'Check if the server is running.',
    operationId: 'healthCheck',
  })
  @Get('health-check')
  @AllowAnonymous()
  hello(): HealthCheckResponse {
    return this.appService.getHello()
  }
}
