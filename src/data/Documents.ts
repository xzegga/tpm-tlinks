import { DocumentReference, DocumentData, addDoc, collection, Timestamp, doc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';
import { deleteObject, listAll, ref, uploadBytesResumable } from 'firebase/storage';
import { Doc, DocumentObject, ProcessedDocument, Document } from '../models/document';
import { Project, ProjectObject } from '../models/project';
import { createFileName } from '../utils/helpers';
import { db, storage } from '../utils/init-firebase';

export const saveDocuments = (documents: Doc[], project: Project, projectRef: DocumentReference<DocumentData>, code: string) => {

    const promises: any[] = [];
    // Get month name of current date
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    const tenant = project.tenant;
    debugger;
    // eslint-disable-next-line array-callback-return
    documents.map(async (doc: Doc) => {
        const path = `/${tenant}/${year}/${month}/${code}/Source/${project.requestNumber}-${code}-${doc.file.name}`;

        const storageRef = ref(storage, path);

        const uploadTask = uploadBytesResumable(storageRef, doc.file);
        promises.push(uploadTask);
    });

    Promise.all(promises)
        .then((files) => {
            const documentRef = collection(projectRef, 'documents');

            files.forEach(async (file, index) => {
                await addDoc(documentRef, {
                    created: Timestamp.now(),
                    name: file.metadata.name,
                    path: file.metadata.fullPath,
                    target: documents[index].target
                });
            });

            return 'success';
        })
        .catch((error) => {
            console.error(error.message);
        });
};

export const saveCertificate = async (file: File, project: ProjectObject, projectRef: DocumentReference<DocumentData>) => {
    const promises: any[] = [];
    // Get month name of current date
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    const code = project.data.projectId;
    const tenant = project.data.tenant;

    const path = `/${tenant}/${year}/${month}/${code}/Certificate/${file.name}`;
    const storageRef = ref(storage, path);

    const uploadTask = uploadBytesResumable(storageRef, file);
    promises.push(uploadTask);

    const results = await Promise.all(promises);

    const filesUploaded: any = [];
    for (const file of results) {
        try {
            const documentRef = collection(projectRef, 'documents');
            filesUploaded.push(
                await addDoc(documentRef, {
                    created: Timestamp.now(),
                    name: file.metadata.name,
                    path: file.metadata.fullPath,
                    isCertificate: true
                })
            );
        } catch (error) {
            console.log(error);
        }
    }
    return filesUploaded;
};

export const saveMemory = async (file: File, project: ProjectObject, projectRef: DocumentReference<DocumentData>) => {
    const promises: any[] = [];
    // Get month name of current date
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    const code = project.data.projectId;
    const tenant = project.data.tenant;

    const path = `/${tenant}/${year}/${month}/${code}/Memory/${file.name}`;
    const storageRef = ref(storage, path);

    const uploadTask = uploadBytesResumable(storageRef, file);
    promises.push(uploadTask);

    const results = await Promise.all(promises);

    const filesUploaded: any = [];
    for (const file of results) {
        try {
            const documentRef = collection(projectRef, 'documents');
            filesUploaded.push(
                await addDoc(documentRef, {
                    created: Timestamp.now(),
                    name: file.metadata.name,
                    path: file.metadata.fullPath,
                    isMemory: true
                })
            );
        } catch (error) {
            console.log(error);
        }
    }
    return filesUploaded;
};

export const saveDocumentServices = async (
    file: File, project: ProjectObject, projectRef: DocumentReference<DocumentData>,
    type: 'Certificate' | 'Memory' | 'Glossary' | 'Bittext' | 'StyleSheet'
    ) => {
    const promises: any[] = [];
    // Get month name of current date
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    const code = project.data.projectId;
    const tenant = project.data.tenant;

    const path = `/${tenant}/${year}/${month}/${code}/${type}/${file.name}`;
    const storageRef = ref(storage, path);

    const uploadTask = uploadBytesResumable(storageRef, file);
    promises.push(uploadTask);

    const results = await Promise.all(promises);

    const filesUploaded: any = [];
    for (const file of results) {
        try {
            const documentRef = collection(projectRef, 'documents');
            filesUploaded.push(
                await addDoc(documentRef, {
                    created: Timestamp.now(),
                    name: file.metadata.name,
                    path: file.metadata.fullPath,
                    [`is${type}`]: true
                })
            );
        } catch (error) {
            console.log(error);
        }
    }
    return filesUploaded;
};

export const saveTargetDocuments = async (fileList: FileList, document: DocumentObject, project: ProjectObject, target: string) => {
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    const promises: any[] = [];
    // Get month name of current date

    const fileArr = Array.from(fileList);
    // eslint-disable-next-line array-callback-return
    fileArr.map((file: File) => {
        const fileName = createFileName(file.name);
        const path = `/${project.data.tenant}/${year}/${month}/${project.data.projectId}/Target/${fileName}`;
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);
        promises.push(uploadTask);
    });

    const projectRef = doc(collection(db, 'projects'), project.id);
    const documentRef = doc(collection(projectRef, 'documents'), document.id);
    const targetDocumentsRef = collection(documentRef, 'documents');

    const filesUploaded: DocumentObject[] = [];
    const files = await Promise.all(promises);
    for (const file of files) {
        try {
            const ref = await addDoc(targetDocumentsRef, {
                created: Timestamp.now(),
                name: file.metadata.name,
                path: file.metadata.fullPath,
                language: target
            });

            const docS = await getDoc(ref);
            filesUploaded.push({
                id: docS.id,
                data: docS.data() as Document
            });
        } catch (error) {
            console.log(error);
        }
    }

    return filesUploaded;
};

export const deleteDocument = async (projectId: string, documentId: string, document: DocumentObject) => {
    // Deleting phisical file
    const storageRef = ref(storage, document.data.path);
    await deleteObject(storageRef);

    // Deleting document reference
    const projectRef = doc(collection(db, 'projects'), projectId);
    const documentRef = doc(collection(projectRef, 'documents'), documentId);
    const targetDocumentsRef = doc(collection(documentRef, 'documents'), document.id);

    await deleteDoc(targetDocumentsRef);
    if (document.data.isCertificate || document.data.isMemory) {
        await deleteDoc(documentRef);
    }
};

export const getDocuments = async (projectId: string, documents: DocumentObject[]) => {
    if (projectId) {
        const projectRef = doc(collection(db, 'projects'), projectId);
        const processed: ProcessedDocument[] = [];

        for (const document of documents) {
            const documentRef = doc(collection(projectRef, 'documents'), document.id);
            const targetDocumentsRef = collection(documentRef, 'documents');

            const targetDocuments = await getDocs(targetDocumentsRef);
            const dataDocs = targetDocuments.docs.map((doc) => ({
                id: doc.id,
                data: doc.data() as Document
            }));

            if (dataDocs.length) {
                processed.push({
                    docId: document.id,
                    documents: dataDocs
                });
            }
        }
        return processed;
    }
};

export const deleteDocuments = async (path: string) => {
    if (path.length) {
        const storageRef = ref(storage, path);
        listAll(storageRef).then(async (list) => {
            list.items.map(async (item) => {
                const itemRef = ref(storage, item.fullPath);
                await deleteObject(itemRef);
            });
        });
    }
};
