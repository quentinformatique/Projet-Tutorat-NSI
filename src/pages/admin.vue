<template>
  <div v-if="isWait" class="l-app">
    <Loading />
    <div>
      Chargement en cours, veuillez patienter...
    </div>
  </div>
  <div v-else class="l-app">
    <Button id="rick" label="Accéder au pannel administrateur" styles="blurple" :options="{disabled: false}" :loading="isButtonLoading" @click="onButtonClick" />
  </div>
</template>

<script setup lang="ts">
const isWait = ref(true)
const buttonIsLoading = ref(false)
setTimeout(() => {
  isWait.value = false
}, 5000)

const onButtonClick = () => {
  window.location.replace('https://youtu.be/dQw4w9WgXcQ')
}
</script>

<style scoped>
.l-app {
  text-align: center;
}

</style>

<route lang="yaml">
meta:
  layout: none
</route>
