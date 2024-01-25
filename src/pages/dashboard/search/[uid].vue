<template>
  <div v-if="publicUser" class="search-container">
    <div class="search-user-flex">
      <div class="search-user-name-avatar">
        <img class="search-user-avatar" :src="publicUser.avatar" alt="">
        <div class="search-user-name-email">
          <div class="search-user-name">
            {{ publicUser.displayName }}
          </div>
          <div class="search-user-email">
            {{ publicUser.email }}
          </div>
        </div>
      </div>
      <LabelValue label="Classe" :value="publicUser.school.level" />
      <LabelValue label="Åge" :value="publicUser.birthday ? `${new Date(new Date().getTime() - publicUser.birthday.toDate().getTime()).getFullYear() - 1970} ans` : '-'" />
      <LabelValues label="Veut aider en" :value="publicUser.school.tutorat.helper.subjects" prefix />
      <LabelValues label="Est aussi à l'aise en" :value="publicUser.school.subjects.good" prefix />
      <LabelValue label="Description" :value="publicUser.description ?? '-'" class="search-user-w-high" />
      <LabelValue v-if="publicUser.school.level.endsWith('-t')" label="Filiaire Technologique" :value="publicUser.school.techno" />
      <LabelValues v-if="publicUser.school.level.endsWith('-g')" label="Spécialités" :value="[publicUser.school.spe.a, publicUser.school.spe.b, publicUser.school.spe.c]" :complete="publicUser.school.level.startsWith('terminal') ? ' (abandonnée)' : ''" />
      <LabelValues label="Langues vivantes" :value="[publicUser.school.lv.a, publicUser.school.lv.b]" />
    </div>
    <div class="search-user-schedule">
      <Schedule
        :options="getSameTimes(user.planning.map(schedule => schedule.times), publicUser.planning.map(schedule => schedule.times))"
        unwatch
      />
    </div>
    <div class="search-user-button">
      <div v-if="error" class="cal-val-return cal-val-bad">
        {{ error }}
      </div>
      <div v-if="!isRequesting" class="default-button">
        <Button id="contact" label="Contacter" styles="blurple" :options="{disabled: false}" :loading="isButtonLoading === 'contact'" @click="contact()" />
        <Button id="request" label="Demander de l'aide" styles="blurple" :options="{disabled: false}" @click="toggleIsRequesting(true)" />
      </div>
      <div v-else class="search-user-choices">
        <div class="search-user-selects">
          <div class="search-user-selects-title">
            Veuillez selectionner l'horaire souhaité
          </div>
          <div class="search-user-selects-selects">
            <div class="search-user-selects-selects-time">
              <div>
              <Select id="day" v-model="model.day" label="Jour" :options="getRightTimes(model)[0]" :required="false" />
            </div>
            <div :class="{timeError: !isLegalTime(model, undefined)}">
              <Select id="start" v-model="model.start" label="Début" :options="getRightTimes(model)[1]" :required="false" />
            </div>
            <div :class="{timeError: !isLegalTime(undefined, model)}">
              <Select id="end" v-model="model.end" label="Fin" :options="getRightTimes(model)[2]" :required="false" />
            </div>
            </div>
            <!-- Les options après doivent être remplacés par une fonction :) -->
            <Select
              id="receive"
              v-model="model.subjects"
              label="Matières dans lesquels vous voulez recevoir de l'aide"
              :options="getSameSubjects(publicUser.school.tutorat.helper.subjects, user.school.tutorat.receiver.subjects).map(e => { return { label: getSchoolLabel(e, true), value: e}})"
              tags
              search
              :required="false"
            />
          </div>
        </div>
        <div class="search-user-choices-buttons">
          <Button id="resign" label="Abandonner" styles="danger" :options="{disabled: false}" @click="resetModel" />
          <Button id="confirm" label="Confirmer la demande de tutorat" styles="success" :options="{disabled: false}" :loading="isButtonLoading === 'create'" @click="onClick()" />
        </div>
      </div>
      <div v-if="result.statut" class="cal-val-return cal-val-good">
        Demande de Tutorat envoyée !
      </div>
      <div v-else-if="result.statut === false" class="cal-val-return cal-val-bad">
        {{ result.statement }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getForcedUsers, getUsers, UserData } from '~/logic/data/firestore/datas/Users'
