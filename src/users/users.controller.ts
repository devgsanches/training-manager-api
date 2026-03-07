import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  type Request,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
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
  GetUserTrainDataOutputDto,
  UpsertUserTrainDataInputDto,
  upsertUserTrainDataBodySchema,
  type UpsertUserTrainDataDto,
  UpsertUserTrainDataOutputDto,
} from './dto/users.dto'
import { GetUserByIdUseCase } from './use-cases/get-user-by-id.use-case'
import { GetUserTrainDataUseCase } from './use-cases/get-user-train-data.use-case'
import { GetUsersUseCase } from './use-cases/get-users.use-case'
import { UpsertUserTrainDataUseCase } from './use-cases/upsert-user-train-data.use-case'

@ApiTags('Users')
@ApiUnauthorizedResponse({ type: UnauthorizedErrorResponse })
@Controller('users')
export class UsersController {
  constructor(
    private readonly getUserTrainData: GetUserTrainDataUseCase,
    private readonly upsertUserTrainData: UpsertUserTrainDataUseCase,
    private readonly getUsers: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  @ApiOperation({
    summary: 'Get all users (admin)',
    description:
      'Lists all users. Requires admin privileges (user ID in ADMIN_USER_IDS).',
    operationId: 'listUsers',
  })
  @Get()
  @ApiOkResponse({ description: 'List of users with pagination metadata' })
  findAll(@Req() req: Request) {
    return this.getUsers.execute(req.headers)
  }

  @ApiOperation({
    summary: 'Get authenticated user train data',
    description:
      'Returns the authenticated user profile and training data. Fields are null if not yet set.',
    operationId: 'getAuthenticatedUserTrainData',
  })
  @Get('me')
  @ApiOkResponse({ type: GetUserTrainDataOutputDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponse })
  getMe(@Session() session: UserSession) {
    return this.getUserTrainData.execute(session.user.id)
  }

  @ApiOperation({
    summary: 'Update authenticated user train data',
    description:
      'Creates or updates the training data for the authenticated user.',
    operationId: 'updateAuthenticatedUserTrainData',
  })
  @Put('me')
  @ApiBody({
    type: UpsertUserTrainDataInputDto,
    examples: {
      default: {
        summary: 'Dados de treino (70kg, 175cm, 28 anos, 18% gordura)',
        value: {
          weightInGrams: 70000,
          heightInCentimeters: 175,
          age: 28,
          bodyFatPercentage: 18,
        },
      },
    },
  })
  @ApiOkResponse({ type: UpsertUserTrainDataOutputDto })
  @ApiBadRequestResponse({ type: ValidationErrorResponse })
  updateMe(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(upsertUserTrainDataBodySchema))
    body: UpsertUserTrainDataDto,
  ) {
    return this.upsertUserTrainData.execute(session.user.id, body)
  }

  @ApiOperation({
    summary: 'Get user by ID (admin)',
    description:
      'Fetches a user by ID. Requires admin privileges (user ID in ADMIN_USER_IDS).',
    operationId: 'getUserById',
  })
  @Get(':userId')
  @ApiParam({ name: 'userId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ description: 'User details' })
  @ApiNotFoundResponse({ type: NotFoundErrorResponse })
  getUserById(@Param('userId') userId: string, @Req() req: Request) {
    return this.getUserByIdUseCase.execute(userId, req.headers)
  }
}
