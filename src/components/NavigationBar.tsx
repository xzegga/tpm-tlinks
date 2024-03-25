import React from 'react';
import {
    useColorMode,
    useColorModeValue,
    Flex,
    Box,
    HStack,
    IconButton,
    Spacer,
    Text,
    Image
} from '@chakra-ui/react'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext';
import Navlnk from './NavLnk';

import  MarkLogo from '../assets/logo-chco-mark-color.svg?react';
import TypeLogo from '../assets/logo-chco-type-color.svg?react';
import { useNavigate } from 'react-router-dom';

const NavigationBar: React.FC = () => {
    const { toggleColorMode } = useColorMode()
    const { logout, currentUser } = useAuth()

    const navigate = useNavigate()

    const logoutFn = async (e: React.ChangeEvent) => {
        e.preventDefault()
        await logout()
        navigate('/login', { replace: true })

    }

    return (
        <Box
            borderBottom='2px'
            borderBottomColor={useColorModeValue('gray.100', 'gray.700')}
            mb={4}
            py={4}
        >
            <HStack
                justifyContent='flex-end'
                maxW='container.lg'
                mx='auto'
                spacing={4}
            >
                <Image src="https://translationlinks.com/img/logo.png" maxH="50px" />
                <Spacer />
                {currentUser && (
                    <>
                        <Flex align='center' justify='left'>
                            <Flex alignItems={'center'} mr={10}>
                                <Box mr={2} ><MarkLogo /></Box>
                                <Box mt={5} ml={-2} ><TypeLogo width={180} /></Box>
                            </Flex>
                            {currentUser && currentUser?.photoURL && <Image borderRadius='full' boxSize='35px' src={currentUser?.photoURL} mt="0" />}
                            <Text mt={0} fontSize="sm" fontWeight="semibold" lineHeight="short" pl="2">
                                {currentUser?.displayName && (<span>{currentUser?.displayName} <br /></span>)}
                                <Navlnk to='/logout' name='Logout' p="0" m="0" maxH="18px"
                                    onClick={logoutFn}
                                />
                            </Text>
                        </Flex>
                    </>
                )}
                <IconButton
                    variant='ghost'
                    icon={useColorModeValue(<FaSun />, <FaMoon />)}
                    onClick={toggleColorMode}
                    aria-label='toggle-dark-mode'
                />


            </HStack>
        </Box>
    );
};

export default NavigationBar;
