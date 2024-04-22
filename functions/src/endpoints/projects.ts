import {logger} from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import getWereByDate from "../were/were-by-date";
import getWhereByRequestId from "../were/were-by-request-id";
import getWereByStatus from "../were/were-by-status";
import {Filter} from "../types/types";
import {DecodedIdToken, getAuth} from "firebase-admin/auth";
import getWereByTenant from "../were/were-by-tenant";

/**
 * Retrieves project data based on specified filters and pagination options.
 *
 * @param {FirebaseFirestore.Firestore} db - The Firestore database instance.
 * @param {CallableRequest<any>} request - The request object containing data.
 * @return {Promise<any>} An object containing an array of projects data
 * and the last document for pagination.
 * @throws {HttpsError} Throws an error if there's an issue retrieving projects.
 */
export default async function getProjectsData(
  db: FirebaseFirestore.Firestore,
  request: CallableRequest<any>
) {
  const {
    status,
    monthSelected,
    yearSelected,
    requestdb,
    pagination,
    lastDoc,
    newQuery,
    token,
    tenant,
  } = request.data as any;

  const auth = getAuth();
  const validToken: DecodedIdToken = await auth.verifyIdToken(token);

  if (!validToken) {
    return new HttpsError("internal", "Error getting projects");
  }

  if (validToken.role === "unauthorized") {
    return new HttpsError("internal", "Permissions denied");
  }

  const whereClause: Filter[] = [];

  if (requestdb !== "") {
    await getWhereByRequestId(requestdb, whereClause);
  } else {
    // Building where clause array
    await getWereByStatus(status, whereClause);
    await getWereByDate(monthSelected, yearSelected, whereClause);
  }

  if (validToken?.tenant && validToken?.role !== "admin") {
    await getWereByTenant(validToken, whereClause);
  } else {
    if (tenant && tenant !== "all") {
      await getWereByTenant(validToken, whereClause, tenant);
    }
  }

  try {
    const collectionRef = db.collection("projects");
    let query = collectionRef.orderBy("created", "desc");

    // Apply where clauses if any
    if (whereClause.length > 0) {
      whereClause.forEach((clause) => {
        query = query.where(clause.field, clause.operator, clause.value);
      });
    }

    const snapshot = await query.count().get();

    if (snapshot.data().count === 0) return [];

    const count = snapshot.data().count;
    const paging = pagination !== "All" ?
      parseInt(pagination) : snapshot.data().count;

    if (lastDoc && !newQuery) {
      const lastSnapShot = await collectionRef.doc(lastDoc).get();
      query = query.startAfter(lastSnapShot);
    }

    query = query.limit(paging);

    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      return {projects: [], lastDoc: null, count: 0};
    }

    const nextLastDoc =
      querySnapshot.docs[querySnapshot.docs.length - 1].id;

    const projectsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));

    return {projects: projectsData, lastDoc: nextLastDoc, count};
  } catch (error) {
    logger.error("Error trying to apply selected filters", error);
    throw new HttpsError("internal", "Error getting projects");
  }
}
