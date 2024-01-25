<template>
  <div class="container">
    <div class="profil" @click="redirect('profil/relation')"> 
      <div class="title">
        Mes relations
      </div>
      <div v-if="sortedRelations.request.length > 0" style="color: var(--color-danger)">
        Vous avez {{ sortedRelations.request.length }} requête(s) en attente de votre réponse !
      </div>
      <div v-else-if="sortedRelations.pending.length > 0">
        Vous avez {{ sortedRelations.pending.length }} requête(s) en attente.
      </div>
      <div v-else>
        Rien à signaler
      </div>
    </div>
    <div class="find" @click="redirect('search')">
      <div class="title">
        Trouver un tutorant
      </div>
      <div v-if="user?.school.tutorat.receiver.wish">
        Vous avez {{ getFilteredUsers().length }} propositions de partenaire pour le tutorat !
      </div>
      <div v-else>
        Vous ne souhaitez pas être tutoré !
      </div>
    </div>
    <div class="planning">
      <Schedule :options="user?.planning?.map(schedule => schedule.times)" unwatch />
    </div>
    <div class="msgs">
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
        <div v-for="[k, v] in getSortedRelations()" :key="k" @click="redirectToChat(k)" >
          <div class="chat-relation-flex">
            <div v-if="v.subjects?.length > 0">
              <div v-for="s in v.subjects" :key="s">
                {{ getSchoolLabel(s, true) }}
              </div>
            </div>
            <div v-else>
              Premier contact
            </div>
            <div>
              <div v-for="userId of v.entrants.filter(uid => uid !== user?.uid)" class="chat-relation-item">
                <div v-if="!publicUsers.has(userId)">
                  Utilisateur introuvable
                </div>
                <div v-else @click="redirectToProfile(userId)">
                  {{ publicUsers.get(userId)?.displayName }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="unreadMessages.has(k) && unreadMessages.get(k) > 0" class="chat-relation-unread">
            {{ unreadMessages.get(k) > 9 ? '+9' : unreadMessages.get(k) }}
          </div>
          <div v-else class="chat-relation-unread-empty" />
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { user } from '~/logic/data/auth/auth-manager';
import { getEntrant, RelationData, RelationEntrantData, relationSetUserStatut, hasRelationLeft, getEntrants, hasRelationAccept } from '~/logic/data/firestore/datas/Relations'
import { getRelations } from '~/logic/data/firestore/datas/Relations'
import { UserData } from '~/logic/data/firestore/datas/Users';
import { getSchoolLabel } from '~/logic/profil/school/school-manager'
import { getForcedUsers, getUsers } from '~/logic/data/firestore/datas/Users'
import { toggleLoadingPage } from '~/main'
import { changeActiveChat, hasInitConvs, initConv, unreadMessages } from '~/logic/pages/chat';
import { hasSameTimes } from '~/logic/profil/planning/planning-manager';
import { hasSameSubjects, getSameSubjects } from '~/logic/profil/school/school-manager'
import { isValidChoices } from '~/logic/profil/school/school-manager'
import { isValidPlanning } from '~/logic/profil/planning/planning-manager'

const isConvsLoading = ref(false)
const relations = ref(new Map<string, RelationData>())
const entrants = ref(new Map<string, RelationEntrantData>())
const router = useRouter()
type SortedRelationType = {
  request: [string, RelationData][]
  contact: [string, RelationData][]
  pending: [string, RelationData][]
  cancel: [string, RelationData][]
  accepted: [string, RelationData][]
}

const sortedRelations = ref<SortedRelationType>({
  request: [],
  contact: [],
  pending: [],
  cancel: [],
  accepted: [],
})
const publicUsers = ref<Map<string, UserData>>(getUsers())





const getSortedRelations = () => {
  const newRelations = new Map<string, RelationData>()
  for (const [k, v] of relations.value) {
    if (!hasRelationLeft(entrants.value.get(k)))
      newRelations.set(k, v)
  }
  return newRelations
}

const redirectToChat = (id: string) => {
  changeActiveChat(id)
  router.push('/dashboard/chat')
}

const redirect = (path: string) => {
  router.push(`/dashboard/${path}`)
}

const getFilteredUsers = () => {
  const filteredList: UserData[] = []
  const u = <UserData> user.value
  for (const [_, p] of publicUsers.value) {
    if (!u.school || !p.school || !p.planning)
      continue
    if (!isValidChoices(p.school) || !isValidPlanning(p.planning))
      continue
    if (!p.school.tutorat.helper.wish)
      continue
    if (p.uid === u.uid) 
      continue
    if (!hasSameSubjects(p.school.tutorat.helper.subjects, u.school.tutorat.receiver.subjects))
      continue
    if (p.school.level !== 'seconde' && u.school.level !== 'seconde' && u.school.level.slice(-1) !== p.school.level.slice(-1))
      continue
    if (!u.planning || !p.planning)
      continue
    if (!hasSameTimes(u.planning.map(schedule => schedule.times), p.planning.map(schedule => schedule.times)))
      continue
    const pI = p.school.level === 'seconde' ? 1 : p.school.level.startsWith('premiere') ? 2 : 3
    const uI = u.school.level === 'seconde' ? 1 : u.school.level.startsWith('premiere') ? 2 : 3
    if (pI < uI)
      continue
    filteredList.push(p)
  }
  return filteredList
}


const load = async () => {
  isConvsLoading.value = true
  const u = (<UserData>user.value)
  relations.value = await getRelations()
  for (const [k, v] of relations.value) {
    const entrant = await getEntrant(k, u.uid)
    if (!entrant || !entrant.statut) {
      await relationSetUserStatut(k, u.uid, { statut: 'pending', return: '' })
      entrants.value.set(k, { statut: 'pending', return: '' })
    }
    else
      entrants.value.set(k, entrant)
    if (!hasInitConvs.value.get(k))
      await initConv(k, entrant?.lastRead, false)

      const data = await getEntrants(k)
    if (hasRelationLeft(data.get((<UserData>user.value).uid)))
      continue
    if (v.statut === 'contact')
      sortedRelations.value.contact.push([k, v])
    else if (!hasRelationAccept(data.get((<UserData>user.value).uid)))
      sortedRelations.value.request.push([k, v])
    else if (v.entrants.some(e => !data.has(e) || data.get(e)?.statut === 'pending'))
      sortedRelations.value.pending.push([k, v])
    else
      sortedRelations.value.accepted.push([k, v])

  }
  const rs = getSortedRelations()
  if (rs.size > 0)
    changeActiveChat(rs.keys().next().value)
  else
    changeActiveChat()
  isConvsLoading.value = false
}

load()


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

.container {
  padding: 10px 0 20px 20px;
  display: flex;
  gap: 1.5rem;
  width: 100%;
  flex-wrap: wrap;

}

.container > div {
  background-color: var(--main-background);
  box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.3);
}

.planning {
  padding: 20px 30px 40px 50px;
  max-width: 900px;
  width: 92%;
  height: 620px;
}

.msgs {
  padding: 20px 10px;
  max-width: 470px;
  width: 92%;
  height: 620px;

}

.profil {
  padding: 10px 20px;
  cursor: pointer;
  width: 92%;
  max-width: 600px;
}

.find {
  padding: 10px 20px;
  cursor: pointer;
  width: 92%;
  max-width: 600px;
}

.title {
  font-size: 19px;
}

.chat-relations-title {
  font-size: 20px;
}

.chat-relations {
  
  margin-top: 20px;
  height: 90%;
  overflow-y: scroll;
}

.link {
  cursor: pointer;
}

.chat-relations > * {
  width: 95%;
  border-top: 1px solid #000000;
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

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

.chat-relation-unread-empty {
  color: #ffffff;
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
  width: 90%;
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

  .chat-relations-loading {
    margin-top: 200px;
  }


</style>

<route lang="yaml">
meta:
  layout: dash
</route>
