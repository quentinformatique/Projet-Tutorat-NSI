import type { Firestore } from 'firebase/firestore'
import { db } from '../../firebase'
import type { Query } from '../firestore-types'
import { FCollection } from './Collection'

export class Store {
  public readonly db: Firestore

  constructor() {
    this.db = db
  }

  getCollection(name: string, isListen?: boolean, q?: Query) {
    return new FCollection(this, name, isListen, q)
  }
}
