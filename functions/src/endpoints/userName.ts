import {logger} from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import validateToken from "../utils/validateUser";

/**
 * Retrieves names of users based on the provided array of projectId and uid.
 *
 * @param {FirebaseFirestore.Firestore} db - The Firestore database instance.
 * @param {CallableRequest<any>} request - The request object containing data.
 * @return {Promise<any>} An array of objects with projectId, uid, and name.
 * @throws {HttpsError} Throws an error for invalid input or Firestore issues.
 */
export const getUsersNamesByUids = async (
  db: FirebaseFirestore.Firestore,
  request: CallableRequest<any>
): Promise<any> => {
  const {users, token} = request.data;

  // Validate the token to ensure it is authorized
  await validateToken(token);

  // Ensure `users` is a non-empty array
  if (!Array.isArray(users) || users.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "Invalid request: `users` must be a non-empty array."
    );
  }

  try {
    const usersRef = db.collection("users");

    // Map through `users` to fetch Firestore data for each uid
    const userPromises = users.map(async ({projectId, uid}) => {
      // Ensure both projectId and uid are present
      if (!uid || !projectId) {
        throw new HttpsError(
          "invalid-argument",
          "`projectId` and `uid` are required in each object."
        );
      }

      // Query Firestore for a document where `uid` matches
      const userQuery = await usersRef.where("uid", "==", uid).limit(1).get();

      // Return null for name if no matching document is found
      if (userQuery.empty) {
        return {projectId, uid, name: null};
      }

      // Extract `name` from the matching document
      const userData = userQuery.docs[0].data();
      return {projectId, uid, name: userData?.name || null};
    });

    // Wait for all Firestore queries to resolve
    const userResults = await Promise.all(userPromises);

    // Return the results in the required format
    return {users: userResults};
  } catch (error) {
    // Log the error and throw an HttpsError for the client
    logger.error("Error retrieving user names", error);
    throw new HttpsError("internal", "Error retrieving user names");
  }
};
