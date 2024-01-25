<script setup lang="ts">
const props = defineProps({
  options: {
    type: Array,
    default() {
      return [[]]
    },
  },
  unwatch: {
    type: Boolean,
    default: false,
    required: false,
  },
})

const update = defineEmits(['update:modelValue'])

const value = computed({
  get: () => {
    return props.options
  },
  set: (v: Array) => {
    update('update:modelValue', v)
  },
})

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

const days = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
]

const taskStyle = ref([[], [], [], [], [], [], []])

const resizeTasks = () => {
  for (let i = 0; i < value.value.length; i++) {
    for (let j = 0; j < value.value[i].length; j++) {
      const startMin = value.value[i][j].start?.split(':')[0] * 60 + value.value[i][j].start?.split(':')[1] * 1 ?? 0
      const endMin = value.value[i][j].end?.split(':')[0] * 60 + value.value[i][j].end?.split(':')[1] * 1 ?? 0
      const difMin = endMin - startMin

      taskStyle.value[i][j] = {
        height: `${difMin / 1.394}px`,
        top: `${((startMin - (times[0].split(':')[0] * 60 + times[0].split(':')[1] * 1)) / 1.394) + 42}px`,
      }
    }
  }
}
resizeTasks()

if (!props.unwatch) {
  watch(props.options, (_) => {
    resizeTasks()
  })
}

const isOutOfRange = (start: number, end: number) => {
  const maxMin = times[times.length - 1].split(':')[0] * 60 + times[times.length - 1].split(':')[1] * 1
  const minMin = times[0].split(':')[0] * 60 + times[0].split(':')[1] * 1
  return start < minMin || end > maxMin
}

const hasEnoughRange = (start: number, end: number) => {
  return end - start - 30 >= 0
}

const isLegalTime = (e) => {
  const startMin = e.start?.split(':')[0] * 60 + e.start?.split(':')[1] * 1
  const endMin = e.end?.split(':')[0] * 60 + e.end?.split(':')[1] * 1
  return startMin && endMin && !isOutOfRange(startMin, endMin) && hasEnoughRange(startMin, endMin)
}

const getLegalTimes = (array) => {
  const newArray = []
  for (let j = 0; j < array?.length; j++) {
    if (isLegalTime(array[j]))
      newArray.push(array[j])
  }
  return newArray
}
</script>

<template>
  <div class="schedule">
    <div class="time-ground">
      <ul>
        <li v-for="time in times" :key="time">
          <span>{{ time }}</span>
          <p style="width: 98%" />
        </li>
      </ul>
    </div>
    <div class="task-ground">
      <ul>
        <li v-for="(day, index) in days" :key="index" class="task-list">
          <p :id="day">
            <span>{{ day }}</span>
          </p>
          <ul style="height: 500px">
            <li
              v-for="(detail, detailIndex) in getLegalTimes(value[index])"
              :key="detailIndex"
              class="task-list-item"
              :style="{ ...taskStyle[index][detailIndex], 'background-color': detail.statut === 'free' ? 'var(--color-success)' : detail.statut === 'buisy' ? 'var(--color-danger)' : 'var(--color-orange)' }"
            />
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.schedule{
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  left: 20px;

}
.time-ground{
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}
.time-ground ul li{
  margin-top: 42px;
  font-size: 0.8rem;
  height: 1px;
}
.time-ground ul li span{
  position: absolute;
  left: -60px;
  transform: translateY(-50%);
}
.time-ground ul li p{
  position:absolute;
  left: 0;
  height: 1px;
  background-color: #EAEAEA;
}
.task-ground{
  width: 100%;
}
.task-list{
  float: left;
  width: 14%;
  box-sizing:border-box;
  height: 559px;
  border:1px solid #EAEAEA;
}
.task-list p{
  text-align: center;
  font-size: 0.9rem;
  padding-top: 0.7rem;
}
.task-list-item{
  position: absolute;
  background-color: #577F92;
  width: 14%;
  height: 1px;
}
.task-list-item p{
  text-align: left;
  padding: 0;
  margin: 1rem 0 0 1rem;
  font-size: 0.8rem;
  color: #EDF2F6;
}
.task-list-item h3{
  color: #E0E7E9;
  margin: 1rem 0 0 1rem;
}

@media screen and (max-width: 1020px) {
  .task-list > p > span {
    display: none;
  }
  #Lundi::after {
    content: "Lun"
  }
  #Mardi::after {
    content: "Mar"
  }
  #Mercredi::after {
    content: "Mer"
  }
  #Jeudi::after {
    content: "Jeu"
  }
  #Vendredi::after {
    content: "Ven"
  }
  #Samedi::after {
    content: "Sam"
  }
  #Dimanche::after {
    content: "Dim"
  }
}

@media screen and (max-width: 520px) {
  .task-list > p > span {
    display: none;
  }
  #Lundi::after {
    content: "L"
  }
  #Mardi::after {
    content: "M"
  }
  #Mercredi::after {
    content: "M"
  }
  #Jeudi::after {
    content: "J"
  }
  #Vendredi::after {
    content: "V"
  }
  #Samedi::after {
    content: "S"
  }
  #Dimanche::after {
    content: "D"
  }
}
</style>