import { toggleLoadingPage } from '~/main'
import { getSameTimes, setTutoratSchedule } from '~/logic/profil/planning/planning-manager'
import { user } from '~/logic/data/auth/auth-manager'
import { hasEnoughRange } from '~/logic/pages/login/planning.login'
import { createRelation, relationSetUserStatut } from '~/logic/data/firestore/datas/Relations'
import { getSchoolLabel, getSameSubjects, hasSameSubjects } from '~/logic/profil/school/school-manager'
import { changeActiveChat } from '~/logic/pages/chat'

const props = defineProps({
  uid: {
    required: true,
    type: String,
  },
})

const isButtonLoading = ref('')
const users = ref<Map<string, UserData>>(getUsers())
const error = ref('')
const result = ref<{ statut?: boolean; statement: string }>({ statut: undefined, statement: '' })
const isRequesting = ref(false)
const publicUser = ref(<UserData>users.value.get(props.uid))
const model = reactive({ day: '', start: '', end: '', subjects: [] })
const router = useRouter()

const setError = (e: string) => {
  error.value = e
  setTimeout(() => {error.value = ''}, 4000)
}

const f = async() => {
  toggleLoadingPage(true)
  users.value = await getForcedUsers()
  toggleLoadingPage(false)
  publicUser.value = <UserData>users.value.get(props.uid)
  if (!publicUser.value)
    setError('L\'utilisateur n\'existe pas, veuillez contacter un administrateur !')
}
if (users.value.size === 0 || !publicUser.value)
  f()

const toggleIsRequesting = (force?: boolean) => {
  if (force && !publicUser.value.school.tutorat.helper.wish) {
    return setError('L\'utilisateur ne désire pas aider, veuillez vous rendre sur un autre profil !')
  }
  if (!hasSameSubjects(publicUser.value.school.tutorat.helper.subjects, user.value.school.tutorat.receiver.subjects)) {
    return setError('Vous n\'avez aucune matière en commune avec cette personne !')
  }
  isRequesting.value = force === undefined ? !isRequesting.value : force
}

const resetModel = () => {
  toggleIsRequesting(false)
  model.day = ''
  model.start = ''
  model.end = ''
  model.subjects = []
}

setTimeout(() => {
  window.scrollTo({ top: 0 })
}, 100)

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const detailedTimes = [
  { label: '07:00', value: '07:00' },
  { label: '07:30', value: '07:30' },
  { label: '08:00', value: '08:00' },
  { label: '08:30', value: '08:30' },
  { label: '09:00', value: '09:00' },
  { label: '09:30', value: '09:30' },
  { label: '10:00', value: '10:00' },
  { label: '10:30', value: '10:30' },
  { label: '11:00', value: '11:00' },
  { label: '11:30', value: '11:30' },
  { label: '12:00', value: '12:00' },
  { label: '12:30', value: '12:30' },
  { label: '13:00', value: '13:00' },
  { label: '13:30', value: '13:30' },
  { label: '14:00', value: '14:00' },
  { label: '14:30', value: '14:30' },
  { label: '15:00', value: '15:00' },
  { label: '15:30', value: '15:30' },
  { label: '16:00', value: '16:00' },
  { label: '16:30', value: '16:30' },
  { label: '17:00', value: '17:00' },
  { label: '17:30', value: '17:30' },
  { label: '18:00', value: '18:00' },
  { label: '18:30', value: '18:30' },
  { label: '19:00', value: '19:00' },
]

