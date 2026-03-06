import { Injectable } from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'

import { auth } from '../../lib/auth'

type RequestHeaders =
  | Headers
  | Record<string, string | string[] | undefined>

@Injectable()
export class GetUserByIdUseCase {
  async execute(userId: string, headers: RequestHeaders) {
    const webHeaders =
      headers instanceof Headers ? headers : fromNodeHeaders(headers)
    return auth.api.getUser({
      query: { id: userId },
      headers: webHeaders,
    })
  }
}
