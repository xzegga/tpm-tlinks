import { Box, Container, Flex, Image, Square } from '@chakra-ui/react';
import React from 'react';
import { RotateSpinner } from 'react-spinners-kit';
import Logo from '../assets/logo.png';

const Loading: React.FC = () => {
    const loadingColorYellow: string = '#ffcd62'
    return (
        <Container maxW='container.md' centerContent>
            <Square size='100vh'>
                <Flex>
                    <Box pt={1}><RotateSpinner size={30} color={loadingColorYellow} /></Box>
                    <Box ml={5}><Image src={Logo} maxH="50px" /></Box>
                </Flex>
            </Square>
        </Container>

    );
};

export default Loading;
