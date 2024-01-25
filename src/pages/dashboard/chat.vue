<template>
  <div class="chat-container">
    <div class="chat-relations-container">
      <div class="chat-relations-title">
        Conversations
      </div>
      <div v-if="isConvsLoading" class="chat-messages-loading chat-relations-loading">
        <Loading />
        <div>
          Chargement en cours, veuillez patienter...
        </div>
      </div>
      <div v-else class="chat-relations">
        <div v-for="[k, v] in getSortedRelations()" :key="k" @click="changeActiveChat(k)" >
          <div class="chat-relation-flex">
            <div v-if="v.subjects?.length > 0">
              <div v-for="s in v.subjects" :key="s">
                {{ getSchoolLabel(s, true) }}
              </div>
            </div>
            <div v-else>
              <div>
                Premier Contact
              </div>
            </div>
            <div>
              <div v-for="userId of v.entrants.filter(uid => uid !== user.uid)" class="chat-relation-item">
                <div v-if="!publicUsers.has(userId)">
                  Utilisateur introuvable
                </div>
                <div v-else @click="redirectToProfile(userId)">
                  {{ publicUsers.get(userId).displayName }}
                </div>
              </div>
            </div>
    
          </div>
          <div v-if="activeChat === k" class="chat-relation-unread" style="background-color: var(--color-success)">
            <div i="carbon-caret-right" />
          </div>
          <div v-else-if="unreadMessages.has(k) && unreadMessages.get(k) > 0" class="chat-relation-unread">
            {{ unreadMessages.get(k) > 9 ? '+9' : unreadMessages.get(k) }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="isConvsLoading" class="chat-messages-loading">
      <Loading />
      <div>
        Chargement en cours, veuillez patienter...
      </div>
    </div>
    <div v-else-if="!activeChat || getSortedRelations().length === 0" class="chat-messages-error">
      Aucun chat n'est séléctionné !
    </div>
    <div v-else-if="!activeChat" class="chat-messages-error">
      Chat introuvable !
    </div>
    <div v-else-if="messages.has(activeChat)" class="chat-messages-container">
      <div class="chat-messages-messages">
        <div v-if="messages.get(activeChat).length > 0" class="chat-messages-info link" @click="extandMessages(activeChat)">
          Charger plus de message
        </div>
        <div v-for="[id, msg] in messages.get(activeChat)" :key="id" class="chat-message shadow" :class="{reverse: msg.author === user.uid}">
          <img :src="publicUsers.get(msg.author).avatar"/>
          <div>
            <div class="chat-message-title">
              {{ publicUsers.get(msg.author).displayName }}
            </div>
            <div class="chat-message-text">
              {{ msg.message }}
            </div>
            
          </div>
        </div>
      </div>
      <div v-if="messages.get(activeChat).length === 0" class="chat-messages-info">
        Envoyez le premier message de la conversation !
      </div>
      <div class="chat-messages-input shadow">
        <input v-model="inputContent[activeChat]" type="text" @keyup="onKeyUp" />
        <button type="submit" i="carbon-send-alt" @click="sendMessage()" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { user } from '~/logic/data/auth/auth-manager';
import { getEntrant, RelationData, RelationEntrantData, relationSetUserStatut, hasRelationLeft, extandMessages } from '~/logic/data/firestore/datas/Relations'
import { getRelations } from '~/logic/data/firestore/datas/Relations'
import { UserData } from '~/logic/data/firestore/datas/Users';
import { getSchoolLabel } from '~/logic/profil/school/school-manager'
import { getForcedUsers, getUsers } from '~/logic/data/firestore/datas/Users'
import { toggleLoadingPage } from '~/main'
import { activeChat, changeActiveChat, hasInitConvs, initConv, messages, unreadMessages, sendMessage, inputContent } from '~/logic/pages/chat';

const isConvsLoading = ref(false)
const relations = ref(new Map<string, RelationData>())
const entrants = ref(new Map<string, RelationEntrantData>())



const getSortedRelations = () => {
  const newRelations = new Map<string, RelationData>()
  for (const [k, v] of relations.value) {
    if (!hasRelationLeft(entrants.value.get(k)))
      newRelations.set(k, v)
  }
  return newRelations
}

const onKeyUp = (e) => {
  if (e.code === 'Enter')
    sendMessage()
}

const load = async () => {

  isConvsLoading.value = true
  const u = (<UserData>user.value)
  relations.value = await getRelations()
  for (const [k, _] of relations.value) {
    const entrant = await getEntrant(k, u.uid)
    if (!entrant || !entrant.statut) {
      await relationSetUserStatut(k, u.uid, { statut: 'pending', return: '' })
      entrants.value.set(k, { statut: 'pending', return: '' })
    }
    else
      entrants.value.set(k, entrant)
    if (!hasInitConvs.value.get(k))
      await initConv(k, entrant?.lastRead)
  }
  const rs = getSortedRelations()
  if (rs.size > 0)
    changeActiveChat(rs.keys().next().value)
  else
    changeActiveChat()
  isConvsLoading.value = false
}

load()

const publicUsers = ref<Map<string, UserData>>(getUsers())
if (publicUsers.value.size === 0) {
  const f = async() => {
    toggleLoadingPage(true)
    publicUsers.value = await getForcedUsers()
    toggleLoadingPage(false)
  }
  f()
}

setTimeout(() => {
  window.scrollTo({ top: 0 })
}, 100)
</script>

<style scoped>
  .chat-container {
    background-color: var(--main-background);
    color: var(--secondary-text-color);
    box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.3);
    padding: 20px;
    margin: 0 15px 15px;
    display: flex;
    height: 85vh;
  }

  .chat-relations-container {
    border-right: 1px solid #000000;
  }

  .chat-relations-title {
    font-size: 20px;
  }

  .chat-relations {
    width: 400px;
    margin-top: 20px;
    height: 90%;
    overflow-y: scroll;
  }

  .link {
    cursor: pointer;
  }

  .chat-relations > * {
    width: 90%;
    border-top: 1px solid #000000;
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

  }

  .chat-relations-loading {
    margin-top: 200px;
  }

  .chat-relation-unread {
    color: #ffffff;
    background-color: var(--color-danger);
    border-radius: 50%;
    width: 22px;
    height: 22px;
    text-align: center;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat-relation-flex {
    width: 310px;
    overflow: hidden;
  }

  .chat-relation-flex > * {
  
    background-image: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0, 0, 0, 0) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    -moz-background-clip: text;
    -moz-text-fill-color: transparent;
    display: flex;
    flex-wrap: no-wrap;
    white-space: nowrap;
    gap: 0.5rem;
  }

  .chat-messages-loading {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: 50px;
  }

  .chat-messages-error {
    color: var(--color-danger);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: 50px;
  }

  .chat-messages-container {
    width: 100%;
    margin-left: 30px;
    background-color: var(--secondary-background);
    box-shadow: inset 0 2px 7px 0 rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .shadow {
    box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.3);
  }

  .chat-messages-messages {
    overflow-y: scroll;
    margin: 10px;
    padding-bottom: 10px;
    display: flex;
    flex-direction: column;
  }

  .chat-messages-info {
    font-style: italic;
    text-align: center;
    color: var(--color-gray);
  }

  .chat-messages-input {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin: 20px; 
    padding: 5px 25px 5px 0;
    gap: 1rem;
    height: 50px;
    background-color: var(--main-background);
    border-radius: 30px;
    font-size: 18px;
  }

  .chat-messages-input > button {
    font-size: 28px;
  }

  .chat-messages-input > input {
    width: 90%;
    border: 1px solid #c4c4c4;
    border-radius: 10px;
    padding: 5px 9px;
  }

  .chat-message {
    background-color: var(--main-background);
    display: flex;
    width: fit-content;
    font-size: 18px;
    border-radius: 30px;
    padding: 5px 15px 5px 10px ;
    margin: 10px 30px 0 10px;
    max-width: 500px;
    white-space: wrap;
  }

  .chat-message > img {
    width: 30px;
    height: 30px;
    border-radius: 30px;
    position: relative;
    right: 14px;
    bottom: 7px;
  }

  .chat-message-title {
    font-size: 15px;
  }

  .reverse {
    flex-direction: row-reverse;
    padding-left: 20px;
    align-self: flex-end;
    text-align: end;
  }

  .reverse > img {
    left: 14px;
    right: 0;
    bottom: 7px;
  }

  .chat-message-text {
    overflow-wrap: break-word;
    overflow: hidden;
    max-width: 400px;
  }


</style>

<route lang="yaml">
meta:
  layout: mdash
</route>
