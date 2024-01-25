import type { WhereFilterOp } from 'firebase/firestore'

export interface Query {
  where?: {
    param_1: string
    param_2: any
    comparator: WhereFilterOp
  }
  limit?: number
  orderBy?: {
    name: string
    isDesc: boolean
  }

}
