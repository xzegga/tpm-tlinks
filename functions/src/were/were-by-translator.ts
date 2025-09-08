import { translatorStatuses } from '../types/statuses';
import { Filter } from '../types/types';

const getWereTranslatorId = async (
  uid: string,
  whereClause: Filter[],
): Promise<Filter[]> => {
  whereClause.push({
    field: 'translatorId',
    operator: '==',
    value: uid,
  });
  whereClause.push({
    field: 'status',
    operator: 'in',
    value: translatorStatuses,
  });
  return whereClause;
};

export default getWereTranslatorId;
