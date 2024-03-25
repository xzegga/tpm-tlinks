import {
    Button,
    chakra,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    useToast,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
    return new URLSearchParams(useLocation().search)
}

const ResetPasswordPageResetPasswordPage: React.FC = () => {
    const { resetPassword } = useAuth()
    const query = useQuery()
    const navigate = useNavigate();
    const [password, setPassword] = useState('')
    const toast = useToast()

    return (
        <>
            <Heading textAlign='center' my={12}>
                Reset password
            </Heading>
            <Card maxW='md' mx='auto' mt={4}>
                <chakra.form
                    onSubmit={async e => {
                        e.preventDefault()
                        try {
                            await resetPassword(query.get('oobCode'), password)
                            toast({
                                description: 'Password has been changed, you can login now.',
                                status: 'success',
                                duration: 9000,
                                isClosable: true,
                            })
                            navigate('/login')
                        } catch (error: any) {
                            toast({
                                description: error.message,
                                status: 'error',
                                duration: 9000,
                                isClosable: true,
                            })
                        }
                    }}
                >
                    <Stack spacing='6'>
                        <FormControl id='password'>
                            <FormLabel>New password</FormLabel>
                            <Input
                                type='password'
                                autoComplete='password'
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </FormControl>
                        <Button type='submit' colorScheme='pink' size='lg' fontSize='md'>
                            Reset password
                        </Button>
                    </Stack>
                </chakra.form>
            </Card>
        </>
    )
}

export default ResetPasswordPageResetPasswordPage