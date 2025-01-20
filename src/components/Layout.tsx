import { Box, Container } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import NavigationBar from './NavigationBar';

const Layout = () => {
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
