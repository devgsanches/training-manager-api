import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { type Request, type Response } from 'express'

import { AppModule } from './app.module'
import { Env } from './env'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  })

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  })

  const config = new DocumentBuilder()
    .setTitle('Training Manager API')
    .setDescription('REST API for the Training Manager application')
    .setVersion('1.0')
    .addServer('http://localhost:3333', 'Local development')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)

  app.use('/openapi.json', (_req: Request, res: Response) => {
    res.json(document)
  })

  const scalarConfig = {
    sources: [
      {
        title: 'Training Manager API',
        slug: 'training-manager-api',
        url: '/openapi.json',
      },
      {
        title: 'Auth API',
        slug: 'auth-api',
        url: '/api/auth/open-api/generate-schema',
      },
    ],
  }

  app.use('/docs', apiReference(scalarConfig as never))

  const configService = app.get<ConfigService<Env, true>>(ConfigService)
  const port = configService.get('PORT', { infer: true })

  await app.listen(port, () => {
    console.log(`Server is running on port ${port}! 🚀`)
  })
}
bootstrap().catch(console.error)
