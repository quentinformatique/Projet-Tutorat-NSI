<template>
  <main class="form-main">
    <div class="form">
      <router-view />
    </div>
  </main>
  <Footer />
</template>

<style>
.form-main {
  display: flex;
  justify-content: center;
  margin-top: 8vw;
  width: 100%;
}

.form {
  padding-top: max(3vw, 20px);
  padding-bottom: max(3vw, 10px);
  width: min(95%, 910px);
  min-height: max(300px, 30vw);
  background: var(--main-background);
  display: flex;
  justify-content: center;
  margin-bottom: 29vh;
}
</style>
