import React, { useEffect, useState } from 'react';
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
import { getImageUrl, getTenantBySlug } from '../data/Tenant';
import Logo from '../assets/logo.png';

const NavigationBar: React.FC = () => {
    const { toggleColorMode } = useColorMode()
    const { logout } = useAuth()
    const { currentUser, setState } = useStore();
    const [logo, setLogo] = useState<string | null>();
    const Darkmode = useColorModeValue(<FaSun />, <FaMoon />)
    const DarkColor = useColorModeValue('gray.100', 'gray.700')

    useEffect(() => {
        const importSvgIcon = async (): Promise<void> => {
            try {
                const tenant = await getTenantBySlug(currentUser.tenant)
                if(tenant) setState({tenant})
                if (tenant?.image) {
                    const src = await getImageUrl(tenant.image);
                    if (src) setLogo(src);
                }
                // svgr provides ReactComponent for given svg path
            } catch (err) {
                console.error(err);
            }
        };


        if (currentUser?.tenant) {
            importSvgIcon();
        } else {
            setLogo(null);
        }

    }, [currentUser]);

    const navigate = useNavigate()

    const logoutFn = async (e: React.ChangeEvent) => {
        e.preventDefault()
        await logout()
        navigate('/login', { replace: true })
    }
    return (<>
        {currentUser?.tenant ? <Box
            borderBottom='2px'
            borderBottomColor={DarkColor}
            mb={4}
            py={4}
        >
            <HStack
                justifyContent='flex-end'
                maxW='container.lg'
                mx='auto'
                spacing={4}
            >
                <Image src={Logo} maxH="50px" />
                <Spacer />
                {currentUser && (
                    <>
                        <Flex align='center' justify='left'>

                            <Flex alignItems={'center'} mr={4}>
                                <Box mr={2}>
                                    <>{logo && <Image src={logo} maxH={65} />}</>
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
                    icon={Darkmode}
                    onClick={toggleColorMode}
                    aria-label='toggle-dark-mode'
                />


            </HStack>
        </Box> : null}
    </>

    );
};

export default NavigationBar;
