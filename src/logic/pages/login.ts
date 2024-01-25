export const pageState = ref<{ id: string; value: string }>({ id: 'default', value: '' })
export const togglePageState = (e: { id: string; value: string }) => { pageState.value = e }
