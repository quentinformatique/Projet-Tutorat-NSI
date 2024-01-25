<script lang="ts" setup>
import { user } from '~/logic/data/auth/auth-manager'
import type { Option } from '~/logic/pages/login/school.login'
import { getOption, getSubjects, models, optionOptions, options, selectOptions, setModels } from '~/logic/pages/login/school.login'
import { getSchoolLabel, isValidChoices } from '~/logic/profil/school/school-manager'
import { setUser } from '~/logic/data/auth/user'

const updating = ref(false)
const isButtonLoading = ref(false)
const changeReturn = ref()
const isNotValid = ref(true)

const toggleUpdating = (v: boolean) => {
  updating.value = v
}

const isObject = (object) => {
  return object != null && typeof object === 'object'
}

const deepEqual = (object1, object2) => {
  const keys1 = Object.keys(object1)
  const keys2 = Object.keys(object2)
  if (keys1.length !== keys2.length)
    return false

  for (const key of keys1) {
    const val1 = object1[key]
    const val2 = object2[key]
    const areObjects = isObject(val1) && isObject(val2)
    if (Array.isArray(val1) || Array.isArray(val2)) {
      if (!(Array.isArray(val1)) || !(Array.isArray(val2)) || val1.length !== val2.length)
        return false
      for (const item of val1) {
        if (!val2.includes(item))
          return false
        else
          val2.splice(val2.indexOf(item), 1)
      }
    }
    else if (
      (areObjects && !deepEqual(val1, val2))
      || (!areObjects && val1 !== val2)
    ) { return false }
  }
  return true
}

const copyRef = (ref: Object) => {
  return JSON.parse(JSON.stringify(ref))
}

setModels(copyRef(user.value.school))

const hasDifferencies = () => {
  return !deepEqual(copyRef(models.value), copyRef(user.value.school))
}

