import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAuX19RmaFWBcKB5PSZ8gUYND_3DWQS6uI',
  authDomain: 'tutorat-fde.firebaseapp.com',
  projectId: 'tutorat-fde',
  storageBucket: 'tutorat-fde.appspot.com',
  messagingSenderId: '926532289308',
  appId: '1:926532289308:web:694157cf48d6bfbf6f30d9',
}

export const app = initializeApp(firebaseConfig)

export const provider = new GoogleAuthProvider()
export const auth = getAuth(app)

export const db = getFirestore(app)
