import { logger } from 'firebase-functions/v2';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import validateToken from '../utils/validateUser';

/**
 * Retrieves users data based on specified filters and conditions.
 *
 * @param {FirebaseFirestore.Firestore} db - The Firestore database instance.
 * @param {CallableRequest<any>} request - The request object containing data.
 * @return {Promise<any>} An object containing an array of users data
 * based on the specified criteria or an empty array if no users are found.
 * @throws {HttpsError} Throws an error if there's an issue retrieving users.
 */
export const getUsersByCriteria = async (
  db: FirebaseFirestore.Firestore,
  request: CallableRequest<any>,
): Promise<any> => {
  const { tenant, department, role, token } = request.data;

  await validateToken(token);

  if (!tenant || !role) {
    throw new HttpsError(
      'invalid-argument',
      'Missing required parameters: tenant and role are required.',
    );
  }

  try {
    const usersRef = db.collection('users');

    let query = usersRef
      .where('tenant', '==', tenant)
      .where('role', '==', role);

    // Add department conditionally
    if (department && department.toLowerCase() !== 'all') {
      query = query.where('department', '==', department);
    }

    const snapshot = await query.get();

    // If no users are found, return an empty array
    if (snapshot.empty) {
      return { users: [] };
    }

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return users;
  } catch (error) {
    logger.error('Error retrieving users from the database', error);
    throw new HttpsError('internal', 'Error retrieving users');
  }
};
