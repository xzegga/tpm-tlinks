import { Table, Thead, Tr, Th, Tbody, Td, Button, Select, Image, Flex, Text, Box, useToast, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Breadcrumb, BreadcrumbItem, Spacer } from '@chakra-ui/react';
import { query, collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import 'firebase/functions'; // Import the functions module
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { db } from '../../utils/init-firebase';
import { ROLES } from '../../models/users';
import { useStore } from '../../hooks/useGlobalStore';
import { getAllTenants } from '../../data/Tenant';
import { Tenant } from '../../models/clients';
import MaxTextTooltip from '../../components/MaxTextTooltip';
import TenantDropdown from '../../components/TenantDropdown';


const Users: React.FC = () => {
    const { currentUser } = useStore();
    const [users, setUsers] = useState<any[]>([]);
    const toast = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const onClose = () => setIsOpen(false)
    const cancelRef = useRef(null)
    const [user, setUser] = useState<any>({})
    const [tenants, setTenants] = useState<Tenant[]>([]);

    useEffect(() => {
        if (currentUser && currentUser.role === ROLES.Admin) {
            const queryWithLast = query(collection(db, 'users'))
            const unsubscribe = onSnapshot(queryWithLast, (querySnapshot) => {
                setUsers(
                    querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        data: doc.data()
                    }))
                );
                unsubscribe();
            });

            const fetchData = async () => {
                const fetchedTenants = await getAllTenants();
                setTenants(fetchedTenants);
            };

            if (currentUser?.role === ROLES.Admin) fetchData();
        }
    }, [])


    const handleRole = async (e: ChangeEvent<HTMLSelectElement>, user: any) => {
        const name = e.target.name;
        const value = e.target.value;

        if (user?.data && user?.id) {
            try {
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
        }
    };

    const handleDeleteUser = async () => {

        setIsOpen(false)

        await deleteDoc(doc(db, 'users', user.id));
        toast({
            description: 'User deleted',
            status: 'success',
            duration: 9000,
            isClosable: true,
        })

        setUsers(users.filter(u => u.id !== user.id))
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
                                            || !user.data.role
                                            || user.data?.role === ROLES.Unauthorized
                                        }
                                        handleChange={(e: any) => handleRole(e, user)} />
                                </Td>
                                <Td px={1.5} py={0.5}>
                                    <Select
                                        h={'30px'}
                                        maxW={'180px'}
                                        name="department"
                                        value={user.data.department || 'all'}
                                        onChange={(e) => handleRole(e, user)}
                                        disabled={
                                            (user.data?.role === ROLES.Admin && currentUser?.uid === user.id)
                                            || !user.data.tenant
                                            || user.data?.role === ROLES.Unauthorized
                                            || user.data.tenant === 'none'
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
