import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

import { AppService, HealthCheckResponse } from './app.service'

@ApiTags('health-check')
@Controller()
export class HealthCheckController {
  constructor(private readonly appService: AppService) {}

  @Get('health-check')
  @AllowAnonymous()
  hello(): HealthCheckResponse {
    return this.appService.getHello()
  }
}
