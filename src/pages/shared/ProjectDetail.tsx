import { Container, Flex, Box, Breadcrumb, BreadcrumbItem, Spacer, Text, Heading, useToast, Button, CircularProgress, Wrap } from '@chakra-ui/react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import Status from '../../components/Status';
import { db } from '../../utils/init-firebase';
import { storage } from '../../utils/init-firebase';
import { ref, getDownloadURL, getBlob } from 'firebase/storage';
import fileDownload from 'js-file-download'
import ProjectTable from '../../components/tables/ProjectDetailTable';
import DocumentTable from '../../components/tables/DocumentTable';
import { GrArchive, GrDocumentZip } from 'react-icons/gr';
import { ProjectObject } from '../../models/project';
import { Document, DocumentObject, ProcessedDocument } from '../../models/document';
import { saveCertificate, saveMemory, saveTargetDocuments, saveDocumentServices, getDocuments } from '../../data/Documents';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import './AddProject.css';
import InputFileBtn from '../../components/InputFileBtn';
import { getProjectById } from '../../data/Projects';
import Urgent from '../../assets/isUrgent.svg?react';
import JSZip from 'jszip';
import { ROLES } from '../../models/users';
import { useStore } from '../../hooks/useGlobalStore';
import ChangeStatusSelector from '../../components/ChangeStatus';
import { useDocResult } from '../../hooks/useDocResult';

export const DocumentType = {
    Certificate: 'Certificate',
    Memory: 'Memory',
    Glossary: 'Glossary',
    Bittext: 'Bittext',
    StyleSheet: 'StyleSheet'
} as const;

type DocumentType = 'Certificate' | 'Memory' | 'Glossary' | 'Bittext' | 'StyleSheet'
type DocumentsWithType = {
    type: DocumentType,
    doc: DocumentObject
}

