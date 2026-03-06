import { Body, Controller, Param, Patch, Post } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
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
  })
  @Post(':planId/days/:dayId/sessions')
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
  })
  @Patch(':planId/days/:dayId/sessions/:sessionId')
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
