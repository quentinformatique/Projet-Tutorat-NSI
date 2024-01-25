<template>
  <div class="search-container">
    <div class="search-title-container">
      <div class="search-title-main">
        Trouver un tutorant
      </div>
      <div class="search-title-sub">
        Vous souhaitez trouver un tutorant, n'hésitez pas à séléctionner la personne qui vous convient le mieux !
      </div>
      <div v-if="!user.school.tutorat.receiver.wish" class="search-title-error">
        <div class="search-title-error-text">
          Vous avez dit que vous ne vouliez pas recevoir d'aide, si vous souhaitez trouver un tutorant, veuillez modifier votre profil !
        </div>
        <div class="search-title-go-to-profile" @click="router.push('/dashboard/profil/school')">
          Modifier son profil
        </div>
      </div>
    </div>
    <div v-if="user.school.tutorat.receiver.wish" class="search-filters">
      <div class="search-filters-title">
        Filtres
      </div>
      <div class="search-filters-checkboxs">
        <div>
          <Checkbox id="times" v-model="filter.times" styles="blurple" label="Horaires communes" />
          <Checkbox v-if="user.school.level !== 'seconde'" id="filiaire" v-model="filter.filiaire" styles="blurple" label="Même filiaire (générale et technologique)" />
        </div>
      </div>
    </div>
    <div v-if="user.school.tutorat.receiver.wish" class="search-users-container">
      <div v-for="[publicUser, statut] in getFilteredUsers()" :key="publicUser.uid" class="search-user-container">
        <div class="search-user-flex">
          <div class="search-user-name-avatar">
            <img class="search-user-avatar" :src="publicUser.avatar" alt="">
            <div class="search-user-name-email">
              <div class="search-user-name">
                {{ publicUser.displayName }}
              </div>
              <div class="search-user-email">
                {{ publicUser.email }}
              </div>
            </div>
          </div>
          <LabelValue label="Classe" :value="publicUser.school.level" />
          <LabelValues label="Veut aider en" :value="publicUser.school.tutorat.helper.subjects" prefix />
          <LabelValues label="Est aussi à l'aise en" :value="publicUser.school.subjects.good" prefix />
          <LabelValue label="Description" :value="publicUser.description" class="search-user-w-high" />
          <LabelValue label="Åge" :value="publicUser.birthday ? `${new Date(new Date().getTime() - publicUser.birthday.toDate().getTime()).getFullYear() - 1970} ans` : '-'" />
        </div>
        <div class="search-user-button">
          <Button id="look" label="Voir le profil" styles="blurple" :options="{disabled: false}" @click="() => { router.push(`/dashboard/search/${publicUser.uid}`) }" />
        </div>
      </div>
      <div v-if="getFilteredUsers().length === 0" class="search-user-container no-one">
        Nous sommes désolé mais aucun profil n'a été trouvé pour vous, veuillez réessayer en changeant les filtres ou plus tard !
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserData } from '~/logic/data/firestore/datas/Users'
import { getForcedUsers, getUsers } from '~/logic/data/firestore/datas/Users'
import { toggleLoadingPage } from '~/main'
import { user } from '~/logic/data/auth/auth-manager'
import { hasSameTimes } from '~/logic/profil/planning/planning-manager';
import { hasSameSubjects, getSameSubjects } from '~/logic/profil/school/school-manager'
import { isValidChoices } from '~/logic/profil/school/school-manager'
import { isValidPlanning } from '~/logic/profil/planning/planning-manager'

const router = useRouter()

const filter = reactive({ times: true, filiaire: true })

const users = ref<Map<string, UserData>>(getUsers())
if (users.value.size === 0) {
  const f = async() => {
    toggleLoadingPage(true)
    users.value = await getForcedUsers()
    toggleLoadingPage(false)
  }
  f()
}

