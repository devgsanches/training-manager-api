import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { z } from 'zod'

// --- Zod Schemas ---

export const getStatsQuerySchema = z.object({
  from: z.string().date(),
  to: z.string().date(),
  timezoneOffset: z.coerce.number().int().min(-720).max(840).default(0),
})

export const getStatsSchema = getStatsQuerySchema.extend({
  userId: z.string(),
})

export type GetStatsDto = z.infer<typeof getStatsSchema>

const consistencyDaySchema = z.object({
  workoutDayCompleted: z.boolean(),
  workoutDayStarted: z.boolean(),
})

export const getStatsResponseSchema = z.object({
  workoutStreak: z.number(),
  consistencyByDay: z.record(z.string(), consistencyDaySchema),
  completedWorkoutsCount: z.number(),
  conclusionRate: z.number(),
  totalTimeInSeconds: z.number(),
})

export type GetStatsResponseDto = z.infer<typeof getStatsResponseSchema>

// --- Swagger Docs ---

class ConsistencyDay {
  @ApiProperty({ example: true })
  workoutDayCompleted!: boolean

  @ApiProperty({ example: true })
  workoutDayStarted!: boolean
}

@ApiExtraModels(ConsistencyDay)
export class GetStatsOutputDto {
  @ApiProperty({ example: 5 })
  workoutStreak!: number

  @ApiProperty({
    example: {
      '2026-03-01': { workoutDayCompleted: true, workoutDayStarted: true },
      '2026-03-03': { workoutDayCompleted: false, workoutDayStarted: true },
    },
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(ConsistencyDay) },
  })
  consistencyByDay!: Record<
    string,
    { workoutDayCompleted: boolean; workoutDayStarted: boolean }
  >

  @ApiProperty({ example: 12 })
  completedWorkoutsCount!: number

  @ApiProperty({ example: 0.85 })
  conclusionRate!: number

  @ApiProperty({ example: 36000 })
  totalTimeInSeconds!: number
}
