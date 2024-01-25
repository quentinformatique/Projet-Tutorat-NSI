import { correspondingTable, labels } from './school-data'
import type { PartialSchoolPreferencesType } from './school-type'

export const isValidChoices = (choices?: PartialSchoolPreferencesType) => {
  if (!choices)
    return false
  const hasLevel = !!choices.level
  const hasClasse = !!choices.class
  const hasLv = !!choices.lv?.a && !!choices.lv.b
  const hasDnl = choices.section?.lang !== 'angl-euro' || !!choices.section.dnl || choices.level === 'seconde'

  const needSpe = choices.level && ['premiere-g', 'terminal-g'].includes(choices.level)
  const hasSpe = !needSpe || (!!choices.spe?.a && !!choices.spe.b && !!choices.spe.c)

  const needTech = choices.level && ['premiere-t', 'terminal-t'].includes(choices.level)
  const hasTech = !needTech || !!choices.techno

  const hasHelperSubjects = !choices.tutorat?.helper?.wish || choices.tutorat?.helper?.subjects?.length !== 0
  const hasReceiverSubjects = !choices.tutorat?.receiver?.wish || choices.tutorat?.receiver?.subjects?.length !== 0
  const hasSubjects = hasHelperSubjects && hasReceiverSubjects

  const askHelpOrReceive = !!choices.tutorat?.helper?.wish || !!choices.tutorat?.receiver?.wish

  return hasLevel && hasClasse && hasLv && hasDnl && hasSpe && hasTech && hasSubjects && askHelpOrReceive
}

export const getSchoolLabel = (id: string, prefix?: boolean): string => {
  let label = labels.has(id) ? <string>labels.get(id) : id
  if (prefix) {
    if (id.endsWith('-spe') || id.endsWith('-tspe'))
      label = `Spécialité ${label}`
    else if (id.endsWith('-opt'))
      label = `Option ${label}`
    else if (id.endsWith('-lv'))
      label = `Langue Vivante ${label}`
    else if (id.endsWith('-euro'))
      label = `Section Européenne ${label}`
    else if (id.endsWith('-dnl'))
      label = `DNL ${label}`
  }
  return label
}

export const getHelpSubjects = (id: string) => {
  return correspondingTable.get(id) ?? [id]
}

export const getSameSubjects = (hSubjects: string[], rSubjects: string[]) => {
  const a = new Set<string>()
  for (const hS of hSubjects) {
    const subjects = getHelpSubjects(hS)
    for (const rS of rSubjects) {
      if (subjects.includes(rS))
        a.add(rS)
    }
  }
  return Array.from(a.values())
}

export const hasSameSubjects = (hS: string[], rS: string[]) => getSameSubjects(hS, rS).length > 0
