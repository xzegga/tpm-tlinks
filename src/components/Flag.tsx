import React from 'react';
import { languageCodes } from '../utils/languageCodes';
import { Image } from '@chakra-ui/react';

interface LanguageProps {
    name: string;
    [key: string]: any;
}

const Flag: React.FC<LanguageProps> = ({ name, ...props }) => {

    const showLanguageCode = (language: string) => {
        const code = languageCodes.find(lg => lg.label === language.trim())?.value.substring(0, 2);
        return `https://unpkg.com/language-icons/icons/${code}.svg`
    }

    return (
        <Image {...props}
            alt={name}
            src={showLanguageCode(name)}
            w={'20px'} h={'20px'}
            borderRadius={3} mr={2}>
        </Image>
    );
};

export default Flag;
