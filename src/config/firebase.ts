import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

const firebaseApp = getApps().length
  ? getApps()[0]!
  : initializeApp(
      serviceAccountPath
        ? {
            credential: cert(
              JSON.parse(
                readFileSync(serviceAccountPath, "utf8"),
              ),
            ),
          }
        : {
            credential: applicationDefault(),
          },
    );

export const firestore = getFirestore(firebaseApp);