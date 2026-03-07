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
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
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
  ) { }

  @ApiOperation({
    summary: 'Create a workout plan',
    description: 'Create a new workout plan.',
    operationId: 'createWorkoutPlan',
  })
  @Post()
  @ApiBody({
    type: CreateWorkoutPlanInputDto,
    examples: {
      default: {
        summary: 'Plano ABC - 3 dias/semana',
        value: {
          name: 'Treino ABC - Hipertrofia',
          workoutDays: [
            {
              name: 'Peito e Tríceps',
              weekDay: 'MONDAY',
              isRest: false,
              estimatedDurationInSeconds: 3600,
              coverImageUrl:
                'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v',
              exercises: [
                {
                  order: 0,
                  name: 'Supino Reto com Barra',
                  sets: 4,
                  reps: 10,
                  restTimeInSeconds: 90,
                },
                {
                  order: 1,
                  name: 'Supino Inclinado com Halteres',
                  sets: 3,
                  reps: 12,
                  restTimeInSeconds: 60,
                },
              ],
            },
            {
              name: 'Descanso',
              weekDay: 'TUESDAY',
              isRest: true,
              estimatedDurationInSeconds: 1,
              exercises: [],
            },
            {
              name: 'Costas e Bíceps',
              weekDay: 'WEDNESDAY',
              isRest: false,
              estimatedDurationInSeconds: 3600,
              coverImageUrl:
                'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL',
              exercises: [
                {
                  order: 0,
                  name: 'Barra Fixa',
                  sets: 4,
                  reps: 8,
                  restTimeInSeconds: 90,
                },
              ],
            },
          ],
        },
      },
    },
  })
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
    operationId: 'getActiveWorkoutPlan',
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
    operationId: 'listWorkoutPlans',
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
    operationId: 'getWorkoutDay',
  })
  @Get(':planId/days/:dayId')
  @ApiParam({ name: 'planId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiParam({ name: 'dayId', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
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
    operationId: 'removeWorkoutPlan',
  })
  @Delete(':id')
  @ApiParam({ name: 'id', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ type: RemoveWorkoutPlanOutputDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponse })
  remove(@Session() session: UserSession, @Param('id') id: string) {
    return this.removeWorkoutPlan.execute(id)
  }
}