const ProjectDetail: React.FC = () => {
    const { projectId } = useParams();
    const { currentUser, tenant } = useStore();
    const toast = useToast()


    const [saving, setSaving] = useStateWithCallbackLazy<boolean>(false);
    const [project, setProject] = React.useState<ProjectObject>();
    const [documents, setDocuments] = React.useState<DocumentObject[]>([]);
    const [processedDocuments, setProcessedDocuments] = React.useState<ProcessedDocument[]>([])
    const [docs, setDocs] = React.useState<DocumentsWithType[]>([]);

    const { getDocTypeInfo } = useDocResult();
    useEffect(() => {
        if (documents.length) {

            const docArray: DocumentsWithType[] = documents.map((doc) => {
                const info = getDocTypeInfo(doc.data);
                if (!info) return null;
                return {
                    type: info.typeLabel,
                    doc: doc,
                } as DocumentsWithType;
            }).filter((item) => item !== null);

            setDocs(docArray);
            updateProcessedDocuments();
        }
    }, [documents])

    const updateProcessedDocuments = () => {
        if (projectId) {
            getDocuments(projectId, documents).then(proccesedDocs => {
                if (proccesedDocs) setProcessedDocuments(proccesedDocs)
            });
        }
    }

    const setDocumetsState = (type: DocumentType, doc: DocumentObject) => {
        const itemDoc = docs.find((doc) => doc.type === type);
        if (!itemDoc) {
            setDocs([
                ...docs,
                { type, doc }
            ])
        }
    }
    useEffect(() => {
        if (currentUser && projectId) {
            getProjectById(projectId).then(response => {
                setProject(response);
            });

        }
    }, [currentUser])

    useEffect(() => {
        // Get documents sub-collection from firebase by project id
        const projectRef = doc(collection(db, 'projects'), projectId);
        const q = collection(projectRef, 'documents');
        const querySnapshot = getDocs(q);
        querySnapshot.then(documents => {
            setDocuments(documents.docs.map(doc => ({
                id: doc.id,
                data: doc.data() as Document
            })))
        })

    }, [project])

    // Download file from firestore
    const downloadFile = async (filePath: string, fileName: string) => {
        const pathReference = ref(storage, filePath);
        const url = await getDownloadURL(pathReference);

        // This can be downloaded directly:
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = () => {
            const blob = xhr.response;
            fileDownload(blob, fileName)
        };
        xhr.open('GET', url);
        xhr.send();
    }

    const downloadZippedFiles = async () => {
        const jszip = new JSZip();

        for (const docObj of processedDocuments) {
            for (const file of docObj.documents)
                if (file.data.path) {
                    const docRef = await ref(storage, file.data.path);
                    jszip.file(docRef.name, getBlob(docRef));
                }
        }

        const certificate = documents.find(doc => doc.data.isCertificate);
        if (certificate) {
            const docRef = await ref(storage, certificate.data.path);
            jszip.file(docRef.name, getBlob(docRef));
        }

        jszip.generateAsync({ type: "blob" }).then((content: any) => {
            fileDownload(content, `${project?.data.projectId}.zip`);
        });

    }

    const downloadSourceZippedFiles = async () => {
        const jszip = new JSZip();
        for (const file of documents) {
            const docRef = await ref(storage, file.data.path);
            jszip.file(docRef.name, getBlob(docRef));
        }

        jszip.generateAsync({ type: "blob" }).then((content: any) => {
            fileDownload(content, `${project?.data.projectId}.zip`);
        });

    }

    const uploadFile = async (
        files: FileList,
        document: DocumentObject | null = null,
        target: string | null = null) => {

        // Get month name of current date
        if (project && (currentUser?.role === ROLES.Admin || currentUser.role === ROLES.Translator) && document && target) {
            setSaving(true, () => console.log("Saving"))
            const newDocument = await saveTargetDocuments(files, document, project, target)
            if (newDocument.length) {
                const newdocuments = processedDocuments.slice();
                const docItem = newdocuments.find(doc => doc.docId === document.id);
                if (docItem) {
                    docItem.documents = [...newDocument, ...docItem.documents];
                } else {
                    newdocuments.push({
                        docId: document.id,
                        documents: newDocument
                    });
                }
                setProcessedDocuments(newdocuments);
                toast({
                    description: `Documents saved successfully`,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                })
            }
            setSaving(false, () => console.log("saving"));
        } else {
            setSaving(true, () => console.log("saving"))
            if (projectId && project) {
                setSaving(true, () => console.log("saving"))
                const projectRef = doc(collection(db, 'projects'), projectId);
                const newCert = await saveCertificate(files[0], project, projectRef)
                setSaving(false, () => console.log("saving"));
                toast({
                    description: `Certificate uploaded successfully`,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                })
                const [newFile] = newCert
                getDoc(newFile).then(dc => {
                    const newDocuments = [{
                        id: dc.id,
                        data: dc.data() as Document
                    }, ...documents]
                    setDocuments(newDocuments)
                })
            }
        }
    }

    const uploadMemory = async (
        files: FileList) => {

        setSaving(true, () => console.log("saving"))
        if (projectId && project) {
            setSaving(true, () => console.log("saving"))
            const projectRef = doc(collection(db, 'projects'), projectId);
            const newCert = await saveMemory(files[0], project, projectRef)
            setSaving(false, () => console.log("saving"));
            toast({
                description: `Memory uploaded successfully`,
                status: 'success',
                duration: 9000,
                isClosable: true,
            })
            const [newFile] = newCert
            getDoc(newFile).then(dc => {
                const newDocuments = [{
                    id: dc.id,
                    data: dc.data() as Document
                }, ...documents]
                setDocuments(newDocuments)
            })
        }
    }

    const uploadTypeService = async (
        files: FileList, type: 'Certificate' | 'Memory' | 'Glossary' | 'Bittext' | 'StyleSheet') => {


        setSaving(true, () => console.log("saving"))
        if (projectId && project) {
            setSaving(true, () => console.log("saving"))
            const projectRef = doc(collection(db, 'projects'), projectId);
            const newCert = await saveDocumentServices(files[0], project, projectRef, type)
            setSaving(false, () => console.log("saving"));
            toast({
                description: `${type} uploaded successfully`,
                status: 'success',
                duration: 9000,
                isClosable: true,
            })
            const [newFile] = newCert

            getDoc(newFile).then(dc => {
                const newDocument = {
                    id: dc.id,
                    data: dc.data() as Document
                }
                const newDocuments = [newDocument, ...documents]
                setDocumetsState(type, newDocument)
                setDocuments(newDocuments)
            })

        }
    }

    console.log(project?.data);

    return (
        <>
            {currentUser && (
                <Container maxW="full" w={'container.lg'} mt={0} overflow="hidden">
                    <Flex mb='10'>
                        <Box>
                            <Breadcrumb separator='/'>
                                <BreadcrumbItem>
                                    <Text>Home</Text>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <NavLink to={`/${currentUser.role}`}>Dashboard</NavLink>
                                </BreadcrumbItem>
                            </Breadcrumb>
                        </Box>

                    </Flex>
                    <Box borderRadius={4} border={'1px'} borderColor={'gray.100'} p={3} pb={3} >
                        {project?.data && <>
                            <Flex justifyContent={'space-between'} alignItems={'center'}>
                                <Flex alignItems={'center'}>
                                    <Heading size='md' pl={4} color='blue.400'>{project.data.projectId} </Heading>
                                    {project?.data?.isUrgent ?
                                        <Flex alignItems={'center'} fontWeight={'bold'}>
                                            <Urgent className="isUrgent mb-10" /> Urgent!
                                        </Flex> : null}
                                </Flex>

                                {(currentUser.role === ROLES.Admin || currentUser.role === ROLES.Translator) && (
                                    <ChangeStatusSelector
                                        setProject={setProject}
                                        project={project} role={currentUser.role}
                                        tenant={tenant} />
                                )}
                                {project.data.status && currentUser?.role === ROLES.Client && <Status status={project.data.status} />}
                            </Flex>
                            <ProjectTable project={project}></ProjectTable>

                        </>
                        }
                        <Spacer h={'40px'} />
                        <Flex justifyContent={'space-between'} alignItems={'center'}>
                            <Heading size='md' pl={4} color='blue.400'>Documents</Heading>
                            <Wrap spacing={3} justify={'flex-end'} mb={2} mr={3}>
                                {currentUser?.role === ROLES.Admin || currentUser?.role === ROLES.Translator ? <>
                                    {(project?.data.isMemory && !docs.find((doc) => doc.type === DocumentType.Memory)) &&
                                        <InputFileBtn
                                            uploadFile={(uploadMemory)}
                                            text={"Upload Memory"}
                                            scheme='yellow'
                                            icon={GrArchive} />}

                                    {(project?.data.isCertificate && !docs.find((doc) => doc.type === DocumentType.Certificate)) &&
                                        <InputFileBtn
                                            uploadFile={uploadFile}
                                            text={"Add Certificate"}
                                            scheme='green'
                                            icon={GrArchive} />}

                                    {(project?.data.isBittext && !docs.find((doc) => doc.type === DocumentType.Bittext)) &&
                                        <InputFileBtn
                                            uploadFile={(files) => uploadTypeService(files, DocumentType.Bittext)}
                                            text={"Add Bittext"}
                                            scheme='purple'
                                            icon={GrArchive} />}

                                    {(project?.data.isGlossary && !docs.find((doc) => doc.type === DocumentType.Glossary)) &&
                                        <InputFileBtn
                                            uploadFile={(files) => uploadTypeService(files, DocumentType.Glossary)}
                                            text={"Add Glossary"}
                                            scheme='orange'
                                            icon={GrArchive} />}

                                    {(project?.data.isStyleSheet && !docs.find((doc) => doc.type === DocumentType.StyleSheet)) &&
                                        <InputFileBtn
                                            uploadFile={(files) => uploadTypeService(files, DocumentType.StyleSheet)}
                                            text={"Add StyleSheet"}
                                            scheme='cyan'
                                            icon={GrArchive} />}
                                </> : null
                                }

                                {currentUser?.role === ROLES.Client && processedDocuments?.length >= 1 && <Button
                                    leftIcon={<GrDocumentZip className={'white-icon'} />}
                                    colorScheme='blue'
                                    onClick={() => downloadZippedFiles()}>
                                    <Flex alignItems={'center'}>
                                        <Text ml={2}>Download All Files</Text>
                                    </Flex>
                                </Button>}

                                {(currentUser.role === ROLES.Admin || currentUser.role === ROLES.Translator) && documents?.length >= 1 && <Button
                                    leftIcon={<GrDocumentZip className={'white-icon'} />}
                                    colorScheme='blue'
                                    onClick={() => downloadSourceZippedFiles()}>
                                    <Flex alignItems={'center'}>
                                        <Text ml={2}>Download All Files</Text>
                                    </Flex>
                                </Button>}


                                {project?.data?.status === 'Completed' &&
                                    <ChangeStatusSelector setProject={setProject} project={project} button={true} role={currentUser.role} />
                                }
                            </Wrap>
                        </Flex>
                        <Box className={saving ? 'blured' : ''} position={'relative'} >
                            <DocumentTable
                                documents={documents}
                                setDocuments={setDocuments}
                                setProcessedDocuments={setProcessedDocuments}
                                processedDocuments={processedDocuments}
                                projectId={project?.id}
                                downloadFile={downloadFile}
                                uploadFile={uploadFile}
                                saving={saving}
                                setSaving={setSaving}
                            ></DocumentTable>
                            <Flex style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                pointerEvents: 'none'
                            }}
                                justifyContent={'center'}
                            >
                                {saving &&
                                    <Flex alignItems={'center'} justifyContent={'center'} direction={'column'}><CircularProgress isIndeterminate mb={2} /> Saving Project Details...</Flex>
                                }
                            </Flex>
                        </Box>

                    </Box>
                </Container >
            )}


        </>
    );
};

export default ProjectDetail;

