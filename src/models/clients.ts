import { Timestamp } from 'firebase/firestore';

export const TRS_ENABLED = {
  Disabled: 'Disabled',
  Admin: 'Admin',
  Client: 'Client',
} as const;

export type Tenant = {
  id?: string;
  name: string;
  slug: string;
  code: string;
  departments: string[];
  created?: Timestamp;
  image: string;
  export: boolean;
  translators: keyof typeof TRS_ENABLED;
};
