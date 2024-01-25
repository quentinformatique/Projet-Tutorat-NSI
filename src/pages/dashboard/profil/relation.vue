<template>
  <div>
    <div class="relation-title">
      Mes Relations 
    </div>
    <div>
      <div class="relation-global">
        <div v-if="sortedRelations.request.length > 0" style="color: var(--color-danger)">
          Vous avez {{ sortedRelations.request.length }} requête(s) en attente de votre réponse !
        </div>
        <div v-if="sortedRelations.pending.length > 0">
          Vous avez {{ sortedRelations.pending.length }} requête(s) en attente de la réponse de quelqu'un d'autre.
        </div>
        <div v-if="sortedRelations.cancel.length > 0">
          Vous avez {{ sortedRelations.cancel.length }} relation(s) en attente de suppression.
        </div>
      </div>
      <div v-if="[...sortedRelations.request, ...sortedRelations.contact, ...sortedRelations.pending, ...sortedRelations.cancel, ...sortedRelations.accepted].length === 0" class="relation-no-one">
        <div style="color: var(--color-danger)">
          Vous n'avez aucune relation pour l'instant, vous pouvez demander une relation pour être tutoré  ici :
        </div>
        <div>
          <Button id="find" label="Trouver un tutorant" styles="blurple" :options="{ disabled: !!isLoading }" @click="redirectToProfile('')" />
        </div>
      </div>
      <div v-else class="relation-users">
        <div v-for="[k, v] of [...sortedRelations.request, ...sortedRelations.contact, ...sortedRelations.pending, ...sortedRelations.cancel, ...sortedRelations.accepted]">
          <div class="relation-user-title">
            <div v-if="sortedRelations.request.map(([key, value]) => key).includes(k)" style="color: var(--color-danger)">
              En attente de votre réponse !
            </div>
            <div v-else-if="sortedRelations.contact.map(([key, value]) => key).includes(k)" style="color: var(--color-danger)">
              En attente de la suite de la relation !
            </div>
            <div v-else-if="sortedRelations.pending.map(([key, value]) => key).includes(k)" style="color: var(--color-orange)">
              En attente de la réponse de quelqu'un.
            </div>
            <div v-else-if="sortedRelations.cancel.map(([key, value]) => key).includes(k)" style="color: var(--color-danger)">
              En cours de suppression !
            </div>
            <div v-else-if="sortedRelations.accepted.map(([key, value]) => key).includes(k)" style="color: var(--color-success)">
              Tutorat en cours !
            </div>
          </div>
          <div class="relation-user-infos">
            <div class="relation-user-infos-list">
              <div v-if="v.subjects?.length > 0">
                <LabelValues label="Matière(s)" :value="v.subjects" prefix />
              </div>
              <div>
                <div>
                  Participants :
                </div>
                <div class="relation-user-infos-list-sub-value">
                  <div v-for="userId of v.entrants" :style="`color: ${!sortedRelations.contact.map(([key, value]) => key).includes(k) && getAdd(k, userId) ? getAdd(k, userId) !== ' ( N\'a pas répondu )' ? 'var(--color-danger)' : 'var(--color-orange)' : ''}`">
                    <div v-if="userId === user?.uid">
                      - Vous | {{ v.helpers.includes(userId) ? 'Tutorant' : 'Tutoré(e)' }}{{ sortedRelations.contact.map(([key, value]) => key).includes(k) ? '' : getAdd(k, userId) }}
                    </div>
                    <div v-else-if="!publicUsers.get(userId)">
                      - Utilisateur introuvable {{ userId }} | {{ v.helpers.includes(userId) ? 'Tutorant' : 'Tutoré(e)' }}{{ sortedRelations.contact.map(([key, value]) => key).includes(k) ? '' : getAdd(k, userId) }}
                    </div>
                    <div v-else @click="redirectToProfile(userId)" class="relation-user-link">
                      - {{ publicUsers.get(userId)?.displayName }} | {{ v.helpers.includes(userId) ? 'Tutorant' : 'Tutoré(e)' }}{{ sortedRelations.contact.map(([key, value]) => key).includes(k) ? '' : getAdd(k, userId) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="v.time">
                Le {{  v.time.day }} de {{ v.time.start }} à {{ v.time.end }}
            </div>
          </div>
          <div class="relation-user-buttons">
            <div v-if="sortedRelations.request.map(([key, value]) => key).includes(k)">
              <Button id="accept" label="Accepter" styles="success" :options="{ disabled: !!isLoading }" :loading="`accept-${k}` === isLoading" @click="relationAccept(k)" />
              <Button id="deny" label="Refuser" styles="danger" :options="{ disabled: !!isLoading }" :loading="`deny-${k}` === isLoading" @click="relationDeny(k)" />
            </div>
            <div v-else-if="sortedRelations.contact.map(([key, value]) => key).includes(k) && v.receivers.includes(user?.uid || '')">
              <Button id="create" label="Créer une relation" styles="success" :options="{ disabled: !!isLoading || isDeleting === k || isAdding === k || isCreating === k }" :loading="`create-${k}` === isLoading" @click="initCreate(k)" />
              <Button id="abort" label="Supprimer la relation" styles="danger" :options="{ disabled: !!isLoading || isDeleting === k || isAdding === k || isCreating === k }" :loading="`abort-${k}` === isLoading" @click="relationAbort(k)" />
            </div>
            <div v-else-if="!sortedRelations.contact.map(([key, value]) => key).includes(k)">
              <Button id="delete" label="Quitter la relation" styles="danger" :options="{ disabled: isDeleting === k || !!isLoading || isAdding === k }" @click="() => { textDeleteModel = ''; isDeleting = k; isAdding = ''; isCreating = '' }" />
            </div>
            
            <div v-if="![...sortedRelations.request, ...sortedRelations.contact].map(([key, value]) => key).includes(k)">
              <Button id="add" label="Ajouter quelqu'un à la relation" styles="blurple" :options="{ disabled: !!isLoading || isDeleting === k || isAdding === k }" @click="() => { addModel = {tutorant: false, text: ''}; isAdding = k; isDeleting = ''; isCreating = ''; addReturn = '' }" />
            </div>
            
            <div>
              <Button id="chat" label="Aller sur le chat" styles="blurple" :options="{ disabled: !!isLoading }" @click="chatRedirect(k)" />
            </div>
          </div>
          <div v-if="isDeleting === k" class="relation-user-delete">
            <div>
              <div>
                Veuillez expliquer la raison de votre choix
              </div>
              <div>
                <textarea v-model="textDeleteModel" class="relation-delete-text-area" />
              </div>
            </div>
            <div class="relation-user-delete-buttons">
              <Button id="undo" label="Annuler" styles="blurple" :options="{ disabled: !!isLoading }" @click="() => { textDeleteModel = ''; isDeleting = '' }" />
              <Button id="delete-final" label="Quitter la relation" styles="danger" :options="{ disabled: !textDeleteModel || !!isLoading }" :loading="`delete-${k}` === isLoading" @click="relationDelete(k)" />
            </div>
          </div>
          <div v-else-if="isAdding === k" class="relation-user-delete">
            <div>
              <Checkbox id="add-tutorant" v-model="addModel.tutorant" styles="blurple" label="Est-ce un tutorant ? ( une personne qui donnera de l'aide )" />
            </div>
            <div>
              <div>
                Veuillez entrer l'adresse mail de le personne ( exemple@pedagogiefde.org )
              </div>
              <div>
                <input type="text" v-model="addModel.text" class="relation-delete-text-area" />
              </div>
            </div>
            <div v-if="addReturn" class="cal-val-return">
              {{ addReturn }}
            </div>
            <div class="relation-user-delete-buttons">
              <Button id="undo" label="Annuler" styles="blurple" :options="{ disabled: !!isLoading }" @click="() => { addModel = {tutorant: false, text: ''}; isAdding = '' }" />
              <Button id="add-final" label="Ajouter la personne" styles="success" :options="{ disabled: !addModel.text || !addModel.text.endsWith('@pedagogiefde.org') || !!isLoading }" :loading="`add-${k}` === isLoading" @click="relationAdd(k)" />
            </div>
          </div>
          <div v-else-if="isCreating === k" class="search-user-choices">
            <div class="search-user-selects">
              <div class="search-user-selects-title">
                Veuillez selectionner l'horaire souhaité
              </div>
              <div class="search-user-selects-selects">
                <div class="search-user-selects-selects-time">
                  <div>
                  <Select id="day" v-model="model.day" label="Jour" :options="getRightTimes(k, model)[0]" :required="false" />
                </div>
                <div :class="{timeError: !isLegalTime(model, undefined)}">
                  <Select id="start" v-model="model.start" label="Début" :options="getRightTimes(k, model)[1]" :required="false" />
                </div>
                <div :class="{timeError: !isLegalTime(undefined, model)}">
                  <Select id="end" v-model="model.end" label="Fin" :options="getRightTimes(k, model)[2]" :required="false" />
                </div>
                </div>
                <!-- Les options après doivent être remplacés par une fonction :) -->
                <Select
                  id="receive"
                  v-model="model.subjects"
                  label="Matières dans lesquels vous voulez recevoir de l'aide"
                  :options="user?.school.tutorat.receiver.subjects.filter(e => publicUser?.school.tutorat.helper.subjects.includes(e)).map(e => { return { label: getSchoolLabel(e, true), value: e}}) ?? []"
                  tags
                  search
                  :required="false"
                />
              </div>
            </div>
            <div v-if="addReturn" class="cal-val-return">
              {{ addReturn }}
            </div>
            <div class="search-user-choices-buttons">
              <Button id="resign" label="Abandonner" styles="danger" :options="{disabled: isLoading === `create-end-${k}`}" @click="resetModel" />
              <Button id="confirm" label="Confirmer la demande de tutorat" styles="success" :options="{disabled: false}" :loading="isLoading === `create-end-${k}`" @click="relationCreate(k)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { user } from '~/logic/data/auth/auth-manager'
import { getEntrants, hasRelationDeny, RelationData, relationSetUserStatut, setRelation } from '~/logic/data/firestore/datas/Relations'
import { getRelations, hasRelationAccept, hasRelationLeft, hasRelationResponse } from '~/logic/data/firestore/datas/Relations'
import { getForcedUsers, getUsers, UserData } from '~/logic/data/firestore/datas/Users';
import { changeActiveChat } from '~/logic/pages/chat';
import { hasEnoughRange } from '~/logic/pages/login/planning.login';
import { days, detailedTimes, getSameTimes, setTutoratSchedule } from '~/logic/profil/planning/planning-manager';
import { getSchoolLabel } from '~/logic/profil/school/school-manager';
import { toggleLoadingPage } from '~/main';

const relations = ref<Map<string, RelationData>>()
const publicUsers = ref<Map<string, UserData>>(getUsers())
const isDeleting = ref('')
const isAdding = ref('')
const isCreating = ref('')
const isLoading = ref('')
const textDeleteModel = ref('')
const addModel = ref({ tutorant: false, text: '' })
const addReturn = ref('')
const router = useRouter()
const relationAdds = ref<Map<string, Map<string, string>>>(new Map<string, Map<string, string>>())
const model = reactive({ day: '', start: '', end: '', subjects: [] })
const publicUser = ref<UserData>()
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

const redirectToProfile = (uid: string) => {
  router.push(`/dashboard/search/${uid}`)
}

const chatRedirect = (id: string) => {
  changeActiveChat(id)
  router.push('/dashboard/chat')
}

const relationAccept = async (id: string) => {
  const r = relations.value?.get(id)?.time
  if (!r) return
  isLoading.value = `accept-${id}`
  await setTutoratSchedule(r.day, r.start, r.end, 'tutorat')
  await relationSetUserStatut(id, (<UserData>user.value).uid, { statut: 'accepted' })
  await load()
  isLoading.value = ''
}

const relationDeny = async (id: string) => {
  isLoading.value = `deny-${id}`
  await relationSetUserStatut(id, (<UserData>user.value).uid, { statut: 'refused' })
  await load()
  isLoading.value = ''
}

const relationDelete = async (id: string) => {
  if (!textDeleteModel.value) return
  const r = relations.value?.get(id)?.time
  if (!r) return
  isLoading.value = `delete-${id}`
  await setTutoratSchedule(r.day, r.start, r.end, 'free')
  await relationSetUserStatut(id, (<UserData>user.value).uid, { statut: 'leaved', return: textDeleteModel.value })
  await load()
  isDeleting.value = ''
  isLoading.value = ''
}

const initCreate = (id: string = '') => {
  isAdding.value = ''
  isDeleting.value = ''
  isCreating.value = id
  const r = relations.value?.get(id)
  publicUser.value = publicUsers.value.get(r?.entrants?.filter(e => e !== (<UserData>user.value).uid)[0] ?? '')
}

const resetModel = () => {
  isCreating.value = ''
  
  model.day = ''
  model.start = ''
  model.end = ''
  model.subjects = []
}

const isOutOfRange = (start?: number, end?: number) => {
  if (start) {
    const minMin = <number><unknown>detailedTimes[0].split(':')[0] * 60 + <number><unknown>detailedTimes[0].split(':')[1] * 1
    return start < minMin
  }
  else if (end) {
    const maxMin = <number><unknown>detailedTimes[detailedTimes.length - 1].split(':')[0] * 60 + <number><unknown>detailedTimes[detailedTimes.length - 1].split(':')[1] * 1
    return end > maxMin
  }
}

const isLegalTime = (e1: any, e2: any) => {
  const e = e1 || e2
  const startMin = e.start?.split(':')[0] * 60 + e.start?.split(':')[1] * 1
  const endMin = e.end?.split(':')[0] * 60 + e.end?.split(':')[1] * 1
  if (!startMin || !endMin) return false

  const partial = e1 ? [startMin, undefined] : [undefined, endMin]

  return !isOutOfRange(...partial) && hasEnoughRange(startMin, endMin)
}

const getRightTimes = (id: string, { day, start, end }: { day: string, start: string, end: string }, restricted = true) => {
  const r = relations.value?.get(id)
  const publicUser = publicUsers.value.get(r?.entrants?.filter(e => e !== (<UserData>user.value).uid)[0] ?? '')
  if (!r || !publicUser) return [[], [], []]
  const publicTimes = getSameTimes((<UserData>user.value).planning.map(schedule => schedule.times), publicUser.planning.map(schedule => schedule.times), restricted)
  const publicDays = days.filter((day, index) => publicTimes[index].length > 0).map((day) => { return { label: day, value: day } })

  if (!day)
    return [publicDays, [], []]

  const sameLength = (s: string, e: string, a: Array<any>) => {
    return detailedTimes.slice(detailedTimes.indexOf(s), detailedTimes.indexOf(e)).length === a.length
  }

  let startList = [...detailedTimes].filter((e, i) => e !== '19:00' && publicTimes[days.indexOf(day)].some(time => e === time.start))
  if (end) {
    startList = startList
      .filter(e => detailedTimes.indexOf(end) > detailedTimes.indexOf(e))
      .filter((e, i, a) => sameLength(e, end, a.slice(i)))
  }

  let endList = [...detailedTimes].filter((e, i) => e !== '07:00' && publicTimes[days.indexOf(day)].some(time => e === time.end))
  if (start) {
    endList = endList
      .filter(e => detailedTimes.indexOf(start) < detailedTimes.indexOf(e))
      .filter((e, i, a) => sameLength(start, e, a.slice(0, i + 1)))
  }
  const sL = startList.map(e => { return { label: e, value: e } })
  const eL = endList.map(e => { return {label: e, value: e}})
  return [publicDays, sL, eL]
}

const relationCreate = async (id: string) => {
  
  isLoading.value = `create-end-${id}`
  addReturn.value = await createRelation(id)
  setTimeout(() => {addReturn.value = ''}, 5000)
  isLoading.value = ''
}

const createRelation = async (id: string) => {
  const r = relations.value?.get(id)
  const publicUser = publicUsers.value.get(r?.entrants?.filter(e => e !== (<UserData>user.value).uid)[0] ?? '')
  if (!r || !publicUser) return 'Erreur utilisateur introuvable !'
  const rightTimes = getRightTimes(id, model)
  if (rightTimes[0].length === 0 || !rightTimes[1].map(e => e.value).includes(model.start) || !rightTimes[2].map(e => e.value).includes(model.end))
    return 'Erreur dans la saisie de la plage horaire !'
  if (model.subjects.length === 0)
    return 'Vous devez rentrer la/les matière(s) que vous souhaitez demander à votre tutorant !'

  try {
    await setRelation(id, {
      statut: 'asking',
      time: {
        day: model.day,
        start: model.start,
        end: model.end,
      },
      subjects: model.subjects
      
    })
    await setTutoratSchedule(model.day, model.start, model.end, 'tutorat')
    await relationSetUserStatut(id, (<UserData>user.value).uid, { statut: 'accepted' })
      resetModel()
  }
  catch (e) {
    console.error(e)
    return 'Erreur dans la création de la relation, veuillez reessayer plus tard !'
  }
  await setRelation(id, {})
  await relationSetUserStatut(id, (<UserData>user.value).uid, { statut: 'accepted' })
  await load()
  return ''
}

const relationAbort = async (id: string) => {
  isLoading.value = `abort-${id}`
  await relationSetUserStatut(id, (<UserData>user.value).uid, { statut: 'abort', return: textDeleteModel.value })
  await load()
  isLoading.value = ''
}

const getAdd = (id: string, uid: string) => {
  return relationAdds.value.get(id)?.get(uid)
}

const relationAdd = async (id: string) => {
  const currentRelation = relations.value?.get(id)
  const newMember = [...publicUsers.value].map(([key, value]) => value).filter(e => e.email === addModel.value.text)[0]
  if (!currentRelation || !newMember) {
    addReturn.value = 'Utilisateur introuvable'
    setTimeout(() => {addReturn.value = ''}, 5000)
    return
  }
  if (currentRelation.entrants.includes(newMember.uid)) {
    addReturn.value = 'Vous ne pouvez pas ajouter un membre déjà présent dans la relation !'
    setTimeout(() => {addReturn.value = ''}, 5000)
    return
  }
  if (currentRelation.helpers.length >= 2) {
    addReturn.value = 'Vous ne pouvez pas ajouter plus de 2 tutorants à la relation !'
    setTimeout(() => {addReturn.value = ''}, 5000)
    return
  }

  if (currentRelation.receivers.length >= 4) {
    addReturn.value = 'Vous ne pouvez pas ajouter plus de 2 tutorés à la relation !'
    setTimeout(() => {addReturn.value = ''}, 5000)
    return
  }

  isLoading.value = `add-${id}`
  await setRelation(id, {
    entrants: [...currentRelation.entrants, newMember.uid],
    helpers: addModel.value.tutorant ? [...currentRelation.helpers, newMember.uid] : currentRelation.helpers,
    receivers: !addModel.value.tutorant ? [...currentRelation.receivers, newMember.uid] : currentRelation.receivers,
  })
  await load()
  isAdding.value = ''
  isLoading.value = ''
}

const load = async () => {
  sortedRelations.value = {
    request: [],
    contact: [],
    pending: [],
    cancel: [],
    accepted: [],
  }
  relationAdds.value = new Map<string, Map<string, string>>()
  relations.value = await getRelations()
  const adds = {
    left: ' ( Quitté )',
    deny: ' ( Refusé )',
    response: ' ( N\'a pas répondu )',
    accept: '',
  }
  for (const [k, v] of relations.value) {
    if (v.statut === 'adm') 
      continue
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

    const map = new Map<string, string>()
    for (const e of v.entrants) {
      if (!hasRelationResponse(data.get(e)))
        map.set(e, adds.response)
      else if (hasRelationDeny(data.get(e)))
        map.set(e, adds.deny)
      else if (hasRelationAccept(data.get(e)))
        map.set(e, adds.accept)
      else
        map.set(e, adds.left)
    }
    relationAdds.value.set(k, map)
  }
}

const load2 = async () => {
  toggleLoadingPage(true)
  publicUsers.value = await getForcedUsers()
  toggleLoadingPage(false)  
}

load()
if (publicUsers.value.size === 0) 
  load2()


setTimeout(() => {
  window.scrollTo({ top: 0 })
}, 100)
</script>

<style scoped>
.relation-title {
  font-size: 22px;
  margin: 10px 0 15px 0;
}

.relation-global {
  font-style: italic;
}

.relation-users {
  margin-top: 40px;
}

.relation-users > * {
  margin: 30px 0;
  padding-top: 20px;
  border-top: 1px solid black;
}

.relation-user-title {
  margin-bottom: 20px;
  font-size: 18px;
}

.relation-user-infos {
  margin-bottom: 20px;
}

.relation-user-infos-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 30px;
}

