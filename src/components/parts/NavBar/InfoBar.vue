<template lang="">
  <div class="bar">
    <div class="item" @click="back()">
      <div class="icon" i="ic-round-arrow-back" />
      <div class="title">
        Retour
      </div>
    </div>
    <div class="item" @click="changeRoute('/dashboard')">
      <div class="icon" i="ic-outline-school" />
      <div class="title">
        Tutorat Fde
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  return: {
    required: false,
    type: String,
  },
})

const router = useRouter()

const changeRoute = (r: string) => {
  router.push(r)
}

const back = () => {
  if (props.return !== undefined)
    router.push(`/${props.return}`)
  else
    router.back()
}

</script>

<style scoped>
.bar {
  display: flex;
  justify-content: space-between;
  text-align: center;
  font-size: min(4vw, 18px);
  background-color: var(--main-background);
  padding: 8px 4vw;
  box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.3);
}

.item {
  display: flex;
  align-items: center;
  color: var(--main-text-color);
  padding: 10px;
  cursor: pointer;
}

.bar .icon {
  font-size: 1.8rem;
}
.bar .title {
  font-size: 1.2rem;
  margin-left: 1rem;
}

@media screen and (max-width: 520px){
  .bar .title {
    font-size: 0;
  }
}
</style>
