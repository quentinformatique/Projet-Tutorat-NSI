<template>
  <div class="container">
    <div class="label">
      {{ label }} :
    </div>
    <div v-for="(item, index) in value" :key="item" class="value">
      - {{ getSchoolLabel(item, prefix) }}{{ value.length - 1 <= index ? complete : '' }}
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
    type: Array,
  },
  complete: {
    required: false,
    default: '',
  },
  prefix: {
    type: Boolean,
    required: false,
    default: false,
  },
})

</script>

<style scoped>
.value {
  padding-left: 20px;
}
</style>
