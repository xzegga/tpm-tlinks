import {billingStatuses, defaultStatuses, statuses} from "../types/statuses";
import {Filter} from "../types/types";

const getWereByStatus = async (
  status: string,
  whereClause: Filter[]
): Promise<Filter[]> => {
  switch (status) {
  case "All":
    whereClause.push({
      field: "status",
      operator: "in",
      value: statuses,
    });
    break;
  case "Active":
    whereClause.push({
      field: "status",
      operator: "in",
      value: defaultStatuses,
    });
    break;
  case "Billing":
    whereClause.push({
      field: "status",
      operator: "in",
      value: billingStatuses,
    });
    break;
  case "Quoted":
    whereClause.push({
      field: "billed",
      operator: ">",
      value: 0,
    });
    break;
  default:
    whereClause.push({
      field: "status",
      operator: "==",
      value: status,
    });
  }

  return whereClause;
};

export default getWereByStatus;
