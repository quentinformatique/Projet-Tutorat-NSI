<template>
  <nav class="nav">
    <InfoBar return="dashboard/search" />
  </nav>
  <main class="main">
    <div class="search">
      <router-view />
    </div>
  </main>
  <footer class="footer">
    <Footer />
  </footer>
</template>

<style scoped>
.main {
  display: flex;
  justify-content: center;
  padding-top: 8vw;
  width: 100%;
}

.search {
  padding-top: max(3vw, 20px);
  padding-bottom: max(3vw, 10px);
  width: min(90%, 1000px);
  min-height: max(300px, 30vw);
  background: var(--main-background);
  display: flex;
  justify-content: center;
  margin-bottom: 29vh;
}

@media screen and (max-width: 1040px){

  .search {
    margin-top: 70px;
    width: min(96%, 1000px);
  }
}

</style>
