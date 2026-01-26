import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import path from 'path';

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("Firebase initialized using Environment Variable");
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", err);
  }
} else {
  try {
    serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));
    console.log("Firebase initialized using Local File");
  } catch (err) {
    console.error("Failed to load serviceAccountKey.json:", err);
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();


export { db, auth, storage };


////Why is COMMIT NOT WORKING////