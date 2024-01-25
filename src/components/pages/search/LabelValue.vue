<template>
  <div class="container">
    <div class="label">
      {{ label }} :
    </div>
    <div class="value">
      {{ getSchoolLabel(value) ?? '-' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { getSchoolLabel } from '~/logic/profil/school/school-manager'

const props = defineProps({
  label: {
    type: String,
  },
  value: {
    type: String,
  },
})

</script>

<style scoped>
.value {
  padding-left: 20px;
}
</style>
