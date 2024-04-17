import {onCall} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import getProjectsData from "./endpoints/projects";
import setRoles from "./endpoints/roles";

initializeApp();
const db = getFirestore();

export const assignUserClaims = onCall(async (request) => {
  await setRoles(request);
});

export const getProjects = onCall(async (request) => {
  const projectsData = await getProjectsData(db, request);
  return projectsData;
});
