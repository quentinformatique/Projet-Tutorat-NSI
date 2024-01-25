export const firestoreCache = reactive(new Map<string, Map<string, Object>>())

export const getCache = (name: string) => {
  if (!firestoreCache.has(name)) {
    const newCache = reactive(new Map<string, Object>())
    firestoreCache.set(name, newCache)
  }

  return <Map<string, Object>> firestoreCache.get(name)
}

export const getSubCache = (col: string, doc: string, name: string) => {
  if (!firestoreCache.has(col)) {
    const newCache = reactive(new Map<string, Object>())
    firestoreCache.set(col, newCache)
  }
  if (!firestoreCache.get(col)?.has(doc)) {
    const newCache = reactive(new Map<string, Object>())
    firestoreCache.get(col)?.set(doc, newCache)
  }
  if (!(<Map<string, Map<string, Object>>>firestoreCache.get(col)?.get(doc)).has(name)) {
    const newCache = reactive(new Map<string, Object>())
    firestoreCache.get(col)?.get(doc)?.set(name, newCache)
  }
  return <Map<string, Object>> firestoreCache.get(col)?.get(doc)?.get(name)
}
