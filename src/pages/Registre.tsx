import { useToast, Heading, chakra, Stack, FormControl, FormLabel, Input, Button, Center } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import DividerWithText from '../components/DividerWithText';
import { useAuth } from '../context/AuthContext';

const Registre: React.FC = () => {
    const navigate = useNavigate();
    const { signInWithGoogle, register } = useAuth()

    const toast = useToast()
    const mounted = useRef(false)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
        }
    }, [])

    return (
        <>
            <Heading textAlign='center' my={12}>
                Register
            </Heading>
            <Card maxW='md' mx='auto' mt={4}>
                <chakra.form
                    onSubmit={async e => {
                        e.preventDefault()
                        if (!email || !password) {
                            toast({
                                description: 'Credentials not valid.',
                                status: 'error',
                                duration: 9000,
                                isClosable: true,
                            })
                            return
                        }
                        // your register logic here
                        setIsSubmitting(true)
                        register(email, password)
                            .then(() => {
                                toast({
                                    description: 'User created successfully. Please login.',
                                    status: 'error',
                                    duration: 9000,
                                    isClosable: true,
                                })
                                return navigate('/unauthorized')
                            })
                            .catch((error: { message: any; }) => {
                                toast({
                                    description: error.message,
                                    status: 'error',
                                    duration: 9000,
                                    isClosable: true,
                                })
                            })
                            .finally(() => {
                                mounted.current && setIsSubmitting(false)
                            })
                    }}
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
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </FormControl>
                        <Button
                            type='submit'
                            colorScheme='pink'
                            size='lg'
                            fontSize='md'
                            isLoading={isSubmitting}
                        >
                            Sign up
                        </Button>
                    </Stack>
                </chakra.form>
                <Center my={4}>
                    <Button variant='link' onClick={() => navigate('/login', { replace: true })}>
                        Login
                    </Button>
                </Center>
                <DividerWithText my={6}>OR</DividerWithText>
                <Button
                    variant='outline'
                    w={'100%'}
                    colorScheme='red'
                    leftIcon={<FaGoogle />}
                    onClick={() =>
                        signInWithGoogle()
                            .then((user: any) => console.log(user))
                            .catch((e: { message: any; }) => console.log(e.message))
                    }
                >
                    Sign in with Google
                </Button>
            </Card>
        </>
    )
};

export default Registre;