.relation-user-infos-list-sub-value {
  margin-left: 20px;
}

.relation-user-link {
  cursor: pointer;
}

.relation-user-buttons {
  display: flex;
  gap: 3rem;
  justify-content: flex-end;
  width: 100%;
  flex-wrap: wrap;
}

.relation-user-buttons > * {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.relation-user-delete {
  margin-top: 30px;
}

.relation-delete-text-area {
  border: none;
  outline: none;
  resize: none;
  border: solid 1px rgba(60,60,60,0.26);
  border-radius: 4px;
  max-width: 85%;
  width: max(400px, 50%);
  margin: 10px 0 20px 10px;
}

.relation-user-delete-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.cal-val-return {
  font-size: 13px;
  font-style: italic;
  margin-bottom: 20px;
  color: var(--color-danger)
}

.relation-no-one {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: calc(5vw + 25px);
}

.search-user-choices {
  width: min(600px, 100%);
  margin-top: 30px;
}

.search-user-selects-selects-time {
  display: flex;
  justify-content: space-between;
  margin: 10px 0 30px 0;
  flex-wrap: wrap;
}

.search-user-selects-selects-time > * {
  min-width: 170px;
}

.search-user-choices-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 20px;
}

</style>

<route lang="yaml">
meta:
  layout: profil
</route>
