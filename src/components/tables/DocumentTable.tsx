import { Flex, Box, Text, Link, Divider, AlertDialog, useToast, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { defaultStyles, FileIcon } from 'react-file-icon';
import Flag from '../Flag';
import InputFile from '../InputFile';
import { shortenFileName } from '../../utils/helpers';
import { DocumentObject, ProcessedDocument } from '../../models/document';
import { AiOutlineDownload, AiOutlineSafetyCertificate } from 'react-icons/ai';
import { DeleteIcon } from '@chakra-ui/icons';
import { deleteDocument } from '../../data/Documents';
import { ROLES } from '../../models/users';
import { useStore } from '../../hooks/useGlobalStore';

interface DocumentsTableProps {
    documents: DocumentObject[];
    setDocuments: React.Dispatch<React.SetStateAction<DocumentObject[]>>;
    setProcessedDocuments: React.Dispatch<React.SetStateAction<ProcessedDocument[]>>
    processedDocuments: processedDocument[];
    projectId?: string;
    saving: boolean;
    downloadFile: (path: string, name: string) => void;
    uploadFile?: (file: FileList, doc: DocumentObject, target: string) => Promise<void>;
    setSaving: any;
}

interface processedDocument {
    docId: string;
    documents: DocumentObject[];
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({
    documents,
    setDocuments,
    processedDocuments,
    setProcessedDocuments,
    projectId,
    setSaving,
    downloadFile,
    uploadFile }) => {

    const { currentUser } = useStore();

    const [isDeleting, setIsDeleting] = React.useState(false)
    const [documentToDelete, setDocumentToDelete] = React.useState<any>(null)
    const onClose = () => setIsDeleting(false)
    const cancelRef = React.useRef(null)
    const toast = useToast()
    const certificate = documents.find(doc => doc.data.isCertificate)

    // get file extension 
    const getFileExtension = (fileName: string) => {
        return fileName.split('.').pop() || '';
    }

    // Get defaultStyles color for file extension
    const getFileIconColor = (fileName: string) => {
        const ext = getFileExtension(fileName) as keyof typeof defaultStyles;
        return defaultStyles[ext];
    }

    // // Get file name from absolute path
    // const getFileName = (filePath: string) => {
    //     return filePath.split('/').pop() || '';
    // }

    const getDocumentById = (docId: string, target: string) => {
        const document = processedDocuments.find(doc => doc.docId === docId);
        let docsByTarget: DocumentObject[] = []
        if (document) {
            const [filterDocuments] = processedDocuments
                .filter((doc) => doc.docId === docId)
                .map((doc) => doc.documents);

            docsByTarget = filterDocuments.filter((doc) => doc.data.language === target);
        }
        return (
            docsByTarget.map((doc) =>
                <Box pb={2} key={doc.id}>
                    {doc.data.name &&
                        <Flex mr={1} justifyContent={'space-between'}>
                            <Flex>
                                <Box width={4}><FileIcon extension={getFileExtension(doc.data.name)} {...getFileIconColor(doc.data.name)} /></Box>
                                <Text fontSize="14px" ml={2}>
                                    <Tooltip label={doc.data.name} aria-label='A tooltip'>
                                        {shortenFileName(doc.data.name, 20)}
                                    </Tooltip>
                                </Text>
                            </Flex>
                            <Flex alignItems={'center'} justifyContent={'flex-end'}>
                                <Link color='blue.400' onClick={() => downloadFile(doc.data.path, doc.data.name)}>
                                    <Flex justifyContent={'end'} alignItems={'center'}>
                                        <AiOutlineDownload />
                                        <Text ml={2}>Download</Text>
                                    </Flex>
                                </Link>
                                {currentUser?.role === ROLES.Admin &&
                                    <>
                                        <Divider ml={3} orientation={'vertical'} mr={3} />
                                        <DeleteIcon onClick={() => removeFile(docId, doc)} cursor={'pointer'} color={'red.400'} />
                                    </>}
                            </Flex>
                        </Flex>}
                </Box>
            )
        );
    }

    const removeFile = async (documentId: string, doc: DocumentObject) => {
        setDocumentToDelete({
            projectId,
            documentId,
            doc,
        })
        setIsDeleting(true);
    }


    const handleDeleteDocument = async () => {
        const { projectId, documentId, doc } = documentToDelete;
        if (projectId) {
            setSaving(true, null);
            await deleteDocument(projectId, documentId, doc)



            if (doc.data.isCertificate) {
                const newDocuments = documents.filter((doc) => doc.id !== documentId);
                setDocuments(newDocuments);
            } else {
                const index = processedDocuments.findIndex((dc) => dc.docId === documentId);
                if (index !== null) {
                    const updatedDocs = processedDocuments.slice();
                    updatedDocs[index].documents = [...updatedDocs[index].documents.filter((dc) => dc.id !== doc.id)];
                    setProcessedDocuments(updatedDocs);
                }

            }
            setSaving(false, null)
            setIsDeleting(false);
            toast({
                description: `File deleted successfully`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    return (
        <Box p={3} fontSize={'14px'}>

            <Box pb={2} mb={3} pl={1} borderBottom={'1px'} borderColor={'gray.300'} color={'gray.500'}>File List</Box>
            {certificate && <Box>
                <Flex justifyContent={'space-between'}
                    alignItems={'center'} mb={2} mt={2} pb={3}
                    style={{ borderBottom: '1px solid #cdcdcd' }} >
                    <Flex pl={2}>
                        <Flex alignItems={'center'}>
                            <Box width={7} mr={3} color={'green'}>
                                <AiOutlineSafetyCertificate fontSize={28} color={'green'} />
                            </Box>
                            <Text fontWeight={'bold'} fontSize={16} mr={2}>Certificate: </Text>
                            <Text>{certificate.data.name}</Text>
                        </Flex>
                    </Flex>
                    <Flex pr={5} alignItems={'center'}>

                        <Link color='blue.400' onClick={() => downloadFile(certificate.data.path, certificate.data.name)}>
                            <Flex justifyContent={'end'} alignItems={'center'}>
                                <AiOutlineDownload />
                                <Text ml={2}>Download</Text>
                            </Flex>
                        </Link>

                        {currentUser?.role === ROLES.Admin &&
                            <>
                                <Divider orientation={'vertical'} mx={3} h={'15px'} w={'1px'} />
                                <DeleteIcon onClick={() => removeFile(certificate.id, certificate)} cursor={'pointer'} color={'red.400'} />
                            </>}
                    </Flex>
                </Flex>
            </Box>}
            {documents.map((doc) =>
                <Box key={doc.id}>
                    {!doc.data.isCertificate &&
                        <Box key={doc.id} mb={10}>
                            <Flex justifyContent={'space-between'} alignItems={'center'} mb={2} mt={5}>
                                <Box pl={2}>
                                    <Flex alignItems={'center'}>
                                        <Box width={7} mr={3}>
                                            {doc.data.name && <FileIcon extension={getFileExtension(doc.data.name)} {...getFileIconColor(doc.data.name)} />}
                                        </Box>
                                        <Text>{doc.data.name}</Text>
                                    </Flex>
                                </Box>
                                <Box>
                                    {currentUser && currentUser.role === ROLES.Admin &&
                                        <Link color='blue.400' onClick={() => downloadFile(doc.data.path, doc.data.name)}>
                                            <Flex justifyContent={'end'} alignItems={'center'}>
                                                <AiOutlineDownload />
                                                <Text ml={2}>Download Source</Text>
                                            </Flex>
                                        </Link>}
                                </Box>
                            </Flex>
                            {
                                doc.data.target?.length &&
                                <Box p={0} borderBottom={'none'}>
                                    <Box w={'100%'} backgroundColor={'gray.100'} p={2} pl={3} mb={3}>
                                        {doc.data.target.map((target, i) => (
                                            <Box key={i}>
                                                <Flex w={'100%'} justifyContent={'space-between'}>
                                                    <Flex flex={1} m={0} p={2} pt={4} pr={4} justifyContent={'space-between'} alignItems={'flex-start'}>
                                                        <Flex alignItems={'center'}>
                                                            <Flag name={target} mr={2} /> {target}
                                                        </Flex>
                                                        {currentUser?.role === ROLES.Admin &&
                                                            <InputFile doc={doc} uploadFile={uploadFile} target={target} />
                                                        }
                                                    </Flex>
                                                    <Box flex={2} borderLeft={'1px'} borderColor={'gray.200'} m={0} p={3} pl={5} pb={0}>
                                                        {
                                                            getDocumentById(doc.id, target)
                                                        }
                                                    </Box>
                                                </Flex>
                                                {doc.data.target?.length - 1 !== i && <Divider />}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            }

                        </Box>
                    }
                </Box>
            )}
            <AlertDialog
                isOpen={isDeleting}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Delete Document
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={handleDeleteDocument} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box >
    );
};

export default DocumentsTable;

