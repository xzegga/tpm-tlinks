import { Timestamp } from 'firebase/firestore';

export type Tenant = {
    id?: string;
    name: string;
    slug: string;
    departments: string[];
    created?: Timestamp;
    image: string;
}