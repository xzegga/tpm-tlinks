import {logger} from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {DecodedIdToken, getAuth} from "firebase-admin/auth";

/**
 * Retrieves project data based on specified filters and pagination options.
 *
 * @param {CallableRequest<any>} request - The request object containing data.
 * @return {Promise<any>} An object containing an array of projects data
 * and the last document for pagination.
 * @throws {HttpsError} Throws an error if there's an issue retrieving projects.
 */
export default async function setRoles(request: CallableRequest<any>) {
  const {email, customClaims, token} = request.data;

  if (!email || !customClaims || !token) {
    return new HttpsError("invalid-argument", "Missing required fields");
  }

  const auth = getAuth();
  const validToken: DecodedIdToken = await auth.verifyIdToken(token);

  if (!validToken || validToken.role !== "admin") {
    return new HttpsError("internal", "Permissions denied");
  }

  try {
    const user = await auth.getUserByEmail(email);
    await getAuth().setCustomUserClaims(user.uid, {
      ...user.customClaims,
      ...customClaims,
    });

    return {message: "Claims assigned successfully"};
  } catch (error: any) {
    logger.error(`Error assigning claims to user ${email}:`, error);
    return new HttpsError(
      "internal", `Failed to assign claims: (${error.message})`
    );
  }
}
