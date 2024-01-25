
<template>
  <div class="cal-container">
    <div class="cal-container-schedule">
      <Schedule :options="model" />
    </div>
    <div class="cal-container-modify">
      <div>
        <InputSchedule v-model="model" />
      </div>
      <div class="cal-container-complete-button">
        <Button id="complete" label="Valider les modifications" styles="blurple" :options="{disabled: !isValid()}" :loading="buttonLoading" @click="onButtonClick" />
        <div v-if="changeReturn" class="cal-val-return cal-val-good">
          Modification(s) effectuée(s) !
        </div>
        <div v-else-if="changeReturn === false" class="cal-val-return cal-val-bad">
          Erreur de modification, veuillez réessayer !
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { user } from '~/logic/data/auth/auth-manager'
import { setUser } from '~/logic/data/auth/user'
import { isGoodSchedule } from '~/logic/pages/login/planning.login'

const model = ref(JSON.parse(JSON.stringify(user.value.planning.map(e => e.times))))
const buttonLoading = ref(false)
const changeReturn = ref(undefined)

const isEqualSchedule = (s1, s2) => {
  if (s1.length !== s2.length)
    return false
  for (let i = 0; i < s1.length; i++) {
    if (s1[i].length !== s2[i].length)
      return false
    for (let j = 0; j < s1[i].length; j++) {
      if (s1[i][j].start !== s2[i][j].start || s1[i][j].end !== s2[i][j].end || s1[i][j].statut !== s2[i][j].statut)
        return false
    }
  }
  return true
}

const isValid = () => {
  return !isEqualSchedule(user.value.planning.map(e => e.times), model.value) && isGoodSchedule(model.value)
}

const onButtonClick = async() => {
  if (!isValid()) return
  buttonLoading.value = true
  try {
    await setUser(user.value.uid, { planning: model.value.map((e) => { return { times: e } }) })
    user.value.planning = JSON.parse(JSON.stringify(model.value.map((e) => { return { times: e } })))
    changeReturn.value = true
  }
  catch {
    changeReturn.value = false
  }
  buttonLoading.value = false
  setTimeout(() => {
    changeReturn.value = undefined
  }, 10000)
}

setTimeout(() => {
  window.scrollTo({ top: 0 })
}, 100)

</script>

<style scoped>
.cal-container {
  background-color: var(--main-background);
  width: 99%;
  height: fit-content;
  font-size: 13px;
  box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 20px 15px 50px 0px;
  margin-bottom: 20px;

}

.cal-container-schedule {
  min-width: 800px;
  padding-bottom: 40px;
  padding-left: 60px;
}

.cal-container-modify {
  display: flex;
  flex-direction: column;
  min-width: 300px;
}

.cal-container-complete-button {
  align-self: flex-end;
  padding-right: 70px;
  margin-top: 30px;
  min-width: 150px;
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

@media screen and (max-width: 1020px){
  .cal-container {
    width: 98%;
    flex-direction: column;
    margin-left: 7px;
  }
  .cal-container-schedule {
    min-width: 0;
    width: 98%;
    padding-left: calc(7vw + 25px);
  }
  .cal-container-modify {
    min-width: 0;
  }
}

@media screen and (max-width: 520px){
  .cal-container {
    width: 97%;

    flex-direction: column;
  }
  .cal-container-schedule {
    width: 99%;
  }

}

</style>

<route lang="yaml">
meta:
  layout: dash
</route>
