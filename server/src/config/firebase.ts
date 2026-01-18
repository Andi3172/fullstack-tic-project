import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Using a dynamic require as requested to load the service account key
// The path is relative to the compiled JS in dist, but ts-node handles it in src
const serviceAccount = require('../../serviceAccountKey.json') as ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
