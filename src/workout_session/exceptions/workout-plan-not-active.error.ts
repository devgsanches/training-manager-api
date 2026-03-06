import { HttpException, HttpStatus } from '@nestjs/common'

export class WorkoutPlanNotActiveError extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Workout Plan Not Active',
        message: 'The workout plan is not active',
      },
      HttpStatus.FORBIDDEN,
    )
  }
}
