import { isValid, addDays } from 'date-fns';
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { Doc } from '../models/document';
import { Project } from '../models/project';
import { twoDigitDate } from '../utils/helpers';
import { db, storage } from '../utils/init-firebase';
import { saveDocuments } from './Documents';

export const getProjectById = async (projectId: string) => {
    const docRef = doc(collection(db, 'projects'), projectId);
    const docSnap = await getDoc(docRef);
    return {
        id: docSnap.id,
        data: docSnap.data() as Project
    };
};

export const saveProject = async (project: Project, files: Doc[]) => {
    try {
        const projectCode = await getCorrelativeID(project.created);
        const projectDoc = collection(db, 'projects');
        const counterProj = doc(db, 'counters', 'projects');
        const counter = await getCounter('projects');

        const timeLine = isValid(project.timeLine.toDate()) ? project.timeLine : Timestamp.fromDate(addDays(new Date(), 5));
        const created = project.created ? project.created : Timestamp.now();

        const projectRef = await addDoc(projectDoc, {
            created: created,
            projectId: projectCode,
            isEditing: project.isEditing,
            isTranslation: project.isTranslation,
            isCertificate: project.isCertificate,
            sourceLanguage: project.sourceLanguage,
            targetLanguage: project.targetLanguage,
            timeLine,
            additionalInfo: project.additionalInfo,
            status: project.status,
            requestNumber: project.requestNumber,
            isUrgent: project.isUrgent
        });

        await setDoc(counterProj, { value: (counter?.value | 0) + 1 });

        // Save documents and document references
        saveDocuments(files, projectCode, projectRef);
    } catch (error) {
        console.log(error);
    }
};

export const getCorrelativeID = async (created?: Timestamp) => {
    const createdDate = created?.toDate() || new Date();
    const today = Timestamp.fromDate(new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate()));
    const q = query(collection(db, 'projects'), where('created', '>=', today));

    const querySnapshot = await getDocs(q);

    // Build project id base on current date and correlative
    const date = created?.toDate() || new Date();
    const month = twoDigitDate(date.getMonth() + 1);
    const day = twoDigitDate(date.getDate());
    const year = date.getFullYear().toString().slice(-2);

    const count = querySnapshot.docs.length;
    // Get alphabete letter by index

    const letter = count > 0 ? `-${String.fromCharCode(65 + count)}` : '';
    const projectId = `TCH-${month}${day}${year}${letter}`;
    return projectId;
};

export const getCounter = async (key: string) => {
    const q = doc(collection(db, 'counters'), key);
    const docSnap = (await getDoc(q)).data();
    // Get async data from docSnap
    return docSnap;
};

export const deleteProject = async (id: string) => {
    if (!id) return;

    const projectRef = doc(collection(db, 'projects'), id);
    const queryDocs = collection(projectRef, 'documents');

    const batch = writeBatch(db);
    const documentToDelete: string[] = [];

    const docSnap = await getDocs(queryDocs);
    for (const docRec of docSnap.docs) {
        documentToDelete.push(docRec.data().path);

        const targetDocs = collection(docRec.ref, 'documents');
        const docs = await getDocs(targetDocs);

        docs.docs.forEach(async (docTRec) => {
            console.log(docTRec.id);
            documentToDelete.push(docTRec.data().path);
            batch.delete(docTRec.ref);
        });

        batch.delete(docRec.ref);
    }

    for (const document of documentToDelete) {
        const itemRef = ref(storage, document);
        await deleteObject(itemRef);
    }

    batch.delete(projectRef);
    await batch.commit();

    const counterProj = doc(db, 'counters', 'projects');
    const counter = await getCounter('projects');
    await setDoc(counterProj, { value: counter?.value - 1 });
};

export const updateComments = async (projectId: string, newComments: string) => {
    try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { comments: newComments });
    } catch (error) {
        console.error('Error updating comments:', error);
    }
};

export const updateAmount = async (projectId: string, billed: number) => {
    try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { billed });
    } catch (error) {
        console.error('Error updating amount billed:', error);
    }
};

export const updateWordCount = async (projectId: string, wordCount: number) => {
    try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { wordCount });
    } catch (error) {
        console.error('Error updating amount billed:', error);
    }
};
