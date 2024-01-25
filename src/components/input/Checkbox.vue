<template>
  <div class="checkbox">
    <label :for="`checkbox-${props.id}`">{{ props.label }}</label>
    <input
      :id="`checkbox-${props.id}`"
      v-model="value"
      :class="styles"
      type="checkbox"
      name=""
      @change="() => update('change', null)"
    >
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
    required: false,
    default: '',
  },
  styles: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const update = defineEmits(['update:modelValue', 'change'])

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
label {
    display: block;
    margin-bottom: 8px;
}

input[type="checkbox"] {
    margin-bottom: 5px;
    position: relative;
    width: 52px;
    height: 30px;
    -webkit-appearance: none;
    background-color: #c6c6c6;
    outline: none;
    border-radius: 20px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    transition: 0.5s;
}

.blurple:checked[type="checkbox"] {
    background-color: var(--color-blurple);
}

input[type="checkbox"]::before {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 20px;
    top: 0;
    left: 0;
    background-color: #ffffff;
    transform: scale(0.9);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    transition: 0.5s;

}

input:checked[type="checkbox"]::before {
    left: 22px;

}

</style>
