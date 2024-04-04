import { Table, Thead, Tr, Th, Tbody, Td, Button, Select, Image, Flex, Text, Box, useToast, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Breadcrumb, BreadcrumbItem, Spacer } from '@chakra-ui/react';
import { query, collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import 'firebase/functions'; // Import the functions module
import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { db } from '../../utils/init-firebase';
import { ROLES } from '../../models/users';
import { useStore } from '../../hooks/useGlobalStore';


const Users: React.FC = () => {
    const { currentUser } = useStore();
    const [users, setUsers] = React.useState<any[]>([]);
    const toast = useToast()
    const [isOpen, setIsOpen] = React.useState(false)
    const onClose = () => setIsOpen(false)
    const cancelRef = React.useRef(null)
    const [user, setUser] = React.useState<any>({})

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
        }
    }, [])

    const handleRole = async (user: any, role: string) => {
        if (user?.data && user?.id) {
            await setDoc(doc(db, 'users', user?.id), {
                ...user?.data,
                role
            })

            setUsers(users.map(u => u.id === user.id ? { ...u, data: { ...u.data, role: role } } : u))
            
            const userWithClaims = {
                email: user.data.email,
                customClaims: {
                    tenant: 'ChildrenHospital',
                    role,
                    department: '',
                }
            }
            await assignCustomClaims(userWithClaims);

            toast({
                description: 'User roles updated',
                status: 'info',
                duration: 9000,
                isClosable: true,
            })
        }
    }

    const assignCustomClaims = async (userWithClaims: any) => {
        try {
            const functions = getFunctions();
            const callableAssignCustomClaims = httpsCallable(functions, 'assignUserClaims');

            callableAssignCustomClaims(userWithClaims).then((result: any) => {
                console.log(result.data.output);
            }).catch((error) => {
                console.log(`error: ${JSON.stringify(error)}`);
            });

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
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {users.map(user => (
                            <Tr key={user.id}>
                                <Td>
                                    <Flex alignItems={'center'}>
                                        {user?.data?.photoUrl && <Image borderRadius='full' boxSize='35px' src={user?.data?.photoUrl} mt="0" />}
                                        <Text ml={3}>{user.data?.name}</Text>
                                    </Flex>
                                </Td>
                                <Td>{user.data?.email}</Td>
                                <Td>
                                    <Select
                                        name="roles"
                                        value={user.data?.role}
                                        onChange={(e) => handleRole(user, e.target.value)}
                                        disabled={user.data?.role ===  ROLES.Admin && currentUser?.uid === user.id}
                                    >
                                        <option value={ROLES.Admin}>Admin</option>
                                        <option value={ROLES.Client}>Client</option>
                                        <option value={ROLES.Unauthorized}>Unauthorized</option>
                                        <option value={ROLES.SuperAdmin}>Super Admin</option>
                                    </Select>
                                </Td>
                                <Td>
                                    <Button disabled={user.data?.role ===  ROLES.Admin} variant="outline" onClick={() => {
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
