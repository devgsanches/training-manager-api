import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { z } from 'zod'

// --- Zod Schemas ---

export const upsertUserTrainDataBodySchema = z.object({
  weightInGrams: z.number().int().positive(),
  heightInCentimeters: z.number().int().positive(),
  age: z.number().int().positive(),
  bodyFatPercentage: z.number().int().min(0).max(100),
})

export type UpsertUserTrainDataDto = z.infer<
  typeof upsertUserTrainDataBodySchema
>

// --- Swagger Docs ---

export class GetUserTrainDataOutputDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  userId!: string

  @ApiProperty({ example: 'John Doe' })
  userName!: string

  @ApiPropertyOptional({ example: 85000, nullable: true })
  weightInGrams!: number | null

  @ApiPropertyOptional({ example: 180, nullable: true })
  heightInCentimeters!: number | null

  @ApiPropertyOptional({ example: 25, nullable: true })
  age!: number | null

  @ApiPropertyOptional({ example: 15, nullable: true })
  bodyFatPercentage!: number | null
}

export class UpsertUserTrainDataInputDto {
  @ApiProperty({ example: 85000 })
  weightInGrams!: number

  @ApiProperty({ example: 180 })
  heightInCentimeters!: number

  @ApiProperty({ example: 25 })
  age!: number

  @ApiProperty({ example: 15 })
  bodyFatPercentage!: number
}

export class UpsertUserTrainDataOutputDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  userId!: string

  @ApiProperty({ example: 'John Doe' })
  userName!: string

  @ApiProperty({ example: 85000 })
  weightInGrams!: number

  @ApiProperty({ example: 180 })
  heightInCentimeters!: number

  @ApiProperty({ example: 25 })
  age!: number

  @ApiProperty({ example: 15 })
  bodyFatPercentage!: number
}
