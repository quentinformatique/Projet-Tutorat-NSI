<script lang="ts" setup>
import { userLogin } from '~/logic/data/auth/auth-manager'

defineProps({
  color: {
    type: String,
    default: 'white',
    required: false,
  },
})

const runAuth = (router: any) => {
  router.push('login')
  // setTimeout(() => {
  //   userLogin()
  // }, 1000)
}

const router = useRouter()
</script>

<template>
  <div class="google-auth" :class="color">
    <!-- <div v-if="authLoading" class="loading">
      <Loading />
    </div> -->
    <div>
      <button class="login" @click="runAuth(router)">
        <div class="large-screen button">
          <div class="icon" i="carbon-logo-google" />
          <div class="text">
            Se connecter avec Google
          </div>
        </div>
        <div class="small-screen button">
          <div class="text">
            Se connecter
          </div>
        </div>
      </button>
    </div>
    <!-- <button
      v-else
      class="logout"
      title="Se déconnecter"
      @click="logout"
    >
      <div i="ic-baseline-log-out" />
    </button> -->
  </div>
</template>

<style scoped>
.google-auth {
  display: flex;
  align-items: center;
}

.loading {
  display: flex;
  transform: scale(1.5);
}

.login {
  padding: 10px;

}

.login button {
  background: var(--google-auth-background);
}

.login .icon {
  font-size: 1.8rem;
}
.login .text {
  font-size: 1.2rem;
}

.logout {
  background-color: #ff5252;
  padding: 1rem;
  display: flex;
  align-items: center;
  border-radius: 10px;
}

.button {
  gap: 0.5rem;
  align-items: center;
  color: var(--main-text-color);
}

.large-screen {
  display: flex;
}

.small-screen {
  display: none;
}

.white {
  --google-auth-background: var(--main-background);
}

.gray {
  --google-auth-background: var(--color-light-gray);
}

@media screen and (max-width: 520px){
  .large-screen {
    display: none;
  }

  .small-screen {
    display: flex;
  }
}
</style>
