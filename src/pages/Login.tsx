import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, chakra, Container, FormControl, FormLabel, HStack, Input, Stack, useToast, Image } from '@chakra-ui/react'
import { FaGoogle } from 'react-icons/fa';

import DividerWithText from '../components/DividerWithText';
import Card from '../components/Card';
import useMounted from '../hooks/useMounted';
import Loading from '../components/Loading';
import { useStore } from '../hooks/useGlobalStore';
import Logo from '../assets/logo.png';
import usePreviousRoute from '../hooks/usePreviousRoute';

import { getFunctions, httpsCallable } from 'firebase/functions';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast()
    const mounted = useMounted()

    const { signInWithGoogle, login } = useAuth()

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const { currentUser } = useStore();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { getPreviousRoute, clearPreviousRoute } = usePreviousRoute();

    useEffect(() => {
        const seed = async () => {
            try {
                const functions = getFunctions();
                const setClaim = httpsCallable(functions, "seedAdminClaim");
                const result: any = await setClaim({});
                console.log("🌱 Seed result:", result.data);
            } catch (err) {
                console.error("Error seeding admin claim:", err);
            }
        };

        seed();
    }, []);

    useEffect(() => {
        goToPage();
    }, [])


    useEffect(() => {
        goToPage();
    }, [currentUser])

    const goToPage = () => {
        if (currentUser?.uid && currentUser?.role) {
            const lastRoute = getPreviousRoute() || `/${currentUser?.role}/`;
            navigate(lastRoute, { replace: false })
        } else {
            if (!currentUser.uid) {
                setTimeout(() => {
                    setIsLoading(false);
                    clearPreviousRoute();
                }, 1000);
            }
        }
    }

    const submit = async (e: any) => {
        e.preventDefault()
        if (!email || !password) {
            return
        }

        setIsSubmitting(true)
        login(email, password)
            .catch(() => errorToast())
            .finally(() => {
                mounted.current && setIsSubmitting(false)
            })
    }

    const loginWithGoogle = () => {
        signInWithGoogle()
            .finally(() => {
                mounted.current && setIsSubmitting(false)
            });
    }

    const errorToast = () => {
        toast({
            description: "Incorrect username or password, please check and try again",
            status: 'error',
            duration: 9000,
            isClosable: true,
        })
    }

    if (isSubmitting || isLoading) return <Loading />

    return (
        <>
            {!currentUser.uid ? (
                <Box mb={16} h={'80vh'}>
                    <Container centerContent maxWidth={'440px'} w={'100%'} h={'100%'} >
                        <Card mx='auto' my={'auto'} >

                            <Container centerContent pt={'10px'} pb={'30px'} >
                                <Image src={Logo} minW="300px" />
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
            ) : null
            }
        </>)
};

export default Login;
