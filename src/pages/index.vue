<template>
  <div class="gray row first-row">
    <div class="row-content">
      <div class="row-text">
        Bienvenue sur le site du Tutorat de François d'Estaing
      </div>
      <div class="row-img">
        <img class="fde-logo" src="/logo_fde.png">
      </div>
    </div>
  </div>
  <div class="white row">
    <div class="row-content img-left">
      <div class="row-img">
        <img src="/book.png">
      </div>
      <div class="row-text">
        Pour apprendre et progresser ensemble. A travers ce site vous pouvez vous entraider, proposer votre aide et en recevoir.
      </div>
    </div>
  </div>
  <div class="gray row">
    <div class="row-content">
      <div class="row-text">
        Trouver de l'aide  et en donner, s'aider pour avancer, le site vous met en relation avec des tutorants.
      </div>
      <div class="row-img">
        <img src="/loupe.png">
      </div>
    </div>
  </div>
  <div class="white row">
    <div class="row-content last">
      <div>
        Prêt à commencer ?
      </div>
      <GoogleAuth color="gray" />
    </div>
  </div>
</template>

<script setup lang="ts">

setTimeout(() => {
  window.scrollTo({ top: 0 })
}, 100)

</script>

<style scoped>
.first-row {
  margin-top: 50px;
}

.first-row .row-content {
  flex-direction: column-reverse;
  align-items: center;
  gap: 2rem;
}

.first-row .row-content .row-text {
  text-align: center;
}

.row {
  width: 100%;
  font-size: 25px;
  height: max-content;
  display: grid;
  align-items: center;
  grid-auto-flow: column;
  padding: 50px 0;
}

.gray {
  background-color: var(--secondary-background);
}

.white {
  background-color: var(--main-background);
}

.row-content{
  display: flex;
  justify-content: space-around;
  align-content: center;
  flex-wrap: wrap-reverse;
  margin: 0 100px;
}

.img-left {
  flex-wrap: wrap;
}

.last {
  flex-direction: column;
  justify-self: center;
  gap: 2rem;
  display: flex;
  align-items: center;
}

.row-text {
  width: min(582px, 90%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.row-img {
  width: min(250px, 70%);
}

@media screen and (max-width: 520px){
  .row-content{
    gap: 4rem;
    margin: 0 0;
  }
}

</style>

<route lang="yaml">
meta:
  layout: home
</route>
