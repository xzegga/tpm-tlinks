import { Timestamp } from "firebase/firestore";

export interface Document {
    created: Timestamp;
    name: string;
    path: string;
    target: string[];
    type: string;
    language?: string;
    isCertificate?: boolean;
    isBittext?: boolean;
    isGlossary?: boolean;
    isStyleSheet?: boolean;
    isMemory?: boolean;
}

export interface DocumentObject {
    id: string;
    data: Document;
}

export type ResultDoc = {
    id: string,
    name: string;
    data: Document;
    typeLabel: string;
    icon: JSX.Element;
};

export interface Doc {
    file: File;
    target: string[]
}

export interface ProcessedDocument {
    docId: string;
    documents: DocumentObject[];
}