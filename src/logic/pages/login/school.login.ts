import type { SchoolPreferencesType } from '../../profil/school/school-type'

export interface Option { value: string; label: string }
interface Options {
  classe: undefined | Option[]
  spe: {
    a: Option[]
    b: Option[]
    c: Option[]
  }
  lv: {
    a: Option[]
    b: Option[]
  }
  option: undefined | Option[]
  section: Option[]
  subjects: {
    helper: undefined | Option[]
    receiver: undefined | Option[]
    good: undefined | Option[]
    bad: undefined | Option[]
  }
}

export const selectOptions = {
  niveau: [
    { value: 'seconde', label: 'Seconde Générale et Technologique' },
    { value: 'premiere-g', label: 'Première Générale' },
    { value: 'premiere-t', label: 'Première Technologique' },
    { value: 'terminal-g', label: 'Terminale Générale' },
    { value: 'terminal-t', label: 'Terminale Technologique' },
  ],
  classe: new Map([
    ['seconde', [
      { value: '2nd1', label: '2nd1' },
      { value: '2nd2', label: '2nd2' },
      { value: '2nd3', label: '2nd3' },
      { value: '2nd4', label: '2nd4' },
      { value: '2nd5', label: '2nd5' },
      { value: '2nd6', label: '2nd6' },
      { value: '2nd7', label: '2nd7' },
      { value: '2nd8', label: '2nd8' },
      { value: '2nd9', label: '2nd9' },
      { value: '2nd10', label: '2nd10' },
      { value: '2nd11', label: '2nd11' },
    ]],
    ['premiere-g', [
      { value: '1g1', label: '1G1' },
      { value: '1g2', label: '1G2' },
      { value: '1g3', label: '1G3' },
      { value: '1g4', label: '1G4' },
      { value: '1g5', label: '1G5' },
      { value: '1g6', label: '1G6' },
      { value: '1g7', label: '1G7' },
    ]],
    ['premiere-t', [
      { value: '1std2a', label: '1STD2A' },
      { value: '1stl', label: '1STL' },
    ]],
    ['terminal-g', [
      { value: 'tg1', label: 'TG1' },
      { value: 'tg2', label: 'TG2' },
      { value: 'tg3', label: 'TG3' },
      { value: 'tg4', label: 'TG4' },
      { value: 'tg5', label: 'TG5' },
      { value: 'tg6', label: 'TG6' },
      { value: 'tg7', label: 'TG7' },
    ]],
    ['terminal-t', [
      { value: 'tstd2a', label: 'TSTD2A' },
      { value: 'tstl', label: 'TSTL' },
    ]],
  ]),
  spe: [
    { value: 'ap-spe', label: 'Arts Plastiques' },
    { value: 'cav-spe', label: 'Cinéma AudioVisuel' },
    { value: 'ghhsp-spe', label: 'Histoire-Géographie, Géopolitique et Science Poilitique' },
    { value: 'hlp-spe', label: 'Humanité, Littérature et Philosophie' },
    { value: 'llce-spe', label: 'Langues, Littératures et Cultures Etrangère' },
    { value: 'maths-spe', label: 'Mathématiques' },
    { value: 'nsi-spe', label: 'Numérique et Science de l\'Informatique' },
    { value: 'pc-spe', label: 'Physique-Chimie' },
    { value: 'svt-spe', label: 'Science de la Vie et de la Terre' },
    { value: 'ses-spe', label: 'Science Economique et Sociales' },
  ],
  techno: [
    { value: 'std2a', label: 'STD2A' },
    { value: 'stl', label: 'STL' },
  ],
  lv: [
    { value: 'alld-lv', label: 'Allemand' },
    { value: 'angl-lv', label: 'Anglais' },
    { value: 'esp-lv', label: 'Espagnol' },
  ],
  option: new Map([
    ['seconde', [
      { value: 'ccd-opt', label: 'Création Cultures Design' },
      { value: 'sl-opt', label: 'Science Laboratoire' },
    ]],
    ['premiere-g', [
      { value: 'chinois-opt', label: 'Chinois' },
    ]],
    ['premiere-t', [
    ]],
    ['terminal-g', [
      { value: 'chinois-opt', label: 'Chinois' },
    ]],
    ['terminal-t', [
    ]],
    ['default', [
    ]],
  ]),
  section: {
    lang: [
      { value: 'alld-euro', label: 'Allemand' },
      { value: 'angl-euro', label: 'Anglais' },
      { value: 'esp-euro', label: 'Espagnol' },
    ],
    dnl: [
      { value: 'eps-dnl', label: 'Education Physique et Sportive' },
      { value: 'hist-dnl', label: 'Histoire-Géographie' },
      { value: 'maths-dnl', label: 'Mathématiques' },
      { value: 'ses-dnl', label: 'Sciences Economique et Sociale' },
    ],
  },
  subject: new Map([
    ['seconde', [
      { value: 'maths', label: 'Mathématiques' },
      { value: 'pc', label: 'Physique-Chimie' },
      { value: 'ses', label: 'Sciences Economique et Sociale' },
      { value: 'snt', label: 'Sciences Numérique et Technologique' },
      { value: 'svt', label: 'Sciences de la Vie et de la Terre' },
    ]],
    ['premiere-g', [
      { value: 'es', label: 'Enseignement Scientifique' },
    ]],
    ['premiere-t', [
      { value: 'maths', label: 'Mathématiques' },
    ]],
    ['terminal-g', [
      { value: 'es', label: 'Enseignement Scientifique' },
      { value: 'philo', label: 'Philosophie' },
    ]],
    ['terminal-t', [
      { value: 'maths', label: 'Mathématiques' },
      { value: 'philo', label: 'Philosophie' },
    ]],
    ['default', [
      { value: 'fr', label: 'Français' },
      { value: 'hist', label: 'Histoire-Géographie' },
    ]],
    ['premiere-t-stl', [
      { value: 'bb-tspe', label: 'Biochimie-Biologie' },
      { value: 'spcl-tspe', label: 'Sciences Physiques et Chimiques en Laboratoire' },
      { value: 'pcm-tspe', label: 'Physique-Chimie et Mathématiques' },
    ]],
    ['terminal-t-stl', [
      { value: 'spcl-tspe', label: 'Sciences Physiques et Chimiques en Laboratoire' },
      { value: 'pcm-tspe', label: 'Physique-Chimie et Mathématiques' },
    ]],
    ['premiere-t-std2a', [
      { value: 'dma-tspe', label: 'Design et Métiers d\'Arts' },
      { value: 'onl-tspe', label: 'Outils et Langages Numériques' },
      { value: 'pc-tspe', label: 'Physique-Chimie' },
    ]],
    ['terminal-t-std2a', [
      { value: 'amd-tspe', label: 'Analyse et Méthodes en Design' },
      { value: 'ccdma-tspe', label: 'Conception et Création en Design et Métiers d\'Arts' },
    ]],
  ]),
}

