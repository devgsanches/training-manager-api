import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

// --- Zod Schemas ---

export const startWorkoutSessionSchema = z.object({
  planId: z.string(),
  dayId: z.string(),
  userId: z.string().optional(),
})

export type StartWorkoutSessionDto = z.infer<typeof startWorkoutSessionSchema>

export const startWorkoutSessionResponseSchema = z.object({
  userWorkoutSessionId: z.string(),
})

export type StartWorkoutSessionResponseDto = z.infer<
  typeof startWorkoutSessionResponseSchema
>

export const completeWorkoutSessionBodySchema = z.object({
  completedAt: z.string().datetime(),
})

export const completeWorkoutSessionSchema =
  completeWorkoutSessionBodySchema.extend({
    planId: z.string(),
    dayId: z.string(),
    sessionId: z.string(),
    userId: z.string(),
  })

export type CompleteWorkoutSessionDto = z.infer<
  typeof completeWorkoutSessionSchema
>

export const completeWorkoutSessionResponseSchema = z.object({
  id: z.string(),
  completedAt: z.string(),
  startedAt: z.string(),
})

export type CompleteWorkoutSessionResponseDto = z.infer<
  typeof completeWorkoutSessionResponseSchema
>

// --- Swagger: Request Body ---

export class CompleteWorkoutSessionBodyDto {
  @ApiProperty({
    example: '2026-03-07T19:46:55.754Z',
    description: 'Data/hora de conclusão da sessão (ISO 8601)',
    format: 'date-time',
  })
  completedAt!: string
}

// --- Swagger: Response ---

export class StartWorkoutSessionResponse {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  userWorkoutSessionId!: string
}

export class CompleteWorkoutSessionResponse {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id!: string

  @ApiProperty({ example: '2026-02-25T19:46:55.754Z' })
  completedAt!: string

  @ApiProperty({ example: '2026-02-25T18:30:00.000Z' })
  startedAt!: string
}