const isOutOfRange = (start?: number, end?: number) => {
  if (start) {
    const minMin = <number><unknown>detailedTimes[0].value.split(':')[0] * 60 + <number><unknown>detailedTimes[0].value.split(':')[1] * 1
    return start < minMin
  }
  else {
    const maxMin = <number><unknown>detailedTimes[detailedTimes.length - 1].value.split(':')[0] * 60 + <number><unknown>detailedTimes[detailedTimes.length - 1].value.split(':')[1] * 1
    return end > maxMin
  }
}

const isLegalTime = (e1, e2) => {
  const e = e1 || e2
  const startMin = e.start?.split(':')[0] * 60 + e.start?.split(':')[1] * 1
  const endMin = e.end?.split(':')[0] * 60 + e.end?.split(':')[1] * 1
  if (!startMin || !endMin) return false

  const partial = e1 ? [startMin, undefined] : [undefined, endMin]

  return !isOutOfRange(...partial) && hasEnoughRange(startMin, endMin)
}
  
const getRightTimes = ({ day, start, end }: {day: string, start: string, end: string}, restricted = true) => {
  const publicTimes = getSameTimes((<UserData>user.value).planning.map(schedule => schedule.times), publicUser.value.planning.map(schedule => schedule.times), restricted)
  const publicDays = days.filter((day, index) => publicTimes[index].length > 0).map((day) => { return { label: day, value: day } })
  const times = detailedTimes.map(e => e.value)

  if (!day)
    return [publicDays, [], []]

  const sameLength = (s: string, e: string, a: Array<any>) => {
    return times.slice(times.indexOf(s), times.indexOf(e)).length === a.length
  }

  let startList = [...detailedTimes].filter((e, i) => e.value !== '19:00' && publicTimes[days.indexOf(day)].some(time => e.value === time.start))
  if (end) {
    startList = startList
      .filter(e => times.indexOf(end) > times.indexOf(e.value))
      .filter((e, i, a) => sameLength(e.value, end, a.slice(i)))
  }

  let endList = [...detailedTimes].filter((e, i) => e.value !== '07:00' && publicTimes[days.indexOf(day)].some(time => e.value === time.end))
  if (start) {
    endList = endList
      .filter(e => times.indexOf(start) < times.indexOf(e.value))
      .filter((e, i, a) => sameLength(start, e.value, a.slice(0, i + 1)))
  }

  return [publicDays, startList, endList]
}

const startRelation = async () => {
  const rightTimes = getRightTimes(model)
  if (publicUser.value.uid === (<UserData>user.value).uid)
    return { statut: false, statement: 'Vous n\'avez pas le droit de vous demander vous même !' }
  if (rightTimes[0].length === 0 || !rightTimes[1].map(e => e.value).includes(model.start) || !rightTimes[2].map(e => e.value).includes(model.end))
    return { statut: false, statement: 'Erreur dans la saisie de la plage horaire !' }
  if (model.subjects.length === 0)
    return { statut: false, statement: 'Vous devez rentrer la/les matière(s) que vous souhaitez demander à votre tutorant !' }

  try {
    const doc = await createRelation({
      statut: 'asking',
      entrants: [(<UserData>user.value).uid, publicUser.value.uid],
      receivers: [(<UserData>user.value).uid],
      helpers: [publicUser.value.uid],
      time: {
        day: model.day,
        start: model.start,
        end: model.end,
      },
      subjects: model.subjects
      
    })
    await setTutoratSchedule(model.day, model.start, model.end, 'tutorat')
    await relationSetUserStatut(doc.name, (<UserData>user.value).uid, { statut: 'accepted' })
  }
  catch (e) {
    console.error(e)
    return { statut: false, statement: 'Erreur dans la création de la relation, veuillez reessayer plus tard !' }
  }
  return { statut: true, statement: '' }
}
  
const onClick = async () => {
  isButtonLoading.value = 'create'
  result.value = await startRelation()
  if (result.value.statut) {
    resetModel()
    setTimeout(() => {
      router.push('/dashboard/profil/relation')
    }, 2000)
  }
  setTimeout(() => result.value = { statut: undefined, statement: '' }, 5000)
  isButtonLoading.value = ''
}
  
