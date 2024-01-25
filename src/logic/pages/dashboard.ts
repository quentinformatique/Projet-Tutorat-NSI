/* eslint-disable @typescript-eslint/no-use-before-define */

export const dashboardMenuEnable = ref(false)
export const dashboardSubMenuEnable = ref(false)

export const toggleSubMenu = (_: any, force: boolean | undefined = undefined) => {
  if (force === undefined)
    dashboardSubMenuEnable.value = !dashboardSubMenuEnable.value

  else
    dashboardSubMenuEnable.value = force

  if (dashboardSubMenuEnable.value)
    toggleSideBar(undefined, true)
}

export const toggleSideBar = (_: any, force: boolean | undefined = undefined) => {
  if (force === undefined)
    dashboardMenuEnable.value = !dashboardMenuEnable.value

  else
    dashboardMenuEnable.value = force
  if (!dashboardMenuEnable.value)
    toggleSubMenu(undefined, false)

  else
    openPopup('')
}

export const activePopup = ref()

export const openPopup = (name: string | undefined) => {
  if (activePopup.value === name) {
    activePopup.value = ''
    return
  }
  activePopup.value = name
  if (activePopup.value)
    toggleSideBar(undefined, false)
}
