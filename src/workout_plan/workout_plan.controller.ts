import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'

import {
  ForbiddenErrorResponse,
  NotFoundErrorResponse,
  UnauthorizedErrorResponse,
  ValidationErrorResponse,
} from '../lib/error-responses.dto'
import { ZodValidationPipe } from '../lib/zod-validation.pipe'
import {
  CreateWorkoutPlanInputDto,
  CreateWorkoutPlanOutputDto,
  createWorkoutPlanSchema,
  type GetAllWorkoutPlansQuery,
  getAllWorkoutPlansQuerySchema,
  GetWorkoutDayOutputDto,
  GetWorkoutPlanOutputDto,
  RemoveWorkoutPlanOutputDto,
} from './dto/workout-plan.dto'
import { CreateWorkoutPlanUseCase } from './use-cases/create-workout-plan.use-case'
import { GetAllWorkoutPlanUseCase } from './use-cases/get-all-workout-plans.use-case'
import { GetWorkoutDayUseCase } from './use-cases/get-workout-day.use-case'
import { GetWorkoutPlanUseCase } from './use-cases/get-workout-plan.use-case'
import { RemoveWorkoutPlanUseCase } from './use-cases/remove-workout-plan.use-case'

@ApiTags('Workout Plan')
@ApiUnauthorizedResponse({ type: UnauthorizedErrorResponse })
@Controller('workout-plan')
export class WorkoutPlanController {
  constructor(
    private readonly createWorkoutPlan: CreateWorkoutPlanUseCase,
    private readonly getWorkoutPlan: GetWorkoutPlanUseCase,
    private readonly getAllWorkoutPlans: GetAllWorkoutPlanUseCase,
    private readonly getWorkoutDay: GetWorkoutDayUseCase,
    private readonly removeWorkoutPlan: RemoveWorkoutPlanUseCase,
  ) {}

  @ApiOperation({
    summary: 'Create a workout plan',
    description: 'Create a new workout plan.',
  })
  @Post()
  @ApiCreatedResponse({ type: CreateWorkoutPlanOutputDto })
  @ApiBadRequestResponse({ type: ValidationErrorResponse })
  create(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(createWorkoutPlanSchema))
    dto: CreateWorkoutPlanInputDto,
  ): Promise<CreateWorkoutPlanOutputDto> {
    return this.createWorkoutPlan.execute({
      ...dto,
      userId: session.user.id,
    })
  }

  @ApiOperation({
    summary: 'Get active workout plan',
    description:
      'Get the currently active workout plan for the logged-in user.',
  })
  @Get('active')
  @ApiOkResponse({ type: GetWorkoutPlanOutputDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponse })
  getActive(@Session() session: UserSession): Promise<GetWorkoutPlanOutputDto> {
    return this.getWorkoutPlan.execute(session.user.id)
  }

  @ApiOperation({
    summary: 'List workout plans',
    description:
      'List all workout plans. Without query params, returns all plans. Use ?active=true for active only, ?active=false for inactive only.',
  })
  @Get()
  @ApiQuery({
    name: 'active',
    required: false,
    enum: ['true', 'false'],
    description: 'Filter by active status',
  })
  @ApiOkResponse({
    description: 'List of workout plans',
    type: GetWorkoutPlanOutputDto,
    isArray: true,
  })
  findAll(
    @Session() session: UserSession,
    @Query(new ZodValidationPipe(getAllWorkoutPlansQuerySchema))
    query: GetAllWorkoutPlansQuery,
  ) {
    return this.getAllWorkoutPlans.execute(session.user.id, query)
  }

  @ApiOperation({
    summary: 'Get workout day details',
    description: 'Get a specific workout day with its exercises and sessions.',
  })
  @Get(':planId/days/:dayId')
  @ApiOkResponse({ type: GetWorkoutDayOutputDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponse })
  @ApiForbiddenResponse({ type: ForbiddenErrorResponse })
  findDay(
    @Session() session: UserSession,
    @Param('planId') planId: string,
    @Param('dayId') dayId: string,
  ): Promise<GetWorkoutDayOutputDto> {
    return this.getWorkoutDay.execute(planId, dayId, session.user.id)
  }

  @ApiOperation({
    summary: 'Remove a workout plan',
    description: 'Remove a workout plan by its ID.',
  })
  @Delete(':id')
  @ApiOkResponse({ type: RemoveWorkoutPlanOutputDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponse })
  remove(@Session() session: UserSession, @Param('id') id: string) {
    return this.removeWorkoutPlan.execute(id)
  }
}