const getDefaultOptions = () => {
  const defaultOptions: Options = {
    classe: undefined,
    spe: {
      a: selectOptions.spe,
      b: selectOptions.spe,
      c: selectOptions.spe,
    },
    lv: {
      a: selectOptions.lv,
      b: selectOptions.lv,
    },
    option: undefined,
    section: selectOptions.section.lang,
    subjects: {
      helper: undefined,
      receiver: undefined,
      good: undefined,
      bad: undefined,
    },
  }
  return defaultOptions
}

export const models = reactive<{ value: SchoolPreferencesType }>({
  value: {
    level: '',
    class: '',
    spe: {
      a: '',
      b: '',
      c: '',
    },
    techno: '',
    lv: {
      a: '',
      b: '',
    },
    option: [],
    section: {
      lang: '',
      dnl: '',
    },
    subjects: {
      good: [],
      bad: [],
    },
    tutorat: {
      helper: {
        wish: false,
        subjects: [],
      },
      receiver: {
        wish: false,
        subjects: [],
      },
    },

  },

})

export const setModels = (data: SchoolPreferencesType) => {
  models.value = { ...models.value, ...data }
}

export const options = reactive(getDefaultOptions())
export const optionOptions = ref()

export const getOption = (niveau: string, spe?: { a?: string; b?: string; c?: string }, model: string[] = []): unknown[] => {
  const options = selectOptions.option.get(niveau)
  const defaultOptions = <Option[]>selectOptions.option.get('default')
  if (!options)
    return []
  const copyOptions = [...options]
  for (const defaultOption of defaultOptions)
    copyOptions.push(defaultOption)
  if (!model.includes('ap-opt'))
    copyOptions.push({ value: 'cav-opt', label: 'Cinéma AudioVisuel' })
  if (!model.includes('cav-opt'))
    copyOptions.push({ value: 'ap-opt', label: 'Arts Plasitiques' })
  if (niveau === 'premiere-g' && spe) {
    if (spe.a !== 'maths-spe' && spe.b !== 'maths-spe' && spe.c !== 'maths-spe')
      copyOptions.push({ value: 'mathsSpe-opt', label: 'Mathématiques Spécifiques' })
  }

  if (niveau === 'terminal-g' && spe) {
    if (spe.c === 'maths-spe')
      copyOptions.push({ value: 'maths-compl-opt', label: 'Mathématiques Complémentaires' })
    else if (spe.a === 'maths-spe' || spe.b === 'maths-spe')
      copyOptions.push({ value: 'maths-expert-opt', label: 'Mathématiques Expertes' })
  }

  return copyOptions
}

