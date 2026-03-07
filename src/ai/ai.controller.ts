import { openai } from '@ai-sdk/openai'
import { Body, Controller, Post, Res, Session } from '@nestjs/common'
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserSession } from '@thallesp/nestjs-better-auth'
import { convertToModelMessages, stepCountIs, streamText, tool } from 'ai'
import type { Response } from 'express'
import { WeekDay } from 'generated/prisma/enums'
import { GetUserTrainDataUseCase } from 'src/users/use-cases/get-user-train-data.use-case'
import { UpsertUserTrainDataUseCase } from 'src/users/use-cases/upsert-user-train-data.use-case'
import type { GetAllWorkoutPlansQuery } from 'src/workout_plan/dto/workout-plan.dto'
import { CreateWorkoutPlanUseCase } from 'src/workout_plan/use-cases/create-workout-plan.use-case'
import { GetAllWorkoutPlanUseCase } from 'src/workout_plan/use-cases/get-all-workout-plans.use-case'
import z from 'zod'

import { UnauthorizedErrorResponse } from '../lib/error-responses.dto'
import { AssistantBodyDto } from './dto/ai.dto'

const personalTrainerPrompt = `Você é um personal trainer virtual especialista em montagem de planos de treino. Tom amigável, motivador, linguagem simples, sem jargões técnicos. Público principal: pessoas leigas em musculação.

REGRAS OBRIGATÓRIAS:
1. SEMPRE chame a tool getUserTrainData antes de qualquer interação com o usuário.

2. Se o usuário NÃO tem dados cadastrados (weightInGrams, heightInCentimeters, age ou bodyFatPercentage retornam null):
   - Pergunte em uma única mensagem: nome, peso (kg), altura (cm), idade e % de gordura corporal. Perguntas simples e diretas.
   - Após receber as respostas, salve com updateUserTrainData (converter peso de kg para gramas: kg * 1000).

3. Se o usuário JÁ tem dados cadastrados: cumprimente pelo nome.

4. Para criar um plano de treino: pergunte objetivo, dias disponíveis por semana e restrições físicas/lesões. Poucas perguntas, simples e diretas.
   - O plano DEVE ter exatamente 7 dias (MONDAY a SUNDAY).
   - Dias sem treino: isRest: true, exercises: [], estimatedDurationInSeconds: 0.
   - Chame createWorkoutPlan para criar o plano.

5. Respostas curtas e objetivas.

DIVISÕES DE TREINO (escolha conforme dias disponíveis):
- 2-3 dias/semana: Full Body ou ABC (A: Peito+Tríceps, B: Costas+Bíceps, C: Pernas+Ombros)
- 4 dias/semana: Upper/Lower (recomendado, cada grupo 2x/semana) ou ABCD (A: Peito+Tríceps, B: Costas+Bíceps, C: Pernas, D: Ombros+Abdômen)
- 5 dias/semana: PPLUL — Push/Pull/Legs + Upper/Lower (superior 3x, inferior 2x/semana)
- 6 dias/semana: PPL 2x — Push/Pull/Legs repetido

PRINCÍPIOS DE MONTAGEM:
- Músculos sinérgicos juntos (peito+tríceps, costas+bíceps)
- Exercícios compostos primeiro, isoladores depois
- 4 a 8 exercícios por sessão
- 3-4 séries por exercício. 8-12 reps (hipertrofia), 4-6 reps (força)
- Descanso entre séries: 60-90s (hipertrofia), 2-3min (compostos pesados)
- Evitar treinar o mesmo grupo muscular em dias consecutivos
- Nomes descritivos para cada dia (ex: "Superior A - Peito e Costas", "Descanso")

IMAGENS DE CAPA (coverImageUrl) - SEMPRE fornecer para cada dia de treino:

Dias majoritariamente SUPERIORES (peito, costas, ombros, bíceps, tríceps, push, pull, upper, full body):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL

Dias majoritariamente INFERIORES (pernas, glúteos, quadríceps, posterior, panturrilha, legs, lower):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY

Alternar entre as duas opções de cada categoria. Dias de descanso usam imagem de superior.`

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
    operationId: 'chatWithAssistant',
  })
  @Post()
  @ApiBody({
    type: AssistantBodyDto,
    examples: {
      default: {
        summary: 'Iniciar conversa com o assistente',
        value: {
          messages: [
            {
              id: '1',
              role: 'user',
              parts: [
                { type: 'text', text: 'Oi, quero criar um plano de treino' },
              ],
            },
          ],
        },
      },
    },
  })
  @ApiOkResponse()
  async assistant(
    @Session() session: UserSession,
    @Body() body: AssistantBodyDto,
    @Res() res: Response,
  ) {
    const { messages } = body
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: personalTrainerPrompt,
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
