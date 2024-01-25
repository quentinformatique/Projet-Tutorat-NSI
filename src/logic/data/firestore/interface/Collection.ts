import type { CollectionReference, QueryConstraint, QuerySnapshot } from 'firebase/firestore'
import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'

import type { Unsubscribe } from 'firebase/auth'
import type { Query } from '../firestore-types'
import { getCache, getSubCache } from '../firestore-cache'
import { FDocument } from './Document'
import type { Store } from './Store'

export class FCollection {
  public readonly store: Store
  public readonly ref: CollectionReference
  public cache: Map<string, Object>

  public doc: FDocument | undefined

  constructor(store: Store, name: string, isListen = false, q?: Query, doc?: FDocument) {
    this.store = store
    this.ref = doc ? collection(doc.ref, name) : collection(store.db, name)
    this.cache = doc ? getSubCache(doc.collection.ref.id, doc.name, name) : getCache(name)

    if (isListen) {
      const w = q && q.where ? where(q.where.param_1, q.where.comparator, q.where.param_2) : undefined
      const l = q && q.limit ? limit(q.limit) : undefined
      const o = q && q.orderBy ? orderBy(q.orderBy.name, q.orderBy.isDesc ? 'desc' : undefined) : undefined

      const params = <QueryConstraint[]> [w, l, o].filter(v => !!v)

      const qu = w || l || o ? query(this.ref, ...params) : this.ref
      onSnapshot(qu, this._onSnapshot)
    }
  }

  private _onSnapshot(querySnapshot: QuerySnapshot): void {
    querySnapshot.docChanges().forEach(({ doc }) => {
      const data = doc?.data()
      if (!data) return
      getCache(doc.ref.parent.id).set(doc.id, data)
    })
  }

  getDocument(name: string, isListen?: boolean): FDocument {
    return new FDocument(this, name, isListen)
  }

  async createDocument(data: Object, isListen?: boolean): Promise<FDocument> {
    const docRef = await addDoc(this.ref, data)
    return new FDocument(this, docRef.id, isListen)
  }

  queryDocuments(q?: Query): Promise<QuerySnapshot> {
    const w = q && q.where ? where(q.where.param_1, q.where.comparator, q.where.param_2) : undefined
    const l = q && q.limit ? limit(q.limit) : undefined
    const o = q && q.orderBy ? orderBy(q.orderBy.name, q.orderBy.isDesc ? 'desc' : undefined) : undefined

    const params = <QueryConstraint[]> [w, l, o].filter(v => !!v)

    const qu = w || l || o ? query(this.ref, ...params) : this.ref
    return getDocs(qu)
  }

  onSnapshot(callback: (snapshot: QuerySnapshot) => void, q?: Query): Unsubscribe {
    const w = q && q.where ? where(q.where.param_1, q.where.comparator, q.where.param_2) : undefined
    const l = q && q.limit ? limit(q.limit) : undefined
    const o = q && q.orderBy ? orderBy(q.orderBy.name, q.orderBy.isDesc ? 'desc' : undefined) : undefined

    const params = <QueryConstraint[]> [w, l, o].filter(v => !!v)

    const qu = w || l || o ? query(this.ref, ...params) : this.ref
    return onSnapshot(qu, callback)
  }
}
