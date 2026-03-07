import { Body, Controller, Param, Patch, Post } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'

import {
  ConflictErrorResponse,
  ForbiddenErrorResponse,
  NotFoundErrorResponse,
  UnauthorizedErrorResponse,
  ValidationErrorResponse,
} from '../lib/error-responses.dto'
import { ZodValidationPipe } from '../lib/zod-validation.pipe'
import {
  completeWorkoutSessionBodySchema,
  type CompleteWorkoutSessionDto,
  CompleteWorkoutSessionBodyDto,
  CompleteWorkoutSessionResponse,
  StartWorkoutSessionResponse,
} from './dto/workout-session.dto'
import { CompleteWorkoutSessionUseCase } from './use-cases/complete-workout-session.use-case'
import { StartWorkoutSessionUseCase } from './use-cases/start-workout-session.use-case'

@ApiTags('Workout Session')
@ApiUnauthorizedResponse({ type: UnauthorizedErrorResponse })
@Controller('workout-plan')
export class WorkoutSessionController {
  constructor(
    private readonly startWorkoutSession: StartWorkoutSessionUseCase,
    private readonly completeWorkoutSession: CompleteWorkoutSessionUseCase,
  ) {}

  @ApiOperation({
    summary: 'Start a workout session',
    description:
      'Start a workout session for a specific day of a workout plan.',
    operationId: 'startWorkoutSession',
  })
  @Post(':planId/days/:dayId/sessions')
  @ApiParam({ name: 'planId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'dayId', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @ApiCreatedResponse({ type: StartWorkoutSessionResponse })
  @ApiNotFoundResponse({ type: NotFoundErrorResponse })
  @ApiForbiddenResponse({ type: ForbiddenErrorResponse })
  @ApiConflictResponse({ type: ConflictErrorResponse })
  startSession(
    @Session() session: UserSession,
    @Param('planId') planId: string,
    @Param('dayId') dayId: string,
  ) {
    return this.startWorkoutSession.execute({
      planId,
      dayId,
      userId: session.user.id,
    })
  }

  @ApiOperation({
    summary: 'Complete a workout session',
    description: 'Complete a specific workout session by setting completedAt.',
    operationId: 'completeWorkoutSession',
  })
  @Patch(':planId/days/:dayId/sessions/:sessionId')
  @ApiParam({ name: 'planId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'dayId', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @ApiParam({ name: 'sessionId', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  @ApiBody({
    type: CompleteWorkoutSessionBodyDto,
    examples: {
      default: {
        summary: 'Concluir sessão',
        value: { completedAt: '2026-03-07T19:46:55.754Z' },
      },
    },
  })
  @ApiOkResponse({ type: CompleteWorkoutSessionResponse })
  @ApiNotFoundResponse({ type: NotFoundErrorResponse })
  @ApiForbiddenResponse({ type: ForbiddenErrorResponse })
  @ApiBadRequestResponse({ type: ValidationErrorResponse })
  completeSession(
    @Session() session: UserSession,
    @Param('planId') planId: string,
    @Param('dayId') dayId: string,
    @Param('sessionId') sessionId: string,
    @Body(new ZodValidationPipe(completeWorkoutSessionBodySchema))
    body: Pick<CompleteWorkoutSessionDto, 'completedAt'>,
  ) {
    return this.completeWorkoutSession.execute({
      ...body,
      planId,
      dayId,
      sessionId,
      userId: session.user.id,
    })
  }
}
