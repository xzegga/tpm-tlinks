import { Timestamp } from 'firebase/firestore';
import { Document } from './document';

export interface Project {
    created?: Timestamp;
    projectId: string;
    isEditing: boolean;
    isTranslation: boolean;
    isCertificate: boolean;
    sourceLanguage: string;
    targetLanguage: string;
    timeLine: Timestamp;
    additionalInfo: string;
    status: string;
    requestNumber: number | string;
    documents: Document[];
    isUrgent: boolean;
    comments?: string;
    wordCount?: number;
    billed?: number;
    tenant?: string;
    department?: string;
}

export interface ProjectObject {
    id: string;
    data: Project;
}