const getSortedUsers = (publicUsers: UserData[]): [UserData, string][] => {
  const u = (<UserData>user.value)
  return publicUsers.map(p => {
    return [p, '']
  })
}

const getFilteredUsers = () => {
  const filteredList: UserData[] = []
  const u = <UserData> user.value
  for (const [_, p] of users.value) {
    if (!u.school || !p.school || !p.planning)
      continue
    if (!isValidChoices(p.school) || !isValidPlanning(p.planning))
      continue
    if (!p.school.tutorat.helper.wish)
      continue
    if (p.uid === u.uid) 
      continue
    if (!hasSameSubjects(p.school.tutorat.helper.subjects, u.school.tutorat.receiver.subjects))
      continue
    if (filter.filiaire && p.school.level !== 'seconde' && u.school.level !== 'seconde' && u.school.level.slice(-1) !== p.school.level.slice(-1))
      continue
    if (!u.planning || !p.planning)
      continue
    if (filter.times && !hasSameTimes(u.planning.map(schedule => schedule.times), p.planning.map(schedule => schedule.times)))
      continue
    const pI = p.school.level === 'seconde' ? 1 : p.school.level.startsWith('premiere') ? 2 : 3
    const uI = u.school.level === 'seconde' ? 1 : u.school.level.startsWith('premiere') ? 2 : 3
    if (pI < uI)
      continue
    filteredList.push(p)
  }
  return getSortedUsers(filteredList)
}



</script>

<style scoped>
.search-container {
  margin: 0 15px 15px;
}

.search-title-container {
  background-color: var(--main-background);
  color: var(--secondary-text-color);
  box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.3);
  margin-bottom: 10px;
  padding: 25px;
}

.search-title-main {
  font-size: 27px;
}

.search-title-sub {
  font-size: 13px;
}

.search-title-error {
  margin: 80px 0 300px 0;
}

.search-title-error-text {
  font-size: 15px;
  color: var(--color-danger);
  font-style: italic;
}

.search-filters {
  background-color: var(--main-background);
  color: var(--secondary-text-color);
  box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.3);
}

.search-filters {
  padding: 30px;
}

.search-filters-title {
  font-size: 23px;
  padding-bottom: 10px;
}

.search-filters-checkboxs {
  padding-left: 20px;
}

.search-filters-checkboxs > * {
  display: flex;
  flex-wrap: wrap;
  gap: 4rem;
  padding-right: 10vw;
  color: #404040;
}

.search-filters-check-text {
  margin: 30px 0 10px 0;
  font-size: 15px;
  color: var(--color-danger);
  font-style: italic;
}

.search-title-go-to-profile {
  margin: 50px 0 0 40px;
  padding: 5px 10px;
  width: fit-content;
  border-radius: 10px;
  border: 1px solid;
  border-color: #666666;
  color: var(--secondary-text-color);
  cursor: pointer;
}

.search-user-button {
  margin: 10px 0;
  width: 98%;
  display: flex;
  justify-content: flex-end;
}

.search-users-container {
  margin: 1rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

.search-user-container {
  background-color: var(--main-background);
  color: var(--secondary-text-color);
  box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.3);
  padding: 20px;
}

.search-user-flex {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.search-user-name-avatar {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.search-user-important-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.search-user-avatar {
  border-radius: 50%;
}

.search-user-name {
  font-size: 23px;
}

.search-user-w-high {
  width: 800px;
}

.no-one {
  width: 100%;
  font-size: 18px;
  color: var(--color-orange)
}

@media screen and (max-width: 520px){
  .search-filters-checkboxs > * {
    gap: 1rem;
  }
  .search-user-avatar {
    display: none;
    font-size: 5vw;
  }

  .search-user-name-email {
    font-size: 5vw;
    overflow: hidden;
  }

  .search-user-name {
    font-size: 6vw;
  }

  .search-user-w-high {
    width: fit-content;
  }
}

</style>

<route lang="yaml">
meta:
  layout: dash
</route>
