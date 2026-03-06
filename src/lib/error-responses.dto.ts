import { ApiProperty } from '@nestjs/swagger'

export class ValidationErrorResponse {
  @ApiProperty({ example: 400 })
  statusCode!: number

  @ApiProperty({ example: 'Bad Request' })
  error!: string

  @ApiProperty({ example: 'Validation failed' })
  message!: string
}

export class NotFoundErrorResponse {
  @ApiProperty({ example: 404 })
  statusCode!: number

  @ApiProperty({ example: 'Not Found' })
  error!: string

  @ApiProperty({ example: 'WorkoutPlan #id not found' })
  message!: string
}

export class UnauthorizedErrorResponse {
  @ApiProperty({ example: 401 })
  statusCode!: number

  @ApiProperty({ example: 'Unauthorized' })
  error!: string

  @ApiProperty({ example: 'Unauthorized' })
  message!: string
}

export class ForbiddenErrorResponse {
  @ApiProperty({ example: 403 })
  statusCode!: number

  @ApiProperty({ example: 'Forbidden' })
  error!: string

  @ApiProperty({ example: 'Forbidden' })
  message!: string
}

export class ConflictErrorResponse {
  @ApiProperty({ example: 409 })
  statusCode!: number

  @ApiProperty({ example: 'Conflict' })
  error!: string

  @ApiProperty({ example: 'Session already in progress' })
  message!: string
}
