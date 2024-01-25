import type * as Firebase from 'firebase/auth'
import type { PartialUserData, UserData } from '../firestore/datas/Users'
import { User } from '../firestore/datas/Users'

export const setUser = (uid: string, data: PartialUserData) => {
  const store = new User(uid)
  return store.setUser(data)
}

export const getUser = async (current: Firebase.User | null): Promise<{ result: false; error: string } | { result: true; data: UserData }> => {
  const result = current
  if (!result || !result.displayName || !result.email)
    return { result: false, error: 'result' }
  // if (!result.email.endsWith('@pedagogiefde.org'))
  //   return { result: false, error: 'email' }
  const store = new User(result.uid)
  const data = await store.getUser()
  await setUser(result.uid, { ...data, uid: result.uid, displayName: result.displayName, email: result.email, avatar: result.photoURL ?? '' })
  return { result: true, data: { ...data, uid: result.uid, displayName: result.displayName, email: result.email, avatar: result.photoURL ?? '' } }
}
