import { Injectable } from '@nestjs/common'

export interface HealthCheckResponse {
  status: string
}

@Injectable()
export class AppService {
  getHello(): HealthCheckResponse {
    return {
      status: '200',
    }
  }
}
