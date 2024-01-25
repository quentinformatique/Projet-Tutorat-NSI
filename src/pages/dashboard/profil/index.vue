<template>
  <div class="profil-index-container">
    <div class="profil-index-title">
      <img :src="user.avatar" alt="" class="profil-index-title-avatar">
      <div>
        <div class="profil-index-title-name">
          {{ user.displayName }}
        </div>
        <div class="profil-index-title-email">
          {{ user.email }}
        </div>
      </div>
    </div>
    <div class="profil-index-items">
      <div class="profil-index-item">
        <div class="profil-index-item-label">
          Description :
        </div>
        <div v-if="!updating" class="profil-index-item-value">
          {{ user.description ? user.description : '-' }}
        </div>
        <div v-else class="profil-index-item-input">
          <textarea v-model="model.description" class="profil-index-item-text-area" />
        </div>
      </div>
      <div class="profil-index-item">
        <div class="profil-index-item-label">
          Date de naissance :
        </div>
        <div v-if="!updating" class="profil-index-item-value">
          {{ user.birthday ? `${convertDate(user.birthday.toDate().getUTCDate())}/${convertDate(user.birthday.toDate().getUTCMonth() + 1)}/${user.birthday.toDate().getUTCFullYear()}` : '-' }}
        </div>
        <div v-else class="profil-index-item-input">
          <input v-model="model.birthday" type="date" class="profil-index-item-date" :min="`${now - 20}-01-01`" :max="`${now - 13}-01-01`">
        </div>
      </div>
    </div>
    <div class="profil-index-buttons">
      <div v-if="!updating">
        <Button id="modify" label="Modifier le profil" styles="blurple" :options="{disabled: false}" @click="updating = true" />
      </div>
      <div v-else>
        <Button id="complete" label="Valider les modifications" styles="success" :options="{disabled: !hasDifferencies()}" :loading="isButtonLoading" @click="onValidation" />
        <Button id="undo" label="Annuler les modifications" styles="danger" :options="{disabled: isButtonLoading}" @click="onUndo" />
      </div>
    </div>
    <div class="profil-index-returns">
      <div v-if="changeReturn" class="cal-val-return cal-val-good">
        Modification(s) effectuée(s) !
      </div>
      <div v-else-if="changeReturn === false" class="cal-val-return cal-val-bad">
        Erreur de modification, veuillez réessayer !
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Timestamp } from 'firebase/firestore'

import { getSchoolLabel } from '~/logic/profil/school/school-manager'
import { user } from '~/logic/data/auth/auth-manager'

import { setUser } from '~/logic/data/auth/user'

import { UserData } from '~/logic/data/firestore/datas/Users'

const now = new Date().getFullYear()

const updating = ref(false)
const isButtonLoading = ref(false)
const changeReturn = ref()

const toggleUpdating = (v: boolean) => {
  updating.value = v
}
const newUser = JSON.parse(JSON.stringify(user.value))
const birth = user.value.birthday ? user.value.birthday.toDate() : null
const convertDate = (nb: number) => {
  if (nb < 10)
    return `0${nb}`
  return nb
}
const model = reactive({
  description: newUser.description ?? '',
  birthday: birth ? `${birth.getUTCFullYear()}-${convertDate(birth.getUTCMonth() + 1)}-${convertDate(birth.getUTCDate())}` : '',
})

const hasDifferencies = () => {
  const u = <UserData>user.value
  if (model.description.includes('@') || model.description.includes('https://') || model.description.includes('http://'))
    return false
  if (model.description.includes('.') && model.description.includes('/')) {
    const words: string[] = model.description.split(' ')
    if (words.some(w => w.includes('.') && w.includes('/')))
      return false
  }
  const isDifferentDate = (u.birthday || model.birthday) && (
    (!u.birthday && model.birthday) || (u.birthday && !model.birthday) || new Date(model.birthday).getTime() !== u.birthday.toDate().getTime()
  )
  return model.description !== u.description || isDifferentDate
}

const onValidation = async() => {
  if (!hasDifferencies()) return
  const u = <UserData>user.value
  isButtonLoading.value = true
  const data = { ...model, birthday: (model.birthday ? new Date(model.birthday) : undefined) }
  try {
    await setUser(u.uid, data)
    user.value = { ...u, ...data, birthday: data.birthday ? new Timestamp(Math.floor(data.birthday.getTime() / 1000), 0) : undefined }
    changeReturn.value = true
    updating.value = false
  }
  catch (e) {
    console.error(e)
    changeReturn.value = false
  }
  isButtonLoading.value = false
  setTimeout(() => {
    changeReturn.value = undefined
  }, 10000)
}

const onUndo = () => {
  updating.value = false
  const nUser = JSON.parse(JSON.stringify(user.value))
  model.description = nUser.description
  if (birth)
  model.birthday = `${birth.getUTCFullYear()}-${convertDate(birth.getUTCMonth() + 1)}-${convertDate(birth.getUTCDate())}`
}

setTimeout(() => {
  window.scrollTo({ top: 0 })
}, 100)

</script>

<style scoped>

.profil-index-container {
  width: 100%;
}

.profil-index-title {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 2rem;
}

.profil-index-title-avatar {
  border-radius: 50%;
}

.profil-index-title-name {
  font-size: 22px;
}

.profil-index-item-value {
  margin: 0 0 20px 20px;
}

.profil-index-item-text-area {
  border: none;
  outline: none;
  resize: none;
  border: solid 1px rgba(60,60,60,0.26);
  border-radius: 4px;
  width: 85%;
  height: 98px;
}

.profil-index-item-date {
  border: solid 1px rgba(60,60,60,0.26);
  border-radius: 4px;
  padding: 3px 10px;
}

.profil-index-item-input {
  margin: 5px 0 20px 10px;
}

.profil-index-buttons {
  margin: 25px 0 10px 0;
}

.profil-index-buttons > * {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.profil-index-returns {
  display: flex;
  justify-content: flex-end;
}

.cal-val-return {
  font-size: 10px;
}

.cal-val-good {
  color: var(--color-success)
}

.cal-val-bad {
  color: var(--color-danger)
}

</style>

<route lang="yaml">
meta:
  layout: profil
</route>
