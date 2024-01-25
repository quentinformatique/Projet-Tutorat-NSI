<template>
  <nav class="nav">
    <InfoBar return="dashboard" />
  </nav>
  <main class="main">
    <div class="info">
      <div class="side-menu">
        <div class="title">
          Profil
        </div>
        <button class="left-button" @click="changeOnPage('')">
          Informations personnelles
        </button>
        <button class="left-button" @click="changeOnPage('school')">
          Informations scolaires
        </button>
        <button class="left-button" @click="changeOnPage('relation')">
          Mes relations
        </button>
        <!-- <button class="left-button" @click="changeOnPage('notif')">
          Notifications
        </button> -->
      </div>
      <div class="page">
        <router-view />
      </div>
    </div>
  </main>
  <footer class="footer">
    <Footer />
  </footer>
</template>

<script lang="ts" setup>

const router = useRouter()

const changeOnPage = (name: string) => {
  router.push(`/dashboard/profil/${name}`)
}

</script>

<style scoped>
.main {
  display: flex;
  justify-content: center;
  width: 100%;
}

.info {
  padding: max(3vw, 20px) 40px;
  width: min(90%, 1000px);
  min-height: max(300px, 30vw);
  background: var(--main-background);
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 8%;
  margin-bottom: 29vh;
  margin-top: 40px;
  padding-top: 40px;
}

.side-menu {
  display: flex;
  max-width: 155px;
  flex-direction: column;
  align-items: flex-start;
  border-width: 0 1px 0 0;
  border-color: #808080;
}

.left-button {
  padding: 15px 30px;
}

.main {
  display: flex;
}

.title {
  margin-bottom: 20px;
  margin-left: 20px;
}

.page {
  width: 600px;
}

@media screen and (max-width: 1040px){
  .title {
    width: 80%;
  }
  .side-menu {
    border-width: 0 0 1px 0;
    margin-bottom: 40px;
    flex-direction: row;

    padding-bottom: 20px;
    flex-wrap: wrap;
    text-align: start;
    min-width: 100%;
    width: fit-content;
  }

  .side-menu > button::before {
    content: "→";
  }

  .left-button {
    text-align: start;
  }
}

</style>

<route lang="yaml">
meta:
  layout: profil
</route>
