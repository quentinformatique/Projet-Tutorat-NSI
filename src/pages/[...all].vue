<template>
  <div class="e404">
    <div>
      <div i="ic-round-warning-amber" class="icon" />
    </div>
    <div class="title">
      404
    </div>
    <div class="text">
      La page que vous cherchez n'éxiste pas !
    </div>
    <div>
      <Button id="return" label="Retour" styles="blurple" :options="{disabled: false}" :loading="isButtonLoading" @click="onClick" />
    </div>
  </div>
</template>

<script setup lang="ts">

const router = useRouter()
const isButtonLoading = ref(false)

const onClick = () => {
  isButtonLoading.value = true
  setTimeout(() => {
    router.back()
  }, 2000)
}

</script>

<style scoped>
.title {
  padding: 2vh 0 1vh 0;
  font-size: 3vh;
}

.text {
  font-size: 2vh;
  padding: 0.5vh 0 5vh 0;;
}

.icon {
  display: inline-block;
  font-size: 6vh;
}

.e404 {
  text-align: center;
  padding-top: 10vh;
  color: var(--main-text-color);
}

</style>

<route lang="yaml">
meta:
  layout: none
</route>
