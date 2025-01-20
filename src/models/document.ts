import { Timestamp } from "firebase/firestore";

export interface Document {
    created: Timestamp;
    name: string;
    path: string;
    target: string[];
    type: string;
    language?: string;
    isCertificate?: boolean;
}

export interface DocumentObject {
    id: string;
    data: Document;
}

export interface Doc {
    file: File;
    target: string[]
}

export interface ProcessedDocument {
    docId: string;
    documents: DocumentObject[];
}