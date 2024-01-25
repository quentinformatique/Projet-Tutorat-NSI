<template>
  <div v-if="dashboardMenuEnable" class="maskPage blackoverlay" @click="toggleSideBar(false)" />
  <div v-else-if="activePopup" class="maskPage whiteoverlay" @click="openPopup('')" />
  <nav class="nav">
    <div class="top-bar">
      <TopBar />
    </div>
  </nav>
  <div class="body">
    <div class="side-bar">
      <SideBar v-model="dashboardMenuEnable" />
    </div>
    <div class="content" :class="{sideBarEnabled: dashboardMenuEnable}">
      <main class="main">
        <router-view />
      </main>
      <footer class="footer">
        <Footer />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { activePopup, dashboardMenuEnable, openPopup, toggleSideBar } from '~/logic/pages/dashboard'

</script>

<style scoped>

.side-bar {
  position: fixed;
  z-index: 999;
}

.top-bar {
  flex: 100%;
}

.content {
  padding: 0.5vh 0 0 0;
  width: 100%;
}

.sideBarEnabled {
  /* pointer-events: none; */
}

.main {
  padding-left: 9.5vh;
}

@media screen and (max-width: 520px){
  .content {
    padding: 7.9vh 0 0 0;
    width: 100%;
  }

  .main {
    padding-left: 0;
  }
  .side-bar {
  }
}

</style>
