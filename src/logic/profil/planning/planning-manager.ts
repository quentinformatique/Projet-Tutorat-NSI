import type { PlanningType } from './planning-type'
import { isGoodSchedule } from '~/logic/pages/login/planning.login'
import { updateUser, user } from '~/logic/data/auth/auth-manager'
import type { UserData } from '~/logic/data/firestore/datas/Users'
import { setUser } from '~/logic/data/auth/user'

export const isValidPlanning = (planning: PlanningType | undefined): boolean => {
  return !!planning && isGoodSchedule(planning.map(schedule => schedule.times))
}

interface ScheduleTime { start: string; end: string; statut: string }

type Schedule = ScheduleTime[][]

export const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
export const detailedTimes = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00']

export const getFreeTimes = (schedule: Schedule, restricted: boolean): Schedule => {
  const newDays = []
  for (const day of schedule) {
    const newDay = []
    for (const time of day) {
      if (!(time.start.endsWith(':00') || time.start.endsWith(':30')) || !(time.end.endsWith(':00') || time.end.endsWith(':30')))
        continue
      if (time.statut === 'buisy' || (time.statut === 'tutorat' && restricted))
        continue
      newDay.push(time)
    }
    newDays.push(newDay)
  }
  return newDays
}
export const getSeparatedTimes = (schedule: Schedule): Schedule => {
  const newDays = []
  for (const day of schedule) {
    let newDay: ScheduleTime[] = []
    for (const time of day) {
      const sTimes = detailedTimes.reduce((p, c) => {
        if (p.passEnd)
          return p
        if (c === time.start && !p.passStart) {
          p.array.push(<never>c)
          return { ...p, passStart: true }
        }
        if (!p.passStart)
          return p
        p.array.push(<never>c)
        if (c !== time.end)
          return p
        return { ...p, passEnd: true }
      }, { passStart: false, passEnd: false, array: [] })
      sTimes.array.pop()

      newDay = [...newDay, ...(<{ passStart: boolean; passEnd: boolean; array: [] }>sTimes).array.map((v) => {
        return { start: v, end: detailedTimes[detailedTimes.indexOf(v) + 1], statut: time.statut }
      })]
    }
    newDays.push(newDay)
  }
  return newDays
}

export const getSameTimes = (userSchedule: Schedule, publicUserSchedule: Schedule, restricted = false) => {
  const freeUTime = getSeparatedTimes(getFreeTimes(userSchedule, true))
  const freePTime = getSeparatedTimes(getFreeTimes(publicUserSchedule, restricted))
  const newDays = []
  for (const [i, userDay] of freeUTime.entries()) {
    const newDay = []
    const pUserDay = freePTime[i]
    for (const userTime of userDay) {
      for (const pUserTime of pUserDay) {
        if (userTime.start === pUserTime.start && userTime.end === pUserTime.end)
          newDay.push(userTime)
      }
    }
    newDays.push(newDay)
  }
  return newDays
}

export const hasSameTimes = (userSchedule: Schedule, publicUserSchedule: Schedule): boolean => {
  const sameTimes = getSameTimes(userSchedule, publicUserSchedule)
  for (const day of sameTimes) {
    if (day.some(day => day.statut === 'free' || day.statut === 'tutorat'))
      return true
  }
  return false
}

export const getTutoratSchedule = (day: string, start: string, end: string, statut: string) => {
  const separatedTimes = getSeparatedTimes((<UserData>user.value).planning.map(time => time.times))
  const separatedLocalTimes = getSeparatedTimes([[{ start, end, statut }]])
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  for (const time of separatedTimes[days.indexOf(day)]) {
    for (const lTime of separatedLocalTimes[0]) {
      if (time.start === lTime.start && time.end === lTime.end)
        time.statut = statut
    }
  }
  const newSchedule = []
  for (const day of separatedTimes) {
    const times: { start: string; end: string; statut: string }[] = []
    day.forEach((time) => {
      if (times.length === 0) {
        times.push(time)
        return
      }
      const lastValue = <{ start: string; end: string; statut: string }>times.pop()
      if (lastValue.end === time.start && lastValue.statut === time.statut) {
        lastValue.end = time.end
        times.push(lastValue)
      }
      else {
        times.push(lastValue, time)
      }
    })
    newSchedule.push(times)
  }
  return newSchedule
}

export const setTutoratSchedule = (day: string, start: string, end: string, statut: string) => {
  const schedule = getTutoratSchedule(day, start, end, statut).map((schedule) => { return { times: schedule } })
  updateUser({ ...(<UserData>user.value), planning: schedule })
  return setUser((<UserData>user.value).uid, {
    planning: schedule,
  })
}
