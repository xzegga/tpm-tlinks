import { User } from "../context/AuthContext";
import { Tenant } from "../models/clients";
import { ROLES } from "../models/users";

export const localStorageKeys = [];
export const sessionStorageKeys = [];

type Role = typeof ROLES[keyof typeof ROLES];

export type LoggedUser = {
  uid: string,
  tenant: string,
  role: Role,
  department: string,
  name: string,
  photoUrl: string,
  email: string,
  token: string,
} & User;

export const initialGlobalState = {
  title: 'Lets start',
  monthSelected: new Date().getMonth(),
  yearSelected: new Date().getFullYear(),
  status: 'Active',
  pagination: '20',
  loading: false,
  loadingMore: false,
  currentUser: {} as LoggedUser,
  tenant: {} as Tenant,
  tenants: [] as Tenant[],
  tenantQuery: '',
  selectedIds: [] as string[],
  refresh: false,
};
