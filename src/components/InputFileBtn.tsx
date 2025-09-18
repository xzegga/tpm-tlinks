import { Button, Flex, Text } from '@chakra-ui/react';
import React, { useRef } from 'react';
import '../pages/shared/AddProject.css';
import { IconType } from 'react-icons';

interface InputFileProps {
    uploadFile?: (files: FileList) => Promise<void>;
    text: string;
    scheme: string;
    icon?: IconType;
}

const InputFileBtn: React.FC<InputFileProps> = ({ uploadFile, text, scheme, icon }) => {

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
                {...(icon ? { leftIcon: React.createElement(icon, {}) } : {})}
                colorScheme={scheme}
                onClick={() => uploadFileClick()}>
                <Flex alignItems={'center'}>
                    <Text ml={2}>{text}</Text>
                </Flex>
            </Button>
        </>

    );
};

export default InputFileBtn;
