import React, { useEffect, useState } from 'react';
import { useAuth, UserWithRoles } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, chakra, Container, FormControl, FormLabel, HStack, Input, Stack, useToast, Image } from '@chakra-ui/react'
import { FaGoogle } from 'react-icons/fa';

import DividerWithText from '../components/DividerWithText';
import Card from '../components/Card';
import useMounted from '../hooks/useMounted';
import Loading from '../components/Loading';
import { useStore } from '../hooks/useGlobalStore';
import { LoggedUser } from '../store/initialGlobalState';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast()
    const mounted = useMounted()
    const { signInWithGoogle, login, currentUser = false } = useAuth()

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const { setState } = useStore();

    const handleRedirectToOrBack = async () => {
        const user = currentUser as UserWithRoles
        if (user) {
            // Read claims from the user object
            const { claims } = await user.getIdTokenResult();

            if (claims?.role) {
                setState({
                    currentUser: {
                        uid: claims.user_id as string,
                        role: claims.role as string,
                        tenant: claims.tenant as string,
                        department: claims.department as string,
                        ...currentUser,
                    } as LoggedUser
                });

                navigate(`/${claims?.role}/`, { replace: false })
            }
        }
    }

    useEffect(() => {
        if (currentUser) {
            handleRedirectToOrBack()
        }
    }, [currentUser]);

    const submit = async (e: any) => {
        e.preventDefault()
        if (!email || !password) {
            return
        }

        setIsSubmitting(true)
        login(email, password)
            .then(() => {
                handleRedirectToOrBack()
            })
            .catch((error: { message: any; }) => errorToast(error.message))
            .finally(() => {
                mounted.current && setIsSubmitting(false)
            })
    }

    const loginWithGoogle = () => {
        signInWithGoogle()
            .then((response) => {
                console.log(response)
                handleRedirectToOrBack();
            })
            .catch((error: { message: any; }) => errorToast(error.message));
    }

    const errorToast = (error: any) => {
        toast({
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
        })
    }

    return (
        <>
            {
                currentUser === false ? (
                    <Loading />
                ) : currentUser === null ? (
                    <Box mb={16} h={'80vh'}>
                        <Container centerContent maxWidth={'440px'} w={'100%'} h={'100%'} >
                            <Card mx='auto' my={'auto'} >

                                <Container centerContent pt={'10px'} pb={'30px'} >
                                    <Image src="https://translationlinks.com/img/logo.png" minW="300px" />
                                </Container>

                                <chakra.form
                                    onSubmit={submit}
                                >
                                    <Stack spacing='6'>
                                        <FormControl id='email'>
                                            <FormLabel>Email address</FormLabel>
                                            <Input
                                                name='email'
                                                type='email'
                                                autoComplete='email'
                                                required
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl id='password'>
                                            <FormLabel>Password</FormLabel>
                                            <Input
                                                name='password'
                                                type='password'
                                                autoComplete='password'
                                                value={password}
                                                required
                                                onChange={e => setPassword(e.target.value)}
                                            />
                                        </FormControl>
                                        {/* <PasswordField /> */}
                                        <Button
                                            type='submit'
                                            colorScheme='blue'
                                            bg='blue.700'
                                            size='lg'
                                            fontSize='md'
                                            isLoading={isSubmitting}
                                        >
                                            Sign in
                                        </Button>
                                    </Stack>
                                </chakra.form>
                                <HStack justifyContent='space-between' my={4}>
                                    <Button variant='link'>
                                        <Link to='/forgot-password'>Forgot password?</Link>
                                    </Button>
                                    <Button variant='link' onClick={() => navigate('/register')}>
                                        Register
                                    </Button>
                                </HStack>
                                <DividerWithText my={6}>OR</DividerWithText>
                                <Button
                                    variant='outline'
                                    width='100%'
                                    colorScheme='red'
                                    leftIcon={<FaGoogle />}
                                    onClick={loginWithGoogle}
                                >
                                    Sign in with Google
                                </Button>
                            </Card>
                        </Container>
                    </Box>
                ) : (<>

                </>)
            }
        </>)
};

export default Login;