const contact = async () => {
  if (!publicUser.value.school.tutorat.helper.wish) {
    error.value = 'L\'utilisateur ne désire pas aider, veuillez vous rendre sur un autre profil !'
  }
  isButtonLoading.value = 'contact'
  try {
    const doc = await createRelation({
      statut: 'contact',
      entrants: [(<UserData>user.value).uid, publicUser.value.uid],
      receivers: [(<UserData>user.value).uid],
      helpers: [publicUser.value.uid],
      
    })
    result.value = { statut: true, statement: '' }
    changeActiveChat(doc.name)
    router.push('/dashboard/chat')
  }
  catch (e) {
    console.error(e)
    result.value = { statut: false, statement: 'Erreur dans la création de la relation, veuillez reessayer plus tard !' }
  }
  isButtonLoading.value = ''
  setTimeout(() => result.value = { statut: undefined, statement: '' }, 5000)
}
  
</script>

<style scoped>
.search-container {
  width: 90%;
  margin: 0 15px 15px;
}

.search-title-container {
  background-color: var(--main-background);
  color: var(--secondary-text-color);
  box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.3);
  margin-bottom: 10px;
  padding: 25px;
}

.search-title-main {
  font-size: 27px;
}

.search-title-sub {
  font-size: 13px;
}

.search-title-error {
  margin: 80px 0 300px 0;
}

.search-title-error-text {
  font-size: 15px;
  color: var(--color-danger);
  font-style: italic;
}

.search-filters {
  background-color: var(--main-background);
  color: var(--secondary-text-color);
  box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.3);
}

.search-filters {
  padding: 30px;
}

.search-filters-title {
  font-size: 23px;
  padding-bottom: 10px;
}

.search-filters-checkboxs {
  padding-left: 20px;
}

.search-filters-checkboxs > * {
  display: flex;
  flex-wrap: wrap;
  gap: 4rem;
  padding-right: 10vw;
  color: #404040;
}

.search-filters-check-text {
  margin: 30px 0 10px 0;
  font-size: 15px;
  color: var(--color-danger);
  font-style: italic;
}

.search-title-go-to-profile {
  margin: 50px 0 0 40px;
  padding: 5px 10px;
  width: fit-content;
  border-radius: 10px;
  border: 1px solid;
  border-color: #666666;
  color: var(--secondary-text-color);
  cursor: pointer;
}

.search-user-button {
  margin: 50px 0;
  width: 98%;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
}

.search-users-container {
  margin: 1rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

.search-user-container {
  background-color: var(--main-background);
  color: var(--secondary-text-color);
  box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.3);
  padding: 20px;
}

.search-user-flex {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.search-user-name-avatar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.search-user-important-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.search-user-avatar {
  border-radius: 50%;
}

.search-user-name {
  font-size: 23px;
}

.search-user-w-high {
  width: 800px;
}

.search-user-schedule {
  height: 520px;
  margin: 60px 0 60px 50px;
  width: 90%;
}

.cal-val-return {
  font-size: 10px;
  margin-top: 10px;
}

.cal-val-good {
  color: var(--color-success)
}

.cal-val-bad {
  color: var(--color-danger)
}

.search-user-choices {
  width: min(600px, 100%);
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

.default-button {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

@media screen and (max-width: 520px){
  .search-container {
    width: 100%;
  }
  .search-filters-checkboxs > * {
    gap: 1rem;
  }
  .search-user-avatar {
    font-size: 5vw;
  }

  .search-user-name-email {
    font-size: 5vw;
    overflow: hidden;
  }

  .search-user-name {
    font-size: 6vw;
  }

  .search-user-w-high {
    width: fit-content;
  }

  .search-user-schedule {
    width: 90%;
    margin: 40px 0 90px 30px;
  }
}

</style>

<route lang="yaml">
meta:
  layout: search
</route>
