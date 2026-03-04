import { Test, TestingModule } from '@nestjs/testing'

import { WorkoutPlanController } from './workout_plan.controller'
import { WorkoutPlanService } from './workout_plan.service'

describe('WorkoutPlanController', () => {
  let controller: WorkoutPlanController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutPlanController],
      providers: [WorkoutPlanService],
    }).compile()

    controller = module.get<WorkoutPlanController>(WorkoutPlanController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