export const getSubjects = (models: SchoolPreferencesType) => {
  const options: Option[] = []

  const niveauSubjects = selectOptions.subject.get(models.level)
  const defaultSubjects = selectOptions.subject.get('default')
  if (!niveauSubjects || !defaultSubjects)
    return options
  options.push(...defaultSubjects, ...niveauSubjects)

  const lvSubjects = selectOptions.lv.filter((v: any) => Object.values(models.lv).includes(v.value))
  options.push(...lvSubjects)

  if (models.level.endsWith('-g')) {
    const speSubjects = selectOptions.spe.filter((v: any) => {
      const isSpe = Object.values(models.spe).includes(v.value)
      const isLastSpe = models.spe.c === v.value
      const isLostSpe = models.level === 'terminal-g' && isLastSpe
      return isSpe && !isLostSpe
    })
    options.push(...speSubjects.map((e) => { return { ...e, label: `Spécialité ${e.label}` } }))
  }

  if (models.techno)
    options.push(...selectOptions.subject.get(`${models.level}-${models.techno}`) ?? [])

  const niveauOptions = selectOptions.option.get(models.level)
  const defaultOptions = selectOptions.option.get('default')
  if (!niveauOptions || !defaultOptions)
    return options
  const optionSubjects = [...defaultOptions, ...niveauOptions, { value: 'maths-expert-opt', label: 'Mathématiques Expertes' }, { value: 'maths-compl-opt', label: 'Mathématiques Complémentaires' }].filter(
    opt => models.option.includes(opt.value),
  )
  options.push(...optionSubjects.map((e) => { return { ...e, label: `Option ${e.label}` } }))

  const sectionSubjects = selectOptions.section.lang.filter(
    section => models.section.lang === section.value,
  )
  options.push(...sectionSubjects.map((e) => { return { ...e, label: `Section Euro ${e.label}` } }))

  if (models.section.lang === 'angl-euro') {
    const dnlSubjects = selectOptions.section.dnl.filter(
      dnl => models.section.dnl === dnl.value,
    )
    options.push(...dnlSubjects.map((e) => { return { ...e, label: `DNL ${e.label}` } }))
  }

  return options
}
