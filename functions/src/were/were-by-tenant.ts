import {DecodedIdToken} from "firebase-admin/auth";
import {Filter} from "../types/types";

const getWereByTenant = async (
  auth: DecodedIdToken,
  whereClause: Filter[],
  tenant?: string,
): Promise<Filter[]> => {
  whereClause.push({
    field: "tenant",
    operator: "==",
    value: tenant ?? auth.tenant,
  });

  if (auth.department !== "all") {
    whereClause.push({
      field: "department",
      operator: "==",
      value: auth.department,
    });
  }

  return whereClause;
};

export default getWereByTenant;
