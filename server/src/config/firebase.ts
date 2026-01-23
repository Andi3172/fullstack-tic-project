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
const storage = admin.storage();
const bucket = storage.bucket('YOUR_PROJECT_ID.appspot.com'); // Replace with your actual bucket name

export { db, auth, storage, bucket };


////Why is COMMIT NOT WORKING////