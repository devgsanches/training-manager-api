import { Controller, Get } from '@nestjs/common'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

import { AppService, HealthCheckResponse } from './app.service'

@Controller()
export class health_checkController {
  constructor(private readonly appService: AppService) {}

  @Get('health-check')
  @AllowAnonymous()
  hello(): HealthCheckResponse {
    return this.appService.getHello()
  }
}
