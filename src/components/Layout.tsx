import { Box, Container } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import usePreviousRoute from '../hooks/usePreviousRoute';

const Layout = () => {
    usePreviousRoute();
    return (
        <Box mb={16}>
            <NavigationBar />
            <Container maxW='container.lg' w={'container.lg'} >
                <Outlet />
            </Container>
        </Box>
    );
};

export default Layout;
