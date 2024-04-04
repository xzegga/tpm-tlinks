import {onCall, HttpsError} from "firebase-functions/v2/https";
import {logger} from "firebase-functions/v2";
import {getAuth} from "firebase-admin/auth";
import {initializeApp} from "firebase-admin/app";

initializeApp();
// export const assignUserClaims = onRequest(async (request, response) => {
export const assignUserClaims = onCall(async (request) => {
  const email = request.data.email;
  const customClaims = request.data.customClaims;

  if (!customClaims || !email) {
    throw new HttpsError("invalid-argument", "Missing required fields");
  }

  try {
    const {uid} = await getAuth().getUserByEmail(email);

    await getAuth().setCustomUserClaims(uid, customClaims);
    logger.info(`Successfully assigned custom claims to user ${uid}`);
    return {message: "Claims assigned successfully"};
  } catch (error) {
    logger.error(`Error assigning claims to user ${email}:`, error);
    throw new HttpsError("internal", "Failed to assign claims");
  }
});
