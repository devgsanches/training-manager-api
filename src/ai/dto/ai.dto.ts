import { ApiProperty } from '@nestjs/swagger'
import type { UIMessage } from 'ai'

export class AssistantMessageDto {
  @ApiProperty({
    example: 'msg_abc123',
    description: 'ID único da mensagem',
  })
  id!: string

  @ApiProperty({
    enum: ['user', 'assistant', 'system'],
    description: 'Quem enviou a mensagem',
  })
  role!: 'user' | 'assistant' | 'system'

  @ApiProperty({
    description:
      'Array de partes da mensagem (formato useChat do Vercel AI SDK)',
    example: [{ type: 'text', text: 'Oi, quero criar um plano de treino' }],
  })
  parts!: Array<{ type: 'text'; text: string }>
}

export class AssistantBodyDto {
  @ApiProperty({
    type: [AssistantMessageDto],
    description:
      'Histórico de mensagens da conversa. Formato useChat do Vercel AI SDK.',
    example: [
      {
        id: '1',
        role: 'user',
        parts: [{ type: 'text', text: 'Oi, quero criar um plano de treino' }],
      },
    ],
  })
  messages!: UIMessage[]
}
