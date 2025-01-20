import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import validateToken from "../utils/validateUser";
import {logger} from "firebase-functions/v2";
import {getAuth} from "firebase-admin/auth";

/**
 * Save user to firebase auth
 *
 * @param {FirebaseFirestore.Firestore} db - The Firestore database instance.
 * @param {CallableRequest<any>} request - The request object containing data.
 * @return {Promise<any>} An object containing an array of projects data
 * and the last document for pagination.
 * @throws {HttpsError} Throws an error if there's an issue retrieving projects.
 */
export async function saveUserData(
  db: FirebaseFirestore.Firestore,
  request: CallableRequest<any>
): Promise<any> {
  const {token, user} = request.data as any;
  const {email, role, password, tenant, department} = user;

  await validateToken(token);

  try {
    const userRecord = await getAuth().createUser({
      email,
      emailVerified: true,
      password,
      disabled: false,
    });

    await getAuth().setCustomUserClaims(userRecord.uid, {
      ...userRecord.customClaims,
      role,
      tenant,
      department,
    });

    await saveUserToDb(db, {
      uid: userRecord.uid,
      email,
      role,
      tenant,
      department,
    });

    return {
      id: userRecord.uid,
      data: {
        email,
        role,
        tenant,
        department,
        uid: userRecord.uid,
      },
    };
  } catch (error: any) {
    logger.error("Error saving user or assigning claims:", error);
    return new HttpsError("internal", "Save user fails, please try again");
  }
}

/**
 * Save user to firestore database
 *
 * @param {FirebaseFirestore.Firestore} db - The Firestore database instance.
 * @param {any} user - The user to be saved to firestore
 * @return {Promise<any>} An object containing an array of projects data
 * and the last document for pagination.
 * @throws {HttpsError} Throws an error if there's an issue retrieving projects.
 */
async function saveUserToDb(
  db: FirebaseFirestore.Firestore,
  user: {
        uid: string;
        email: any;
        role: any;
        tenant: any;
        department: any;
    }
): Promise<any> {
  try {
    await db.collection("users").doc(user.uid).set(user);
    logger.info("User data saved successfully:", user);
  } catch (error) {
    logger.error("Error saving user data:", error);
    return new HttpsError("internal", "Error saving user data");
  }
}


/**
 * Remove user to firebase auth
 *
 * @param {FirebaseFirestore.Firestore} db - The Firestore database instance.
 * @param {CallableRequest<any>} request - The request object containing data.
 * @return {Promise<any>} An object containing an array of projects data
 * and the last document for pagination.
 * @throws {HttpsError} Throws an error if there's an issue retrieving projects.
 */
export async function removeUserData(
  db: FirebaseFirestore.Firestore,
  request: CallableRequest<any>
): Promise<any> {
  const {token, uid, id} = request.data as any;

  await validateToken(token);

  try {
    await db.collection("users").doc(id).delete();
    const response = await getAuth().deleteUser(uid);
    return response;
  } catch (error: any) {
    logger.error("Error removing selected user:", error);
    return new HttpsError("internal", "User deletion fails, please try again");
  }
}
