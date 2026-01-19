import { defineStore } from 'pinia';
import { auth } from '@/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: any | null; // This will hold the backend user profile
  token: string | null;
  firebaseUser: FirebaseUser | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    firebaseUser: null,
  }),
  actions: {
    async syncUserWithBackend(firebaseUser: FirebaseUser) {
      this.firebaseUser = firebaseUser;
      this.token = await firebaseUser.getIdToken();
      
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to sync user with backend');
      }

      const data = await response.json();
      this.user = data.user;
    },

    async loginWithGoogle() {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await this.syncUserWithBackend(result.user);
    },

    async loginWithEmail(email: string, password: string) {
       const result = await signInWithEmailAndPassword(auth, email, password);
       await this.syncUserWithBackend(result.user);
    },

    async register(email: string, password: string, firstName: string, lastName: string) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Note: In a real app we'd update the profile on Firebase side too, or send these fields to backend
      // ideally we send firstName/lastName to backend in the body, but for now our backend doesn't read body
      // it just syncs from token. We'll stick to basic sync for now as requested.
      await this.syncUserWithBackend(result.user);
    },

    async logout() {
      await signOut(auth);
      this.user = null;
      this.token = null;
      this.firebaseUser = null;
    }
  }
});
