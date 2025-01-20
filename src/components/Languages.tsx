import { Select } from '@chakra-ui/react';
import React from 'react';
import { featuredLanguages, languageCodes } from '../utils/languageCodes';

interface LanguagesProps {
    selected: string;
    name: string;
    handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    showAll?: boolean;
}

const Languages: React.FC<LanguagesProps> = ({ selected, name, handleChange, showAll }) => {

    function compare(a: any, b: any) {
        if (a.label < b.label) {
            return -1;
        }
        if (a.label > b.label) {
            return 1;
        }
        return 0;
    }

    const sortedArray = (langs: any) => {
        langs.sort(compare);
        return [...featuredLanguages, ...langs]
    }

    return (
        <Select required
            name={name}
            id={name}
            value={selected}
            onChange={handleChange}
            color="black"
            backgroundColor={'white'}
            placeholder='Select language' size="md">
            {showAll && <option value="All">All</option>}
            {
                sortedArray(languageCodes).map(lang => {
                    return <option key={lang.value} value={lang.label}>{lang.label}</option>
                })
            }
        </Select>
    );
};

export default Languages;
