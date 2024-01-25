<script setup lang="ts">
import { isLoading } from './main'
useHead({
  title: 'Tutorat FdE',
  meta: [
    { name: 'description', content: 'Venez découvrir votre futur tutoré ou tutorant !' },
  ],
})
</script>

<template>
  <router-view v-if="!isLoading" />
  <div v-else class="l-app">
    <Loading />
    <div>
      Chargement en cours, veuillez patienter...
    </div>
  </div>
</template>

<style>
.l-app {
  padding-top: 40vh;
  text-align: center;
}
</style>
