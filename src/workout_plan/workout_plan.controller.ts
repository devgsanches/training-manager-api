import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'

import {
  NotFoundErrorResponse,
  UnauthorizedErrorResponse,
  ValidationErrorResponse,
} from '../lib/error-responses.dto'
import { ZodValidationPipe } from '../lib/zod-validation.pipe'
import {
  CreateWorkoutPlanDto,
  createWorkoutPlanSchema,
} from './dto/create-workout_plan.dto'
import { WorkoutPlanResponse } from './entities/workout_plan.entity'
import { CreateWorkoutPlanUseCase } from './use-cases/create-workout-plan.use-case'
import { FindOneWorkoutPlanUseCase } from './use-cases/find-one-workout-plan.use-case'
import { RemoveWorkoutPlanUseCase } from './use-cases/remove-workout-plan.use-case'

@ApiTags('workout-plan')
@ApiUnauthorizedResponse({ type: UnauthorizedErrorResponse })
@Controller('workout-plan')
export class WorkoutPlanController {
  constructor(
    private readonly createWorkoutPlan: CreateWorkoutPlanUseCase,
    private readonly findOneWorkoutPlan: FindOneWorkoutPlanUseCase,
    private readonly removeWorkoutPlan: RemoveWorkoutPlanUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: WorkoutPlanResponse })
  @ApiBadRequestResponse({ type: ValidationErrorResponse })
  create(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(createWorkoutPlanSchema))
    dto: CreateWorkoutPlanDto,
  ): Promise<WorkoutPlanResponse> {
    return this.createWorkoutPlan.execute({
      ...dto,
      userId: session.user.id,
    })
  }

  @Get()
  @ApiOkResponse({ type: [WorkoutPlanResponse] })
  findAll(/*@Session() session: _: UserSession*/) {
    return {
      workoutPlans: [],
    }
  }

  @Get(':id')
  @ApiOkResponse({ type: WorkoutPlanResponse })
  @ApiNotFoundResponse({ type: NotFoundErrorResponse })
  findOne(@Session() session: UserSession, @Param('id') id: string) {
    return this.findOneWorkoutPlan.execute(id)
  }

  @Delete(':id')
  @ApiOkResponse({ type: WorkoutPlanResponse })
  @ApiNotFoundResponse({ type: NotFoundErrorResponse })
  remove(@Session() session: UserSession, @Param('id') id: string) {
    return this.removeWorkoutPlan.execute(id)
  }
}
