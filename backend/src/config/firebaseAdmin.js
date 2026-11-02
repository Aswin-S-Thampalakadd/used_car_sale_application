import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let firebaseApp;

export const verifyFirebaseIdToken = async (idToken) => {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID_REQUIRED");
  }

  try {
    firebaseApp ??=
      getApps()[0] ||
      initializeApp({
        credential: applicationDefault(),
        projectId,
      });

    return await getAuth(firebaseApp).verifyIdToken(idToken);
  } catch (error) {
    if (error.code?.startsWith("auth/")) {
      throw new Error("INVALID_FIREBASE_TOKEN");
    }

    throw error;
  }
};
