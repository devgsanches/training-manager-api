import { openai } from '@ai-sdk/openai'
import { Body, Controller, Post, Res, Session } from '@nestjs/common'
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserSession } from '@thallesp/nestjs-better-auth'
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from 'ai'
import type { Response } from 'express'
import { WeekDay } from 'generated/prisma/enums'
import { GetUserTrainDataUseCase } from 'src/users/use-cases/get-user-train-data.use-case'
import { UpsertUserTrainDataUseCase } from 'src/users/use-cases/upsert-user-train-data.use-case'
import type { GetAllWorkoutPlansQuery } from 'src/workout_plan/dto/workout-plan.dto'
import { CreateWorkoutPlanUseCase } from 'src/workout_plan/use-cases/create-workout-plan.use-case'
import { GetAllWorkoutPlanUseCase } from 'src/workout_plan/use-cases/get-all-workout-plans.use-case'
import z from 'zod'

import { UnauthorizedErrorResponse } from '../lib/error-responses.dto'

class AssistantBodyDto {
  messages!: UIMessage[]
}

@ApiTags('AI')
@ApiUnauthorizedResponse({ type: UnauthorizedErrorResponse })
@Controller('ai')
export class AiController {
  constructor(
    private readonly getUserTrainData: GetUserTrainDataUseCase,
    private readonly upsertUserTrainData: UpsertUserTrainDataUseCase,
    private readonly getAllWorkoutPlans: GetAllWorkoutPlanUseCase,
    private readonly createWorkoutPlan: CreateWorkoutPlanUseCase,
  ) {}

  @ApiOperation({
    summary: 'AI Assistant',
    description: 'AI Assistant.',
  })
  @Post()
  @ApiOkResponse()
  async assistant(
    @Session() session: UserSession,
    @Body() body: AssistantBodyDto,
    @Res() res: Response,
  ) {
    const { messages } = body
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: '',
      tools: {
        getUserTrainData: tool({
          description:
            'Busca os dados de treino do usuário autenticado (peso, altura, idade, % gordura). Retorna null se não houver dados cadastrados.',
          inputSchema: z.object({}),
          execute: async () => {
            return this.getUserTrainData.execute(session.user.id)
          },
        }),
        updateUserTrainData: tool({
          description:
            'Atualiza os dados de treino do usuário autenticado. O peso deve ser em gramas (converter kg * 1000).',
          inputSchema: z.object({
            weightInGrams: z
              .number()
              .describe('Peso do usuário em gramas (ex: 70kg = 70000)'),
            heightInCentimeters: z
              .number()
              .describe('Altura do usuário em centímetros'),
            age: z.number().describe('Idade do usuário'),
            bodyFatPercentage: z
              .number()
              .int()
              .min(0)
              .max(100)
              .describe('Percentual de gordura corporal (0 a 100)'),
          }),
          execute: async (params) => {
            return this.upsertUserTrainData.execute(session.user.id, params)
          },
        }),
        getWorkoutPlans: tool({
          description:
            'Lista todos os planos de treino do usuário autenticado.',
          inputSchema: z.object({}),
          execute: async () => {
            return this.getAllWorkoutPlans.execute(
              session.user.id,
              {} as GetAllWorkoutPlansQuery,
            )
          },
        }),
        createWorkoutPlan: tool({
          description: 'Cria um novo plano de treino completo para o usuário.',
          inputSchema: z.object({
            name: z.string().describe('Nome do plano de treino'),
            workoutDays: z
              .array(
                z.object({
                  name: z
                    .string()
                    .describe('Nome do dia (ex: Peito e Tríceps, Descanso)'),
                  weekDay: z.enum(WeekDay).describe('Dia da semana'),
                  isRest: z
                    .boolean()
                    .describe('Se é dia de descanso (true) ou treino (false)'),
                  estimatedDurationInSeconds: z
                    .number()
                    .describe(
                      'Duração estimada em segundos (0 para dias de descanso)',
                    ),
                  coverImageUrl: z
                    .string()
                    .url()
                    .describe(
                      'URL da imagem de capa do dia de treino. Usar as URLs de superior ou inferior conforme o foco muscular do dia.',
                    ),
                  exercises: z
                    .array(
                      z.object({
                        order: z.number().describe('Ordem do exercício no dia'),
                        name: z.string().describe('Nome do exercício'),
                        sets: z.number().describe('Número de séries'),
                        reps: z.number().describe('Número de repetições'),
                        restTimeInSeconds: z
                          .number()
                          .describe(
                            'Tempo de descanso entre séries em segundos',
                          ),
                      }),
                    )
                    .describe(
                      'Lista de exercícios (vazia para dias de descanso)',
                    ),
                }),
              )
              .describe(
                'Array com exatamente 7 dias de treino (MONDAY a SUNDAY)',
              ),
          }),
          execute: async (input) => {
            return this.createWorkoutPlan.execute({
              name: input.name,
              workoutDays: input.workoutDays,
              userId: session.user.id,
            })
          },
        }),
      },
      stopWhen: stepCountIs(5),
      messages: await convertToModelMessages(messages),
    })

    result.pipeUIMessageStreamToResponse(res)
  }
}
