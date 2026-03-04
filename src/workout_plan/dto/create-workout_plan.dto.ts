import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

const exerciseSchema = z.object({
  order: z.number().min(0),
  name: z.string().trim().min(1),
  sets: z.number().min(1),
  reps: z.number().min(1),
  restTimeInSeconds: z.number().min(1),
})

const workoutDaySchema = z.object({
  name: z.string().trim().min(1),
  weekDay: z.enum([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ]),
  isRest: z.boolean().default(false),
  estimatedDurationInSeconds: z.number().min(1),
  coverImageUrl: z.url().optional(),
  exercises: z.array(exerciseSchema),
})

export const createWorkoutPlanSchema = z.object({
  name: z.string().trim().min(1),
  workoutDays: z.array(workoutDaySchema),
})

class WorkoutExerciseDto {
  @ApiProperty({ example: 0, minimum: 0 })
  order!: number

  @ApiProperty({ example: 'Supino Reto com Barra' })
  name!: string

  @ApiProperty({ example: 4, minimum: 1 })
  sets!: number

  @ApiProperty({ example: 10, minimum: 1 })
  reps!: number

  @ApiProperty({
    example: 90,
    minimum: 1,
    description: 'Tempo de descanso em segundos',
  })
  restTimeInSeconds!: number
}

class WorkoutDayDto {
  @ApiProperty({ example: 'Peito e Tríceps' })
  name!: string

  @ApiProperty({
    example: 'MONDAY',
    enum: [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
  })
  weekDay!: string

  @ApiProperty({ example: false, default: false })
  isRest!: boolean

  @ApiProperty({
    example: 3600,
    minimum: 1,
    description: 'Duração estimada em segundos',
  })
  estimatedDurationInSeconds!: number

  @ApiProperty({ example: 'https://example.com/cover.jpg', required: false })
  coverImageUrl?: string

  @ApiProperty({ type: [WorkoutExerciseDto] })
  exercises!: WorkoutExerciseDto[]
}

export class CreateWorkoutPlanDto {
  @ApiProperty({ example: 'Treino ABCDE - Hipertrofia' })
  name!: string

  userId!: string

  @ApiProperty({ type: [WorkoutDayDto] })
  workoutDays!: WorkoutDayDto[]
}
