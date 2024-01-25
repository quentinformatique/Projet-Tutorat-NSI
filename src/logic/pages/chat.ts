import type { Timestamp } from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'
import { user } from '../data/auth/auth-manager'
import { createMessage, getMessages, relationSetUserStatut } from '../data/firestore/datas/Relations'
import type { UserData } from '../data/firestore/datas/Users'

export const activeChat = ref('')
export const messages = ref(new Map<string, [string, { timestamp: Timestamp; author: string; message: string }][]>())
export const hasInitConvs = ref(new Map<string, boolean>())
export const unreadMessages = ref<Map<string, number>>(new Map<string, number>())
export const inputContent = reactive({})
export const isLooking = ref(true)

export const changeActiveChat = (id?: string, read = true) => {
  activeChat.value = id ?? ''
  if (!id)
    return
  if (read) {
    isLooking.value = true
    unreadMessages.value.set(id, 0)
    relationSetUserStatut(id, (<UserData>user.value).uid, { lastRead: <Timestamp>serverTimestamp() })
  }
  else { isLooking.value = false }
}

export const initConv = async (id: string, lastRead?: Timestamp, read = true) => {
  hasInitConvs.value.set(id, true)
  if (!activeChat.value)
    changeActiveChat(id, read)
  messages.value.set(id, await getMessages(id))
  unreadMessages.value.set(id, 0)
  messages.value.get(id)?.forEach(([, message]) => {
    if (!lastRead || message.timestamp.toMillis() > lastRead.toMillis())
      unreadMessages.value.set(id, (unreadMessages.value.get(id) ?? 0) + 1)
  })
  return true
}

export const sendMessage = () => {
  if (!inputContent[activeChat.value])
    return
  createMessage(activeChat.value, <string>inputContent[activeChat.value])
  inputContent[activeChat.value] = ''
}
