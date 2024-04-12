import {Filter} from "../types/types";

const getWhereByRequestId = async (
  requestdb: number | string,
  whereClause: Filter[]
): Promise<Filter[]> => {
  whereClause.push({
    field: "requestNumber",
    operator: "==",
    value: requestdb,
  });

  return whereClause;
};

export default getWhereByRequestId;
