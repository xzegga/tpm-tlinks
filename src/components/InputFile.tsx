import { Flex, Link, Text } from '@chakra-ui/react';
import React, { useRef } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { DocumentObject } from '../models/document';

interface InputFileProps {
    doc: DocumentObject;
    target: string;
    uploadFile?: (files: FileList, doc: DocumentObject, target: string) => Promise<void>;
}

const InputFile: React.FC<InputFileProps> = ({ doc, target, uploadFile }) => {

    const inputFile = useRef<HTMLInputElement>(null)

    const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>, doc: DocumentObject) => {
        if (event.target.files?.length && uploadFile) {
            uploadFile(event.target.files, doc, target)
        }
        if (inputFile?.current?.files) {
            inputFile.current.value = '';
        }
    }

    const uploadFileClick = () => {
        if (inputFile && inputFile.current) {
            inputFile.current.click();
        }
    }

    return (
        <>
            {doc && (
                <>
                    <input type='file' id={doc.id} ref={inputFile} style={{ display: 'none' }} onChange={(e) => onChangeFile(e, doc)} multiple />
                    <Link color='blue.400' onClick={() => uploadFileClick()}>
                        <Flex alignItems={'center'}><AiOutlineCloudUpload /> <Text ml={2}>Add File</Text></Flex>
                    </Link>
                </>
            )}

        </>
    );
};

export default InputFile;
