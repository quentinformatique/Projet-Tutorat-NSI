import type { Timestamp } from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'

import { Store } from '../interface/Store'
import { user } from '../../auth/auth-manager'
import { activeChat, isLooking, messages, unreadMessages } from '~/logic/pages/chat'

export interface RelationData {
  statut: 'ok' | 'asking' | 'canceling' | 'adm' | 'contact'
  entrants: string[]
  helpers: string[]
  receivers: string[]
  time: {
    day: string
    start: string
    end: string
  }
  subjects: string[]
}

export interface PartialRelationData {
  statut?: 'ok' | 'asking' | 'canceling' | 'adm' | 'contact'
  entrants?: string[]
  helpers?: string[]
  receivers?: string[]
  time?: {
    day?: string
    start?: string
    end?: string
  }
  subjects?: string[]
}

export interface RelationEntrantData {
  statut: 'accepted' | 'refused' | 'leaved' | 'pending' | 'abort'
  return: string
  lastRead: Timestamp
}

export interface PartialRelationEntrantData {
  statut?: 'accepted' | 'refused' | 'leaved' | 'pending' | 'abort'
  return?: string
  lastRead?: Timestamp
}

const store = new Store().getCollection('relations')
const relationsCache = new Map<string, RelationData>()

export const getRelations = async () => {
  if (relationsCache.size === 0) {
    store.onSnapshot((snapshots) => {
      snapshots.docChanges().forEach((snap) => {
        relationsCache.set(snap.doc.id, <RelationData>snap.doc.data())
      })
    }, { where: { param_1: 'entrants', comparator: 'array-contains', param_2: user.value?.uid } })
    const query = await store.queryDocuments({ where: { param_1: 'entrants', comparator: 'array-contains', param_2: user.value?.uid } })
    query.docs.forEach((doc) => {
      relationsCache.set(doc.id, <RelationData>doc.data())
    })
  }
  return relationsCache
}

export const createRelation = (data: PartialRelationData) => {
  return store.createDocument(data)
}

export const setRelation = (id: string, data: PartialRelationData) => {
  return store.getDocument(id).set(data)
}

export const relationSetUserStatut = (id: string, uid: string, data: PartialRelationEntrantData) => {
  return store.getDocument(id).getCollection('entrants').getDocument(uid).set(data)
}

export const getEntrants = async (id: string) => {
  const map = new Map<string, RelationEntrantData>()
  const q = await store.getDocument(id).getCollection('entrants').queryDocuments()
  q.forEach((snapshot) => {
    const data = <RelationEntrantData>snapshot.data()
    map.set(snapshot.id, data)
  })
  return map
}

export const getEntrant = (id: string, uid: string) => {
  return <Promise<RelationEntrantData>>store.getDocument(id).getCollection('entrants').getDocument(uid).get()
}

export const hasRelationAccept = (data?: RelationEntrantData) => {
  return !!data && data.statut === 'accepted'
}

export const hasRelationResponse = (data?: RelationEntrantData) => {
  return !!data && data.statut && data.statut !== 'pending'
}

export const hasRelationDeny = (data?: RelationEntrantData) => {
  return !!data && data.statut === 'refused'
}

export const hasRelationLeft = (data?: RelationEntrantData) => {
  return !!data && !!data.statut && data.statut !== 'accepted' && data.statut !== 'pending'
}

export const getMessages = async (id: string) => {
  const col = store.getDocument(id).getCollection('messages')
  const query = { orderBy: { name: 'timestamp', isDesc: true }, limit: 20 }
  col.onSnapshot((snapshot) => {
    const id = snapshot.docs[0]?.ref.parent.parent?.id
    if (!id)
      return
    snapshot.docChanges().forEach((doc) => {
      if (!messages.value.has(id))
        messages.value.set(id, [])
      if (!messages.value.get(id)?.some(v => v[0] === doc.doc.id))
        messages.value.get(id)?.push([doc.doc.id, <{ timestamp: Timestamp; author: string; message: string }>doc.doc.data()])
    })
    if (activeChat.value === id && isLooking.value)
      relationSetUserStatut(id, <string>user.value?.uid, { lastRead: <Timestamp>serverTimestamp() })
    else
      unreadMessages.value.set(id, (unreadMessages.value.get(id) ?? 0) + 1)
  }, query)
  const q = await col.queryDocuments(query)
  const array: [string, { timestamp: Timestamp; author: string; message: string }][] = []
  q.forEach((doc) => {
    array.push([doc.id, <{ timestamp: Timestamp; author: string; message: string }>doc.data()])
  })
  return array.reverse()
}

export const extandMessages = async (id: string) => {
  const currentArray = messages.value.get(id)
  if (!currentArray)
    return
  const col = store.getDocument(id).getCollection('messages')
  const q = await col.queryDocuments({ where: { param_1: 'timestamp', comparator: '<', param_2: currentArray[0][1].timestamp }, orderBy: { name: 'timestamp', isDesc: true }, limit: 20 })
  const array: [string, { timestamp: Timestamp; author: string; message: string }][] = []
  q.forEach((doc) => {
    array.push([doc.id, <{ timestamp: Timestamp; author: string; message: string }>doc.data()])
  })
  messages.value.set(id, array.reverse().concat(currentArray))
}

export const createMessage = async (id: string, message: string) => {
  const col = store.getDocument(id).getCollection('messages')
  col.createDocument({ timestamp: serverTimestamp(), author: <string>user.value?.uid, message })
}
