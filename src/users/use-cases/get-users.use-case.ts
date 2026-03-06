import { Injectable } from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'

import { auth } from '../../lib/auth'

type RequestHeaders = Headers | Record<string, string | string[] | undefined>

type ListUsersResult = {
  users: unknown[]
  total: number
  limit?: number
  offset?: number
}

@Injectable()
export class GetUsersUseCase {
  async execute(headers: RequestHeaders): Promise<ListUsersResult> {
    const webHeaders =
      headers instanceof Headers ? headers : fromNodeHeaders(headers)
    // auth.api types don't include admin plugin at compile time
    const result = (await auth.api.listUsers({
      query: {},
      headers: webHeaders,
    })) as ListUsersResult
    return result
  }
}
