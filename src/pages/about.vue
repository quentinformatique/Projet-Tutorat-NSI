<template>
  <div class="container">
    <div class="item">
      <div class="title">
        Qui sommes nous ?
      </div>
      <div class="content">
        <div class="part">
          Nous sommes Quentin et Mattéo, 2 ex-lycéen au Lycée François d'Estaing.
        </div>
      </div>
    </div>
    <div class="item">
      <div class="title">
        Pourquoi ce site ?
      </div>
      <div class="content">
        <div class="part">
          A l'origine le site a été créé pour un projet de fin d'année en NSI.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
setTimeout(() => {
  window.scrollTo({ top: 0 })
}, 100)

</script>

<style scoped>

</style>

<route lang="yaml">
meta:
  layout: info
</route>
