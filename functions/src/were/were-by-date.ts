import {lastDayOfMonth, endOfDay} from "date-fns";
import {Timestamp} from "firebase-admin/firestore";
import {Filter} from "../types/types";

const getWereByDate = async (
  monthSelected: number,
  yearSelected: number,
  whereClause: Filter[]
): Promise<Filter[]> => {
  const startOfMonth = monthSelected >= 0 ?
    new Date(yearSelected, monthSelected, 1) : new Date(yearSelected, 0, 1);

  const endOfMonth = monthSelected >= 0 && startOfMonth ?
    endOfDay(lastDayOfMonth(startOfMonth)) : new Date(yearSelected, 11, 31);

  whereClause.push({
    field: "created",
    operator: ">=",
    value: Timestamp.fromDate(startOfMonth),
  });

  whereClause.push({
    field: "created",
    operator: "<=",
    value: Timestamp.fromDate(endOfMonth),
  });

  return whereClause;
};

export default getWereByDate;
