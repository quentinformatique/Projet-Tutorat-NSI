<template>
  <div class="select">
    <label :for="`select-${props.id}`">{{ props.label }}<div v-if="required" class="required">*</div></label>
    <VSelect
      :id="`select-${props.id}`"
      v-model="value"
      :reduce="(e: any) => e.value"
      :options="opts"
      :searchable="search"
      :multiple="tags"
    />
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
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: [String, Array],
    required: true,
  },
  search: {
    type: Boolean,
    required: false,
    default: false,
  },
  tags: {
    type: Boolean,
    required: false,
    default: false,
  },
  required: {
    type: Boolean,
    required: false,
    default: true,
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

const opts = computed({
  get: () => {
    if (value.value && value.value.length) {
      if (value.value.endsWith) {
        if (!props.options.map(({ value }) => value).includes(value.value))
          value.value = ''
      }
      else {
        const nV = []
        let hasChanged = false
        for (const v of value.value) {
          if (props.options.map(({ value }) => value).includes(v))
            nV.push(v)
          else
            hasChanged = true
        }
        if (hasChanged)
          value.value = nV
      }
    }
    return props.options
  },

})

watch(value, () => update('change', null))
</script>

<style scoped>
.select {
  width: 90%;
}

.required {
  color: var(--color-danger);
  display: inline-block;
  margin-left: 4px;
}
</style>