const onValidation = async () => {
  if (!hasDifferencies())
    return
  isButtonLoading.value = true
  try {
    await setUser(user.value.uid, { school: copyRef(models.value) })
    user.value = { ...user.value, school: copyRef(models.value) }
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
  setModels(copyRef(user.value.school))
}

const hasSpe = (third: boolean) => {
  return models.value.level === 'premiere-g' || (models.value.level === 'terminal-g' && !third)
}

const isTechno = () => {
  return models.value.level === 'premiere-t' || models.value.level === 'terminal-t'
}

const onNiveauChange = () => {
  if (!models.value.level)
    options.classe = undefined
  else options.classe = selectOptions.classe.get(models.value.level)
}

const onSpeChange = () => {
  options.spe.a = selectOptions.spe.filter(({ value }: Option) => ![models.value.spe.b, models.value.spe.c].includes(value) && !(([models.value.spe.b, models.value.spe.c].includes('ap-spe') || [models.value.spe.b, models.value.spe.c].includes('cav-spe')) && ['ap-spe', 'cav-spe'].includes(value)) && !(models.value.option.includes('mathsSpe-opt') && value === 'maths-spe'))
  options.spe.b = selectOptions.spe.filter(({ value }: Option) => ![models.value.spe.a, models.value.spe.c].includes(value) && !(([models.value.spe.a, models.value.spe.c].includes('ap-spe') || [models.value.spe.a, models.value.spe.c].includes('cav-spe')) && ['ap-spe', 'cav-spe'].includes(value)) && !(models.value.option.includes('mathsSpe-opt') && value === 'maths-spe'))
  options.spe.c = selectOptions.spe.filter(({ value }: Option) => ![models.value.spe.a, models.value.spe.b].includes(value) && !(([models.value.spe.a, models.value.spe.b].includes('ap-spe') || [models.value.spe.a, models.value.spe.b].includes('cav-spe')) && ['ap-spe', 'cav-spe'].includes(value)) && !(models.value.option.includes('mathsSpe-opt') && value === 'maths-spe'))
}

const idToLang = (e: string) => e.split('-')[0]

const onLvChange = () => {
  options.lv.a = selectOptions.lv.filter(({ value }: Option) => models.value.lv.b !== value)
  options.lv.b = selectOptions.lv.filter(({ value }: Option) => models.value.lv.a !== value)
  options.section = selectOptions.section.lang.filter(
    l => Object.values(models.value.lv)
      .filter(id => !!id)
      .map(id => idToLang(id))
      .includes(idToLang(l.value)),
  )
}

const resetHideValues = () => {
  if (!models.value.level) {
    models.value.class = ''
    models.value.option = []
  }
  if (!hasSpe(false))
    models.value.spe = { a: '', b: '', c: '' }
  if (!isTechno())
    models.value.techno = ''
  if (!models.value.lv.a && !models.value.lv.b)
    models.value.section.lang = ''
  if (models.value.section.lang !== 'angl-euro' || models.value.level === 'seconde')
    models.value.section.dnl = ''
}

const updateSubjects = () => {
  onNiveauChange()
  onSpeChange()
  onLvChange()
  const subjects = getSubjects(models.value)
  options.subjects.helper = subjects.filter(({ value }: Option) => ![...models.value.subjects.bad, ...models.value.subjects.good, ...models.value.tutorat.receiver.subjects].includes(value))
  options.subjects.receiver = subjects.filter(({ value }: Option) => ![...models.value.subjects.bad, ...models.value.subjects.good, ...models.value.tutorat.helper.subjects].includes(value) && !(value === 'fr' && models.value.level.startsWith('terminal')))
  options.subjects.good = subjects.filter(({ value }: Option) => ![...models.value.subjects.bad, ...models.value.tutorat.helper.subjects, ...models.value.tutorat.receiver.subjects].includes(value))
  options.subjects.bad = subjects.filter(({ value }: Option) => ![...models.value.subjects.good, ...models.value.tutorat.helper.subjects, ...models.value.tutorat.receiver.subjects].includes(value) && !(value === 'fr' && models.value.level.startsWith('terminal')))
  resetHideValues()
}

const updateValidation = () => {
  updateSubjects()
  isNotValid.value = !isValidChoices(models.value)
}

setTimeout(() => {
  if (!models.value.level)
    options.classe = undefined
  else options.classe = selectOptions.classe.get(models.value.level)
  options.spe.a = selectOptions.spe.filter(({ value }: Option) => ![models.value.spe.b, models.value.spe.c].includes(value))
  options.spe.b = selectOptions.spe.filter(({ value }: Option) => ![models.value.spe.a, models.value.spe.c].includes(value))
  options.spe.c = selectOptions.spe.filter(({ value }: Option) => ![models.value.spe.a, models.value.spe.b].includes(value))
  options.lv.a = selectOptions.lv.filter(({ value }: Option) => models.value.lv.b !== value)
  options.lv.b = selectOptions.lv.filter(({ value }: Option) => models.value.lv.a !== value)
  options.section = selectOptions.section.lang.filter(
    l => Object.values(models.value.lv)
      .map(id => idToLang(id))
      .includes(idToLang(l.value)),
  )
  optionOptions.value = getOption(models.value.level, models.value.spe)
  updateSubjects()
  window.scrollTo({ top: 0 })
}, 100)
</script>

<template>
  <div class="profil-index-container">
    <div class="profil-index-title">
      <div>
        <div class="profil-index-title-name">
          Informations Scolaires
        </div>
      </div>
    </div>
    <div class="profil-index-items">
      <div class="profil-index-item">
        <div class="profil-index-item-label">
          Niveau :
        </div>
        <div v-if="!updating" class="profil-index-item-value">
          {{ getSchoolLabel(user.school.level) }}
        </div>
        <div v-else class="profil-index-item-value">
          <Select id="niveau" v-model="models.value.level" :options="selectOptions.niveau" :required="false" @change="updateValidation" />
        </div>
      </div>
      <div class="profil-index-item">
        <div class="profil-index-item-label">
          Classe :
        </div>
        <div v-if="!updating" class="profil-index-item-value">
          {{ getSchoolLabel(user.school.class) }}
        </div>
        <div v-else class="profil-index-item-value">
          <Select id="classe" v-model="models.value.class" :options="options.classe" :required="false" @change="updateValidation" />
        </div>
      </div>
      <div v-if="models.value.level.endsWith('-g')" class="profil-index-item-value">
        <div class="profil-index-item-label">
          Spécialités :
        </div>
        <div v-if="!updating" class="profil-index-item-value">
          <div>
            - {{ getSchoolLabel(user.school.spe.a) }}
          </div>
          <div>
            - {{ getSchoolLabel(user.school.spe.b) }}
          </div>
          <div>
            - {{ `${getSchoolLabel(user.school.spe.c)}${user.school.level === 'terminal-g' ? ' (abandonée)' : ''}` }}
          </div>
        </div>
        <div v-else class="profil-index-item-value profil-index-item-multi-select">
          <Select id="spe-a" v-model="models.value.spe.a" :options="options.spe.a" :search="true" :required="false" @change="updateValidation" />
          <Select id="spe-b" v-model="models.value.spe.b" :options="options.spe.b" :search="true" :required="false" @change="updateValidation" />
          <Select id="spe-c" v-model="models.value.spe.c" :options="options.spe.c" :search="true" :required="false" @change="updateValidation" />
        </div>
      </div>
      <div v-if="models.value.level.endsWith('-t')" class="profil-index-item">
        <div class="profil-index-item-label">
          Filiaire Technologique :
        </div>
        <div v-if="!updating" class="profil-index-item-value">
          {{ getSchoolLabel(user.school.class) }}
        </div>
        <div v-else class="profil-index-item-value">
          <Select id="techno" v-model="models.value.techno" :options="selectOptions.techno" :search="true" :required="false" @change="updateValidation" />
        </div>
      </div>
      <div class="profil-index-item">
        <div class="profil-index-item-label">
          Langues vivantes :
        </div>
        <div v-if="!updating" class="profil-index-item-value">
          <div>
            - {{ getSchoolLabel(user.school.lv.a) }}
          </div>
          <div>
            - {{ getSchoolLabel(user.school.lv.b) }}
          </div>
        </div>
        <div v-else class="profil-index-item-value profil-index-item-multi-select">
          <Select id="lva" v-model="models.value.lv.a" :options="options.lv.a" :required="false" @change="updateValidation" />
          <Select id="lvb" v-model="models.value.lv.b" :options="options.lv.b" :required="false" @change="updateValidation" />
        </div>
      </div>
      <div class="profil-index-item">
        <div class="profil-index-item-label">
          Options :
        </div>
        <div v-if="!updating" class="profil-index-item-value">
          <div v-for="option in user.school.option" :key="option" class="profil-index-item-array">
            - {{ getSchoolLabel(option) }}
          </div>
        </div>
        <div v-else class="profil-index-item-value">
          <Select v-if="models.value.level && optionOptions" id="options" v-model="models.value.option" :options="getOption(models.value.level, models.value.spe, models.value.option)" tags :required="false" @change="updateValidation" />
        </div>
      </div>
      <div class="profil-index-item">
        <div class="profil-index-item-label">
          Section Européenne :
        </div>
        <div v-if="!updating" class="profil-index-item-value">
          {{ getSchoolLabel(user.school.section.lang) }}
        </div>
        <div v-else class="profil-index-item-value">
          <Select id="euro" v-model="models.value.section.lang" :options="options.section" :required="false" @change="updateValidation" />
        </div>
      </div>
      <div class="profil-index-item">
        <div class="profil-index-item-label">
          DNL :
        </div>
        <div v-if="!updating" class="profil-index-item-value">
          {{ getSchoolLabel(user.school.section.dnl) }}
        </div>
        <div v-else class="profil-index-item-value">
          <Select v-if="models.value.section.lang === 'angl-euro' && models.value.niveau !== 'seconde'" id="dnl" v-model="models.value.section.dnl" :options="selectOptions.section.dnl" :required="false" @change="updateValidation" />
        </div>
      </div>
      <div v-if="user.school.tutorat.helper.wish || updating" class="profil-index-item">
        <div class="profil-index-item-label">
          Tutorant (donner de l'aide) :
        </div>
        <div v-if="!updating">
          <div class="profil-index-item profil-index-sub-item">
            <div class="profil-index-item-label">
              Je veux aider en :
            </div>
            <div class="profil-index-item-value">
              <div v-for="subject in user.school.tutorat.helper.subjects" :key="subject" class="profil-index-item-array">
                - {{ getSchoolLabel(subject, true) }}
              </div>
            </div>
          </div>
          <div class="profil-index-item profil-index-sub-item">
            <div class="profil-index-item-label">
              Je suis aussi à l'aise en :
            </div>
            <div class="profil-index-item-value">
              <div v-for="subject in user.school.subjects.good" :key="subject" class="profil-index-item-array">
                - {{ getSchoolLabel(subject, true) }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="profil-index-item-value">
          <Checkbox id="help" v-model="models.value.tutorat.helper.wish" styles="blurple" />
          <div v-if="models.value.tutorat.helper.wish && options.subjects.good" class="profil-index-item-sub-group">
            <Select id="help" v-model="models.value.tutorat.helper.subjects" label="Je veux aider en" :options="options.subjects.helper" tags search @change="updateValidation" />
            <Select id="goodSubject" v-model="models.value.subjects.good" label="Je suis aussi à l'aise en" :options="options.subjects.good" tags search :required="false" @change="updateValidation" />
          </div>
        </div>
      </div>
      <div v-if="user.school.tutorat.receiver.wish || updating" class="profil-index-item">
        <div class="profil-index-item-label">
          Tutoré(e) (recevoir de l'aide) :
        </div>
        <div v-if="!updating">
          <div class="profil-index-item profil-index-sub-item">
            <div class="profil-index-item-label">
              Je veux recevoir de l'aide en :
            </div>
            <div class="profil-index-item-value">
              <div v-for="subject in user.school.tutorat.receiver.subjects" :key="subject" class="profil-index-item-array">
                - {{ getSchoolLabel(subject, true) }}
              </div>
            </div>
          </div>
          <div class="profil-index-item profil-index-sub-item">
            <div class="profil-index-item-label">
              Je suis aussi moins à l'aise en :
            </div>
            <div class="profil-index-item-value">
              <div v-for="subject in user.school.subjects.bad" :key="subject" class="profil-index-item-array">
                - {{ getSchoolLabel(subject, true) }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="profil-index-item-value">
          <Checkbox id="receive" v-model="models.value.tutorat.receiver.wish" styles="blurple" />
          <div v-if="models.value.tutorat.receiver.wish && options.subjects.bad" class="profil-index-item-sub-group">
            <Select id="receive" v-model="models.value.tutorat.receiver.subjects" label="Je veux recevoir de l'aide en" :options="options.subjects.receiver" tags search @change="updateValidation" />
            <Select id="badSubject" v-model="models.value.subjects.bad" label="Je suis aussi moins à l'aise en" :options="options.subjects.bad" tags search :required="false" @change="updateValidation" />
          </div>
        </div>
      </div>
    </div>
    <div class="profil-index-buttons">
      <div v-if="!updating">
        <Button id="modify" label="Modifier le profil" styles="blurple" :options="{ disabled: false }" @click="updating = true" />
      </div>
      <div v-else>
        <Button id="complete" label="Valider les modifications" styles="success" :options="{ disabled: !hasDifferencies() || isNotValid }" :loading="isButtonLoading" @click="onValidation" />
        <Button id="undo" label="Annuler les modifications" styles="danger" :options="{ disabled: isButtonLoading }" @click="onUndo" />
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
  margin-top: 10px;
}

.profil-index-item-value {
  margin: 0 0 20px 20px;
}

.profil-index-item-sub-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 0 20px 0;
}

.profil-index-item-multi-select {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 10px 0 30px 20px;
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

.profil-index-sub-item {
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
