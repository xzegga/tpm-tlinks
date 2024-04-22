import {onCall} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import getProjectsData from "./endpoints/projects";
import setRoles from "./endpoints/roles";
import getTenantsData from "./endpoints/tenants";
import {removeUserData, saveUserData} from "./endpoints/users";
import {getAuth} from "firebase-admin/auth";

initializeApp();
const db = getFirestore();

export const assignUserClaims = onCall(async (request) => {
  await setRoles(request);
});

export const getProjects = onCall(async (request) => {
  const projectsData = await getProjectsData(db, request);
  return projectsData;
});

export const getTenants = onCall(async (request) => {
  const tenants = await getTenantsData(db, request);
  return tenants;
});

export const saveUser = onCall(async (request) => {
  const user = await saveUserData(db, request);
  return user;
});

export const removeUser = onCall(async (request) => {
  const user = await removeUserData(db, request);
  return user;
});

export const verifyToken = onCall(async (request) => {
  const {token} = request.data;
  try {
    await getAuth().verifyIdToken(token, true);
    return {valid: true};
  } catch {
    return {valid: false};
  }
});
