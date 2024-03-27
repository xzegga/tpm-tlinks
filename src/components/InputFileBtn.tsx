import { Button, Flex, Text } from '@chakra-ui/react';
import React, { useRef } from 'react';
import { GrDocumentZip } from 'react-icons/gr';
import '../pages/shared/AddProject.css';

interface InputFileProps {
    uploadFile?: (files: FileList) => Promise<void>;
}

const InputFileBtn: React.FC<InputFileProps> = ({ uploadFile }) => {

    const inputFile = useRef<HTMLInputElement>(null)

    const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.length && uploadFile) {
            uploadFile(event.target.files)
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
            <input type='file' ref={inputFile} style={{ display: 'none' }} onChange={(e) => onChangeFile(e)} multiple />
            <Button
                leftIcon={<GrDocumentZip className={'white-icon'} />}
                colorScheme='green'
                onClick={() => uploadFileClick()}>
                <Flex alignItems={'center'}>
                    <Text ml={2}>Add Certificate</Text>
                </Flex>
            </Button>
        </>

    );
};

export default InputFileBtn;
