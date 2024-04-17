import { CheckCircleIcon, DeleteIcon } from '@chakra-ui/icons';
import { List, ListItem, Flex, Box, ListIcon, Heading, Text, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Link, useDisclosure } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { shortenFileName } from '../utils/helpers';
import { languageCodes } from '../utils/languageCodes';
import { Select } from "chakra-react-select";
import './Styles.css';
import Flag from './Flag';
import { Doc } from '../models/document';

interface DropZoneProps {
    setFileList: React.Dispatch<React.SetStateAction<Doc[]>>;
    targetLanguage?: string;
}

const baseStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    outline: 'none',
    transition: 'border .24s ease-in-out',
    width: '100%',
};

const focusedStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

const DropZone: React.FC<DropZoneProps> = ({ setFileList, targetLanguage = 'Spanish' }) => {
    // const [files, setFiles] = useState<File[]>([]);
    const [selectedFiles, setSelectedFile] = useState<Doc[]>([]);
    const [index, setIndex] = useState<number>();
    const [target, setTarget] = useState<string[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject,
        open
    } = useDropzone({
        onDrop: acceptedFiles => {
            setSelectedFile([
                ...selectedFiles,
                ...acceptedFiles.map(file => (
                    { file, target: [targetLanguage.slice()] }
                ))
            ]);
        }
    });

    const openFileWindows = ()=>{
        open();
    }
    const openModal = (file: File) => {
        const idx = selectedFiles.findIndex(f => f.file === file);
        setIndex(idx);
        setTarget(selectedFiles[idx].target);
        onOpen();
    }

    const closeModal = () => {
        if (index !== undefined) {
            const newState = selectedFiles.slice()
            const current = newState[index];
            current.target = target;
            setSelectedFile(newState);
        }
        onClose();
    }

    useEffect(() => {
        setFileList(selectedFiles);
    }, [selectedFiles]);

    const removeFile = (file: File) => {
        setSelectedFile(selectedFiles.filter(f => f.file !== file));
    }

    const filesList = selectedFiles.map((doc: Doc) => {
        const { file } = doc;
        return (
            <ListItem key={file.name}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <Flex alignItems={'center'} justifyContent={'flex-start'}>
                        <Box minW={250} mr={5}>
                            <ListIcon as={CheckCircleIcon} color='green.500' />
                            {shortenFileName(file.name, 20)}
                        </Box>
                        <Box textAlign={'left'}>

                            <Flex alignItems={
                                'center'
                            }>
                                <Link color='blue.400' onClick={() => openModal(file)}><Text mr="3" fontSize={14}>Set languages</Text></Link>
                                {doc.target.map(t => (
                                    <Flag key={t} name={t} />
                                ))}


                            </Flex>
                        </Box>
                    </Flex>
                    <DeleteIcon onClick={() => removeFile(file)} cursor={'pointer'} color={'red.400'} />
                </Flex>
            </ListItem>
        )
    });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isFocused,
        isDragAccept,
        isDragReject
    ]);

    const selectedOptions = languageCodes.filter(lg => target.includes(lg.label));

    return (
        <>
            <Flex flexDirection={'column'} justifyContent={'center'} minH={'100%'} cursor={'pointer'}>
                <Box {...getRootProps({ style, className: 'dropzone' })} flex={1} justifyContent={'center'}>
                    <input {...getInputProps()} />
                    <Flex direction={'column'} alignItems={'center'}>
                        <Text mb={3} colorScheme={'blue.900'} fontWeight={'bold'}>Drag 'n' drop some files here, or click to select files</Text>
                        <Button leftIcon={<AiOutlineCloudUpload />} onClick={openFileWindows}>Upload Files</Button>
                    </Flex>
                </Box>
                <Box>
                    {filesList.length > 0 && <Heading as='h6' mt={3} mb={2} size={'md'}>Files</Heading>}
                    <List spacing={3} m={3}>
                        {filesList}
                    </List>
                </Box>
            </Flex>

            <Modal onClose={onClose} size={'md'} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Choose or remove languages</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Select
                            isMulti
                            defaultValue={selectedOptions}
                            options={languageCodes}
                            placeholder={'Search for...'}
                            onChange={(sl) => {
                                setTarget(sl.map(t => t.label))
                            }}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme={'blue'} onClick={() => closeModal()}>Set Languages</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};


//const he: GroupBase<string>[]

export default DropZone;
