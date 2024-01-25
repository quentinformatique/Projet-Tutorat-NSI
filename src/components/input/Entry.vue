<template>
  <div class="entry">
    <label :for="`entry-${props.id}`">{{ props.label }}</label>
    <input :id="`entry-${props.id}`" v-model="value" :type="props.type" :placeholder="props.placeholder">
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: false,
    default: '',
  },
  modelValue: {
    type: String,
    required: true,
  },
})

const update = defineEmits(['update:modelValue'])

const value = computed({
  get: () => {
    return props.modelValue
  },
  set: (v: string) => {
    update('update:modelValue', v)
  },
})
</script>

<style scoped>
.entry * {
  display: block;
}

.entry {
  width: 100%;
  height: 2.5rem;
}

input {
  background-color: var(--main-background);
  font-size: 1rem;
  width: 100%;
  height: 100%;
  padding: 0.5rem;
  overflow: scroll;
}

</style>
