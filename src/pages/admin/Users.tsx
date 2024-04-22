import { Table, Thead, Tr, Th, Tbody, Td, Button, Select, Image, Flex, Text, Box, useToast, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Breadcrumb, BreadcrumbItem, Spacer, InputGroup, FormLabel, FormControl, Input, FormErrorMessage, Spinner } from '@chakra-ui/react';
import { setDoc, doc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import 'firebase/functions'; // Import the functions module
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { db } from '../../utils/init-firebase';
import { ROLES } from '../../models/users';
import { useStore } from '../../hooks/useGlobalStore';
import MaxTextTooltip from '../../components/MaxTextTooltip';
import TenantDropdown from '../../components/TenantDropdown';
import { getAllUsers, removeUser, saveUser } from '../../data/users';
import { useAuth } from '../../context/AuthContext';

const initialUser = {
    email: '',
    password: '',
    tenant: '',
    role: ROLES.Client,
    department: ''
}

const Users: React.FC = () => {
    const { currentUser, tenants, loading, setState } = useStore();
    const { validate } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const toast = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const onClose = () => setIsOpen(false)
    const cancelRef = useRef(null)
    const [user, setUser] = useState<any>({})
    const [newUser, setNewUser] = useState<{
        email: string,
        password: string,
        tenant?: string,
        role?: string,
        department?: string
    }>(initialUser);

    useEffect(() => {
        getUsers();
    }, [])

    const getUsers = async () => {
        if (currentUser && currentUser.role === ROLES.Admin) {
            const response = await getAllUsers();
            if (response.length) setUsers(response);
        }
    }

    const handleRole = async (e: ChangeEvent<HTMLSelectElement>, user: any) => {
        setState({ loading: true })
        const name = e.target.name;
        const value = e.target.value;

        if (user?.data && user?.id) {
            try {
                await validate();
                const updatedUsers = [...users];
                const usr = updatedUsers.find(usr => usr.id === user.id)
                usr.data = {
                    ...usr.data,
                    ...(value && { [`${name}`]: value }),
                    ...(name === 'tenant' && { department: 'all' })
                }

                setUsers(updatedUsers)

                await setDoc(doc(db, 'users', user?.id), {
                    ...user?.data,
                    ...(value && { [`${name}`]: value }),
                    ...(name === 'tenant' && { department: 'all' })
                });

                const userWithClaims = {
                    email: user.data.email,
                    customClaims: {
                        ...(value && { [`${name}`]: value }),
                        ...(name === 'tenant' && { department: 'all' })
                    },
                    token: currentUser.token
                }
                await assignCustomClaims(userWithClaims);

                toast({
                    description: 'User claims updated',
                    status: 'info',
                    duration: 9000,
                    isClosable: true,
                })
            } catch (error) {
                toast({
                    description: 'Error updating claims',
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                })
            }
        }
    }

    const assignCustomClaims = async (userWithClaims: any) => {
        try {
            const functions = getFunctions();
            const callableAssignCustomClaims = httpsCallable(functions, 'assignUserClaims');

            await callableAssignCustomClaims(userWithClaims);
        } catch (error) {
            // Handle error
            console.error(error);
        } finally {
            setState({ loading: false })
        }
    };

    const handleDeleteUser = async () => {
        setIsOpen(false)
        setState({ loading: true })
        if (user) {
            await validate();
            const response = await removeUser(currentUser.token, user.data.uid, user.id)
            await getUsers();
            setState({ loading: false })
            console.log({response})
            toast({
                description: response.data,
                status: 'success',
                duration: 9000,
                isClosable: true,
            })
        }
    }

    const handleNewUser = (e: { target: { name: any; value: any; }; }) => {
        const usr = {
            ...newUser,
            [e.target.name]: e.target.value
        }
        setNewUser(usr);
    }

    const submitUser = async () => {
        setState({ loading: true })
        if (newUser) {
            await validate();
            const saved = await saveUser(currentUser.token, newUser)
            if (saved) {
                setUsers([
                    ...users,
                    saved
                ])
            }
        }
        setState({ loading: false })
        setNewUser(initialUser)
    }

    return (
        <>
            <Box pt={10} mb={8}>
                <Flex mb='10'>
                    <Box>
                        <Breadcrumb separator='/'>
                            <BreadcrumbItem>
                                <Text>Home</Text>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <NavLink to='/admin'>Project Dashboard</NavLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Text>Users</Text>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </Box>

                    <Spacer />
                </Flex>
            </Box>
            <Box mb={10}>
                <Flex gap={4} alignItems={'end'} justifyContent={'start'}>
                    <FormControl id="email" flex={2} isInvalid={newUser?.email === ''}>
                        <Flex alignItems={'center'}>
                            <FormLabel>Email</FormLabel>
                            {!newUser?.email && <FormErrorMessage mt={0} mb={2}>(* Required)</FormErrorMessage>}
                        </Flex>
                        <InputGroup borderColor="#E0E1E7" display={'flex'} flexDirection={'column'}>
                            <Input placeholder=""
                                name="email" id="email" value={newUser?.email}
                                onChange={handleNewUser}
                                required />

                        </InputGroup>
                    </FormControl>
                    <FormControl id="password" flex={2} isInvalid={newUser?.password === ''}>
                        <Flex alignItems={'center'}>
                            <FormLabel>Password</FormLabel>
                            {!newUser?.password && <FormErrorMessage mt={0} mb={2}>(* Required)</FormErrorMessage>}
                        </Flex>
                        <InputGroup borderColor="#E0E1E7" display={'flex'} flexDirection={'column'}>
                            <Input placeholder=""
                                name="password" id="password" value={newUser?.password}
                                onChange={handleNewUser}
                                required />

                        </InputGroup>
                    </FormControl>
                    <FormControl id="tenant" flex={3} isRequired={newUser?.tenant === ''}>
                        <FormLabel>Client</FormLabel>
                        <InputGroup borderColor="#E0E1E7" display={'flex'} flexDirection={'column'}>
                            <TenantDropdown
                                value={newUser?.tenant || ''}
                                handleChange={handleNewUser}
                                disabled={!newUser?.email || !newUser?.password}
                                select={'None'}
                            />
                            {!newUser?.tenant
                                && <FormErrorMessage>Client is required.</FormErrorMessage>}
                        </InputGroup>
                    </FormControl>
                    <FormControl id="department" flex={1}>
                        <FormLabel>Department</FormLabel>
                        <InputGroup borderColor="#E0E1E7">

                            <Select
                                maxW={'180px'}
                                name="department"
                                value={newUser?.department}
                                onChange={handleNewUser}
                                size="md"
                                flex={1}
                                disabled={!newUser?.tenant}
                            >
                                <option>None</option>
                                <option value='all'>All</option>
                                {tenants && tenants.length ? <>
                                    {tenants.find(tn => tn.slug === newUser?.tenant)?.departments.map((dp) =>
                                        <option
                                            key={dp}
                                            value={dp}
                                        >{dp}
                                        </option>)
                                    }
                                </>
                                    : null}

                            </Select>
                        </InputGroup>
                    </FormControl>
                    <FormControl id="logo" flex={1}>
                        <InputGroup>
                            <Flex gap={2}>
                                <Button
                                    isLoading={false}
                                    colorScheme={'blue'}
                                    loadingText='Saving'
                                    onClick={submitUser}
                                    spinnerPlacement='start'
                                    isDisabled={!newUser?.department}
                                ><Text>Add User</Text>
                                </Button>
                            </Flex>
                        </InputGroup>
                    </FormControl>
                </Flex>
            </Box>
            <Box position={'relative'}>
                {loading && <Flex
                    h={'100%'}
                    style={{
                        position: 'absolute',
                        left: 0, right: 0, top: 0, bottom: 0,
                        width: '100%',
                        height: '100%',
                        textAlign: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        zIndex: 10
                    }}
                    position={'absolute'}
                    alignItems={'center'}
                ><Spinner size='xl' mx={'auto'} /></Flex>}
                {currentUser && currentUser?.role === ROLES.Admin && (
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Email</Th>
                                <Th>Roles</Th>
                                <Th>Client</Th>
                                <Th>Departments</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {users.map(user => (
                                <Tr key={user.id}>
                                    <Td py={1.5} px={1.5}>
                                        <Flex alignItems={'center'}>
                                            {user?.data?.photoUrl && <Image borderRadius='full' boxSize='35px' src={user?.data?.photoUrl} mt="0" />}
                                            <Text ml={3}>{user.data?.name}</Text>
                                        </Flex>
                                    </Td>
                                    <Td maxW={'160px'}>
                                        <MaxTextTooltip maxWidth={150}>
                                            {user.data?.email}
                                        </MaxTextTooltip>
                                    </Td>

                                    <Td px={1.5} py={0.5}>
                                        <Select
                                            h={'30px'}
                                            name="role"
                                            value={user.data?.role}
                                            onChange={(e) => handleRole(e, user)}
                                            disabled={user.data?.role === ROLES.Admin && currentUser?.uid === user.id}
                                        >
                                            <option value={ROLES.Admin}>Admin</option>
                                            <option value={ROLES.Client}>Client</option>
                                            <option value={ROLES.Unauthorized}>Unauthorized</option>
                                        </Select>
                                    </Td>
                                    <Td minW={'100px'} px={1.5} py={0.5}>
                                        <TenantDropdown
                                            value={user.data?.tenant || 'guess'}
                                            disabled={
                                                (user.data?.role === ROLES.Admin && currentUser?.uid === user.id)
                                                || !user.data?.role
                                                || user.data?.role === ROLES.Unauthorized
                                            }
                                            handleChange={(e: any) => handleRole(e, user)}
                                            select={'None'} />
                                    </Td>
                                    <Td px={1.5} py={0.5}>
                                        <Select
                                            h={'30px'}
                                            maxW={'180px'}
                                            name="department"
                                            value={user.data?.department || 'all'}
                                            onChange={(e) => handleRole(e, user)}
                                            disabled={
                                                (user.data?.role === ROLES.Admin && currentUser?.uid === user.id)
                                                || !user.data?.tenant
                                                || user.data?.role === ROLES.Unauthorized
                                                || user.data?.tenant === 'none'
                                            }
                                        >
                                            <option value='all'>All</option>
                                            {tenants && tenants.length ? <>
                                                {tenants.find(tn => tn.slug === user.data?.tenant)?.departments.map((dp) =>
                                                    <option
                                                        key={dp}
                                                        value={dp}
                                                    >{dp}
                                                    </option>)
                                                }
                                            </>
                                                : null}

                                        </Select>
                                    </Td>
                                    <Td py={1.5} px={1.5}>
                                        <Button
                                            h={'30px'} disabled={user.data?.role === ROLES.Admin} variant="outline" onClick={() => {
                                                setIsOpen(true);
                                                setUser(user);
                                            }}>Delete</Button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )
                }
            </Box>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Delete Customer
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={handleDeleteUser} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

        </>
    );
};

export default Users;
