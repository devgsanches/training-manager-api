import { ApiProperty, PartialType } from '@nestjs/swagger'
import { z } from 'zod'

// --- Zod Schemas ---

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

export const updateWorkoutPlanSchema = createWorkoutPlanSchema.partial()

// --- Get All ---

export const getAllWorkoutPlansQuerySchema = z.object({
  active: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) =>
      v === 'true' ? true : v === 'false' ? false : undefined,
    ),
})

export type GetAllWorkoutPlansQuery = z.infer<
  typeof getAllWorkoutPlansQuerySchema
>

export type GetAllWorkoutPlansOutput = GetWorkoutPlanOutputDto[]

// --- Swagger: Input (nested) ---

class ExerciseInputDto {
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

class WorkoutDayInputDto {
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

  @ApiProperty({ type: [ExerciseInputDto] })
  exercises!: ExerciseInputDto[]
}

// --- Create ---

export class CreateWorkoutPlanInputDto {
  @ApiProperty({ example: 'Treino ABCDE - Hipertrofia' })
  name!: string

  @ApiProperty({ type: [WorkoutDayInputDto] })
  workoutDays!: WorkoutDayInputDto[]
}

export class CreateWorkoutPlanOutputDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id!: string
}

// --- Get ---

class WorkoutDayOutputDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id!: string

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

  @ApiProperty({ example: false })
  isRest!: boolean

  @ApiProperty({
    example: 3600,
    minimum: 1,
    description: 'Duração estimada em segundos',
  })
  estimatedDurationInSeconds!: number

  @ApiProperty({
    example: 'https://example.com/cover.jpg',
    required: false,
    nullable: true,
  })
  coverImageUrl!: string | null

  @ApiProperty({ example: 5 })
  exerciseCount!: number
}

export class GetWorkoutPlanOutputDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id!: string

  @ApiProperty({ example: 'Treino ABCDE - Hipertrofia' })
  name!: string

  @ApiProperty({ example: true })
  isActive!: boolean

  @ApiProperty({ type: [WorkoutDayOutputDto] })
  workoutDays!: WorkoutDayOutputDto[]
}

// --- Get Workout Day ---

class WorkoutDayExerciseOutputDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id!: string

  @ApiProperty({ example: 'Supino Reto com Barra' })
  name!: string

  @ApiProperty({ example: 0, minimum: 0 })
  order!: number

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  workoutDayId!: string

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

class WorkoutDaySessionOutputDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id!: string

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  workoutDayId!: string

  @ApiProperty({ example: '2026-03-05' })
  startedAt!: string

  @ApiProperty({ example: '2026-03-05', required: false })
  completedAt?: string
}

export class GetWorkoutDayOutputDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id!: string

  @ApiProperty({ example: 'Peito e Tríceps' })
  name!: string

  @ApiProperty({ example: false })
  isRest!: boolean

  @ApiProperty({
    example: 'https://example.com/cover.jpg',
    required: false,
    nullable: true,
  })
  coverImageUrl!: string | null

  @ApiProperty({
    example: 3600,
    minimum: 1,
    description: 'Duração estimada em segundos',
  })
  estimatedDurationInSeconds!: number

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

  @ApiProperty({ type: [WorkoutDayExerciseOutputDto] })
  exercises!: WorkoutDayExerciseOutputDto[]

  @ApiProperty({ type: [WorkoutDaySessionOutputDto] })
  sessions!: WorkoutDaySessionOutputDto[]
}

// --- Update ---

export class UpdateWorkoutPlanInputDto extends PartialType(
  CreateWorkoutPlanInputDto,
) {}

// --- Remove ---

export class RemoveWorkoutPlanOutputDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id!: string
}

// --- Internal types (repository) ---

export type CreateWorkoutPlanData = CreateWorkoutPlanInputDto & {
  userId: string
}
