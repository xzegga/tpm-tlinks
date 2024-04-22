import {logger} from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import validateToken from "../utils/validateUser";

export const ROLES = {
  Admin: "admin",
  Client: "client",
  Unauthorized: "unauthorized",
} as const;

/**
 * Retrieves tenants data based on specified filters and pagination options.
 *
 * @param {FirebaseFirestore.Firestore} db - The Firestore database instance.
 * @param {CallableRequest<any>} request - The request object containing data.
 * @return {Promise<any>} An object containing an array of projects data
 * and the last document for pagination.
 * @throws {HttpsError} Throws an error if there's an issue retrieving projects.
 */
export default async function getTenantsData(
  db: FirebaseFirestore.Firestore,
  request: CallableRequest<any>
) {
  const {token} = request.data as any;
  await validateToken(token);

  try {
    const tenantRef = db.collection("tenants");
    const snapshot = await tenantRef.get();

    const tenants = snapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));

    return tenants;
  } catch (error) {
    logger.error("Error retrieving tenants from database", error);
    throw new HttpsError("internal", "Error retrieving tenants");
  }
}
