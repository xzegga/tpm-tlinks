import { Box, Container } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import usePreviousRoute from '../hooks/usePreviousRoute';

const Layout = () => {
    usePreviousRoute();
    return (
        <Box mb={16}>
            <NavigationBar />
            <Container maxW='container.xl' w={'container.xl'} >
                <Outlet />
            </Container>
        </Box>
    );
};

export default Layout;
