export interface SchoolPreferencesType {
  level: string
  class: string
  lv: {
    a: string
    b: string
  }
  spe: {
    a: string
    b: string
    c: string
  }
  techno: string
  option: string[]
  section: {
    lang: string
    dnl: string
  }
  subjects: {
    good: string[]
    bad: string[]
  }
  tutorat: {
    helper: {
      wish: boolean
      subjects: string[]
    }
    receiver: {
      wish: boolean
      subjects: string[]
    }
  }
}

export interface PartialSchoolPreferencesType {
  level?: string
  class?: string
  lv?: {
    a?: string
    b?: string
  }
  spe?: {
    a?: string
    b?: string
    c?: string
  }
  techno?: string
  option?: string[]
  section?: {
    lang?: string
    dnl?: string
  }
  subjects?: {
    good?: string[]
    bad?: string[]
  }
  tutorat?: {
    helper?: {
      wish?: boolean
      subjects?: string[]
    }
    receiver?: {
      wish?: boolean
      subjects?: string[]
    }
  }
}
