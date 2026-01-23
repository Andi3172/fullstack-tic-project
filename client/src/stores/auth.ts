import { defineStore } from 'pinia';
import { auth } from '@/firebase';
import router from '@/router';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import axios from 'axios';

interface AuthState {
  user: any | null;       // Backend user profile
  token: string | null;   // Firebase ID token
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    firebaseUser: null,
    loading: true,
    error: null,
  }),

  actions: {
    initAuth() {
      // Manage global loading state based on Auth readiness
      this.loading = true;
      
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            await this.syncUserWithBackend(user);
            
            // Redirect if on login page after auto-login/refresh? 
            // Usually simpler to let the router guard handle redirects, 
            // but if we are manually redirecting purely for UX:
             const currentPath = router.currentRoute.value.path;
             if (currentPath === '/login' || currentPath === '/register') {
               router.push('/shop');
             }
          } catch (e: any) {
            console.error("Auto-login sync failed", e);
            this.error = "Failed to restore session";
            // Check if we should logout if sync fails? 
            // For now, keep firebaseUser but maybe no backend user.
          }
        } else {
          this.user = null;
          this.token = null;
          this.firebaseUser = null;
        }
        
        // Critical: App can now mount/render
        this.loading = false;
      });
    },

    async syncUserWithBackend(firebaseUser: FirebaseUser) {
      try {
        this.firebaseUser = firebaseUser;
        this.token = await firebaseUser.getIdToken();
        
        // Use Fetch or Axios. 
        // Using fetch here to avoid circular dep issues if axios was configured with store, 
        // but simple axios call is fine too.
        const response = await axios.post('http://localhost:3000/api/users', {}, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });

        this.user = response.data.user;
        this.error = null;
      } catch (err: any) {
        console.error("Backend sync error:", err);
        throw err;
      }
    },

    async loginWithGoogle() {
      try {
        this.loading = true;
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await this.syncUserWithBackend(result.user);
        router.push('/');
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async loginWithEmail(email: string, password: string) {
      try {
        this.loading = true;
        const result = await signInWithEmailAndPassword(auth, email, password);
        await this.syncUserWithBackend(result.user);
        router.push('/');
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register(email: string, password: string, firstName: string, lastName: string) {
      try {
        this.loading = true;
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Note: We might want to send firstName/lastName to backend here in a real app
        await this.syncUserWithBackend(result.user);
        router.push('/');
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await signOut(auth);
        this.user = null;
        this.token = null;
        this.firebaseUser = null;
        router.push('/login');
      } catch (err: any) {
        console.error("Logout error", err);
      }
    }
  },

  getters: {
    isAdmin(state) {
        // Simple hardcoded check for now
        return state.user?.email === 'admin@tic.com' || state.firebaseUser?.email === 'admin@tic.com';
    }
  }
});
