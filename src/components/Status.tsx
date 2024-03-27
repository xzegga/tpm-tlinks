import { Badge, Center } from '@chakra-ui/react';
import React from 'react';

interface StatusProps {
    status: string;
}

const Status: React.FC<StatusProps> = ({ status }) => {

    const color = (status: string) => {
        if (status === 'Received') return 'cyan'
        if (status === 'In Progress') return 'yellow'
        if (status === 'Completed') return 'green'
        if (status === 'On Hold') return 'red'
    }

    return (
        <Badge w={'100px'} borderRadius={4} colorScheme={color(status)}><Center>{status}</Center></Badge>
    );
};

export default Status;
