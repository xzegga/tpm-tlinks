import React, { useEffect, useRef } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useGlobalStore';

const NavigationBar: React.FC = () => {
    const { toggleColorMode } = useColorMode()
    const { logout } = useAuth()
    const { currentUser: currentUser } = useStore();
    const ImportedIconRef = useRef<React.FC<React.SVGProps<SVGElement>>>();
    const IsotipoRef = useRef<React.FC<React.SVGProps<SVGElement>>>();

    useEffect(() => {
        const importSvgIcon = async (): Promise<void> => {
            try {
                const { default: SvgLogo } = (await import(`../assets/${currentUser.tenant}-logo.svg?react`));
                ImportedIconRef.current = SvgLogo;

                const { default: SvgIso } = (await import(`../assets/${currentUser.tenant}-isotipo.svg?react`));
                IsotipoRef.current = SvgIso
                console.log(IsotipoRef.current)
                // svgr provides ReactComponent for given svg path
            } catch (err) {
                console.error(err);
            }
        };


        if (currentUser?.tenant) {
            console.log('something')
            importSvgIcon();
        }

    }, [currentUser]);

    const navigate = useNavigate()

    const logoutFn = async (e: React.ChangeEvent) => {
        e.preventDefault()
        await logout()
        navigate('/login', { replace: true })
    }


    const Logo = ImportedIconRef.current;
    const Isotipo = IsotipoRef.current;

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
                                <Box mr={2}>
                                    {Logo && <Logo />}
                                </Box>
                                <Box mt={5} ml={-2} >
                                    {Isotipo && <Isotipo />}
                                </Box>
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
