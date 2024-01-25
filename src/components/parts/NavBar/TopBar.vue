<script setup lang="ts">
import { logout, user } from '~/logic/data/auth/auth-manager'
import { activePopup, openPopup } from '~/logic/pages/dashboard'

const router = useRouter()

const onLogout = () => {
  openPopup('')
  logout()
  router.push('/')
}

const changeRoute = (r: string, dashboard = true) => {
  openPopup('')
  const route = dashboard ? '/dashboard/' : '/'
  router.push(route.concat(r))
}

const notifs = [
  { id: '1', date: '', lvl: '1', name: 'new-message', content: 'Vous avez une nouveau message' },
  { id: '2', date: '', lvl: '1', name: 'new-class', content: 'Cours ajouté pour le 16/09' },
  { id: '3', date: '', lvl: '1', name: 'class-cancel', content: 'Votre cours du 15/03 a 10h est annulé' },
  { id: '4', date: '', lvl: '1', name: 'new-message', content: 'Vous avez une nouveau message' },
]
</script>

<template>
  <div class="TopBar">
    <div class="title">
      <div class="icon" i="ic-outline-school" />
      <div class="text">
        Tutorat Fde
      </div>
    </div>
    <div>
      <button class="" @click="openPopup('profil')">
        <div class="icon" i="ic-round-account-circle" />
        <div class="text">
          {{ user?.displayName }}
        </div>
      </button>
    </div>
  </div>

  <div v-if="activePopup === 'profil'" class="profile-popup popup">
    <div class="profile-content">
      <div @click="changeRoute('profil')">
        Modifier le profil
      </div>
      <div @click="changeRoute('profil/school')">
        Informations Scolaires
      </div>
      <div @click="changeRoute('planning')">
        Modifier mon planning
      </div>
      <div @click="changeRoute('profil/relation')">
        Mes tutorants et tutorés
      </div>
      <div class="profil-button" @click="onLogout()">
        Se deconnecter<div i="ic-baseline-log-out" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.TopBar {
  display: flex;
  justify-content: space-between;
  text-align: center;
  font-size: 2.5vh;
  background-color: var(--main-background);
  color: var(--secondary-text-color);
  box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.3);
  transition: 0.5s ease;
}

button {
  display: flex;
  align-items: center;
  padding: 2vh;
}

.TopBar * {
  display: flex;
}

.TopBar .title {
  display: flex;
  align-items: center;
  padding: 1.5vh;
  cursor: default;
}

.TopBar .text {
  margin-left: 1vh;
}

@media screen and (max-width: 520px){
  .TopBar .text{
    font-size: 0;
  }
}

.popup {
  background-color: var(--main-background);
  color: var(--secondary-text-color);
  box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.3);
  position: absolute;
  height: fit-content;
  max-width: 350px;
  width: fit-content;
  top: 70px;
  right: 30px;
}

.notif-topbar {
  font-size: 3vh;
  padding-top: 1vh;
  padding-left: 1.5vh;
  padding-bottom: 0.7vh;
  border-width: 0 0 1px 0;

}

.profile-content {
  font-size: 2.5vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
}

.profile-content > div {
  display: flex;
  align-items: center;
  padding: 5px;
  cursor: pointer;
}

.notif-content {
  border-width: 0 0 0.5px 0;
  font-size: 2.5vh;
}
</style>
