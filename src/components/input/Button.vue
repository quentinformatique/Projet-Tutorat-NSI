<template>
  <div v-if="!loading" class="button">
    <button :class="[options, buttonClass, styles]" @click="onClick">
      {{ label }}
    </button>
  </div>
  <div v-else class="loading">
    <Loading />
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
  styles: {
    type: String,
    required: true,
  },
  options: {
    type: Object,
    required: true,
  },
  loading: {
  },
})
const update = defineEmits(['update:modelValue', 'click'])

const buttonClass = reactive({
  click: false,
})

const onClick = () => {
  if (!props.options.disabled) {
    buttonClass.click = true
    setTimeout(() => {
      buttonClass.click = false
      setTimeout(() => {
        update('click')
      }, 150)
    }, 150)
  }
}

</script>

<style scoped>

button {
    padding: 7px 18px 7px 18px;
    border-radius: 6px;
    font-size: min(12px);
    transition: 0.15s;
}

.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.click {
    transform: scale(0.9);
}

.loading {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

</style>
