import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger'
import { z } from 'zod'

// --- Zod Schemas ---

export const getHomeDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezoneOffset: z.coerce.number().int().min(-720).max(840).default(0),
  userId: z.string(),
})

export type GetHomeDataDto = z.infer<typeof getHomeDataSchema>

const consistencyDaySchema = z.object({
  workoutDayCompleted: z.boolean(),
  workoutDayStarted: z.boolean(),
})

const todayWorkoutDaySchema = z.object({
  workoutPlanId: z.string(),
  id: z.string(),
  name: z.string(),
  isRest: z.boolean(),
  weekDay: z.string(),
  estimatedDurationInSeconds: z.number(),
  coverImageUrl: z.string().optional(),
  exercisesCount: z.number(),
})

export const homeResponseSchema = z.object({
  activeWorkoutPlanId: z.string(),
  todayWorkoutDay: todayWorkoutDaySchema.nullable(),
  workoutStreak: z.number(),
  consistencyByDay: z.record(z.string(), consistencyDaySchema),
})

export type HomeResponseDto = z.infer<typeof homeResponseSchema>

// --- Scalar Docs ---

class ConsistencyDay {
  @ApiProperty({ example: true })
  workoutDayCompleted!: boolean

  @ApiProperty({ example: true })
  workoutDayStarted!: boolean
}

class TodayWorkoutDay {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  workoutPlanId!: string

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id!: string

  @ApiProperty({ example: 'Peito e Tríceps' })
  name!: string

  @ApiProperty({ example: false })
  isRest!: boolean

  @ApiProperty({ example: 'MONDAY' })
  weekDay!: string

  @ApiProperty({ example: 3600 })
  estimatedDurationInSeconds!: number

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  coverImageUrl?: string

  @ApiProperty({ example: 5 })
  exercisesCount!: number
}

@ApiExtraModels(ConsistencyDay)
export class HomeResponse {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  activeWorkoutPlanId!: string

  @ApiProperty({ type: TodayWorkoutDay, nullable: true })
  todayWorkoutDay!: TodayWorkoutDay | null

  @ApiProperty({ example: 4 })
  workoutStreak!: number

  @ApiProperty({
    example: {
      '2026-03-01': { workoutDayCompleted: true, workoutDayStarted: true },
      '2026-03-02': { workoutDayCompleted: false, workoutDayStarted: false },
    },
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(ConsistencyDay) },
  })
  consistencyByDay!: Record<
    string,
    { workoutDayCompleted: boolean; workoutDayStarted: boolean }
  >
}
