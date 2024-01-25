<script setup lang="ts">
import { getMinFormTime, getMinFormTimes, hasEnoughRange } from '~/logic/pages/login/planning.login'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
})

const update = defineEmits(['update:modelValue'])

const value = computed({
  get: () => {
    return props.modelValue
  },
  set: (v: Array) => {
    update('update:modelValue', v)
  },
})

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const times = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
]
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

const activeDay = ref(0)

const onButtonClick = () => {
  value.value[activeDay.value].push({
    statut: 'free',
    start: '',
    end: '',
  })
}

const removeTime = (index: number) => {
  value.value[activeDay.value].splice(index, 1)
}

const changeActiveDay = (day) => {
  activeDay.value = day
}

const isOutOfRange = (start?: number, end?: number) => {
  if (start) {
    const minMin = times[0].split(':')[0] * 60 + times[0].split(':')[1] * 1
    return start < minMin
  }
  else {
    const maxMin = times[times.length - 1].split(':')[0] * 60 + times[times.length - 1].split(':')[1] * 1
    return end > maxMin
  }
}

const isLegalTime = (e1, e2) => {
  const e = e1 || e2
  const startMin = e.start?.split(':')[0] * 60 + e.start?.split(':')[1] * 1
  const endMin = e.end?.split(':')[0] * 60 + e.end?.split(':')[1] * 1
  if (!startMin || !endMin)
    return false

  const partial = e1 ? [startMin, undefined] : [undefined, endMin]

  return !isOutOfRange(...partial) && hasEnoughRange(startMin, endMin)
}

const getRightTimes = (start?: string, end?: string, index: number) => {
  let startList = end ? [...detailedTimes].filter((e, i) => e.value !== '19:00' && (!end || detailedTimes.map(e => e.value).indexOf(end) > i)) : [...detailedTimes].filter((e, i) => e.value !== '19:00')
  let endList = start ? [...detailedTimes].filter((e, i) => e.value !== '07:00' && (!start || detailedTimes.map(e => e.value).indexOf(start) < i)) : [...detailedTimes].filter((e, i) => e.value !== '07:00')
  const tempList = getMinFormTimes(value.value[activeDay.value].filter((_, i) => i !== index)).sort((a, b) => a[0] - b[0])
  const buisyList = [tempList[0]]
  // Boucle pour réduire les temps collés, ex : 10:00 | 11:00 + 11:00 | 15:30 => 10:00 | 15:30
  for (let i = 1; i < tempList.length; i++) {
    if (buisyList[buisyList.length - 1][1] === tempList[i][0])
      buisyList[buisyList.length - 1][1] = tempList[i][1]
    else
      buisyList.push(tempList[i])
  }

  for (const e of detailedTimes) {
    for (const time of buisyList) {
      if (!time)
        continue
      const minE = getMinFormTime(e.value)
      if (time[0] < minE && minE < time[1]) {
        startList = startList.filter(v => getMinFormTime(v.value) !== minE)
        endList = endList.filter(v => getMinFormTime(v.value) !== minE)
        break
      }
      if (time[0] === minE || (end && getMinFormTime(end) > time[1] && minE < time[1])) {
        startList = startList.filter(v => getMinFormTime(v.value) !== minE)
        break
      }
      if (time[1] === minE || (start && getMinFormTime(start) < time[0] && minE > time[0])) {
        endList = endList.filter(v => getMinFormTime(v.value) !== minE)
        break
      }
    }
  }
  return [startList, endList]
}
</script>

<template>
  <div class="input-schedule-container">
    <div class="input-schedule-days">
      <div v-for="(day, index) in days" :key="index" class="input-schedule-day" :class="{ activeDay: activeDay === index }" @click="changeActiveDay(index)">
        {{ day }}
      </div>
    </div>
    <div class="input-schedule-content">
      <div class="input-schedule-times">
        <div v-for="(model, i) in value[activeDay]" :key="model" class="input-schedule-time">
          <div v-if="model.statut !== 'tutorat'" class="input-schedule-inputs">
            <div :class="{ timeError: !isLegalTime(model, undefined) }">
              <Select :id="`input-schedule-${activeDay}-${i}-start`" v-model="model.start" label="Début" :options="getRightTimes(model.start, model.end, i)[0]" :required="false" />
            </div>
            <div :class="{ timeError: !isLegalTime(undefined, model) }">
              <Select :id="`input-schedule-${activeDay}-${i}-end`" v-model="model.end" label="Fin" :options="getRightTimes(model.start, model.end, i)[1]" :required="false" />
            </div>
            <CheckboxSchedule :id="`input-schedule-${activeDay}-${i}-check`" v-model="model.statut" class="input-schedule-label" />
            <div style="color: var(--color-danger); font-size: 30px; width: fit-content; display: flex; justify-content: center">
              <div i="ic-round-close" style="cursor: pointer;" @click="removeTime(i)" />
            </div>
          </div>
        </div>
      </div>
      <div class="input-schedule-buttons">
        <Button id="h" label="Ajouter un horaire" styles="blurple" :options="{ disabled: value[activeDay].length > 10 }" @click="onButtonClick" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-schedule-container {
  margin-top: 20px;
  min-width: 530px;
}

.input-schedule-days {
  font-size: 14px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 10px;
  flex-wrap: wrap;
  justify-content: space-around;
  padding-left: 10px;
}

.input-schedule-days > * {
  border: 1px solid var(--color-gray);
  padding: 4px 12px;
  border-radius: 17px;
  cursor: pointer;
  text-align: center;
}

.input-schedule-times {
  padding: 20px 0;
}

.activeDay {
  background-color: var(--color-blurple);
  color: #ffffff;
  border: 1px solid var(--color-blurple);
}

.input-schedule-time {
  margin-top: 10px;
}

.input-schedule-inputs {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.input-schedule-inputs > * {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  width: 160px;
}

.input-schedule-inputs > * > input {
  padding-left: 30px;
  align-self: center;
}

.timeError {
  border: 3px solid var(--color-danger);
  border-radius: 15px;
}

.input-schedule-buttons {
  margin-left: 10px;
}

.input-checkbox-tutorat {
  color: var(--color-orange);
  font-size: 18px;
  align-self: center;
  padding-left: 30px;

}

@media screen and (max-width: 520px) {
  .input-schedule-days {

    justify-content: flex-start;
    gap: 0.8rem;
  }
}
</style>
