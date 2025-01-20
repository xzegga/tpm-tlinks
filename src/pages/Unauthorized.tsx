import { Box, Container, Heading, Image, Text } from '@chakra-ui/react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Navlnk from '../components/NavLnk';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png';

const Unauthorized: React.FC = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation();

    const logoutFn = async (e: React.ChangeEvent<unknown>) => {
        e.preventDefault()
        await logout()
        navigate('/login', { replace: true, state: { from: location } })
    }

    return (
        <Box mb={16} h={'70vh'}>
            <Container centerContent maxWidth={'440px'} w={'100%'} h={'100%'} >
                <Card mx='auto' my={'auto'} >

                    <Container centerContent pt={'10px'} pb={'30px'} >
                        <Image src={Logo} minW="300px" />
                    </Container>

                    <Container centerContent pt={'10px'} pb={'30px'} >
                        <Heading as="h2" size="lg" textAlign={'center'}>
                            You are not authorized to view this page.
                        </Heading>
                        <Text textAlign={'center'}>Please contact a Translationlinks Administrator to allow your to use this content</Text>
                        <Navlnk to='/logout' name='Logout' py="10" m="0" maxH="18px"
                            onClick={logoutFn}
                        />
                    </Container>
                </Card>
            </Container>
        </Box>
    );
};

export default Unauthorized;
