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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
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
  })
  @Put('me')
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
  })
  @Get(':userId')
  @ApiOkResponse({ description: 'User details' })
  @ApiNotFoundResponse({ type: NotFoundErrorResponse })
  getUserById(@Param('userId') userId: string, @Req() req: Request) {
    return this.getUserByIdUseCase.execute(userId, req.headers)
  }
}
