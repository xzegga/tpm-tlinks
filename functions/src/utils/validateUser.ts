import {DecodedIdToken, getAuth} from "firebase-admin/auth";
import {HttpsError} from "firebase-functions/v2/https";
import {ROLES} from "../endpoints/tenants";

/**
 * Validate user token sent
 *
 * @param {string} token - A vali loggue us
 * @param {CallableRequest<any>} request - The request object containing data.
 */
export default async function validateToken(token: string) {
  const auth = getAuth();
  const validToken: DecodedIdToken = await auth.verifyIdToken(token);

  if (!validToken) {
    return new HttpsError("internal", "Error getting projects");
  }

  if (validToken.role !== ROLES.Admin) {
    return new HttpsError("internal", "Permissions denied");
  }

  return validToken;
}
