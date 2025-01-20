import { Timestamp } from 'firebase/firestore';

export type Tenant = {
    id?: string;
    name: string;
    slug: string;
    code: string;
    departments: string[];
    created?: Timestamp;
    image: string;
    export: boolean;
}