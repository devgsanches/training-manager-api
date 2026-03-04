import { PartialType } from '@nestjs/swagger'

import { CreateWorkoutPlanDto, createWorkoutPlanSchema } from './create-workout_plan.dto'

export const updateWorkoutPlanSchema = createWorkoutPlanSchema.partial()

export class UpdateWorkoutPlanDto extends PartialType(CreateWorkoutPlanDto) {}
