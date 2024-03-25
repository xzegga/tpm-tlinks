import {
    Container,
    Flex,
    Box,
    Heading,
    Spacer,
    Link,
    Center,
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    FormControl,
    FormLabel,
    Select
} from '@chakra-ui/react';
import { query, collection, onSnapshot, limit, DocumentData, QueryDocumentSnapshot, startAfter, orderBy, where, Timestamp } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavLnk from '../../components/NavLnk';
import ProjectListTable from '../../components/tables/ProjectListTable';
import { useAuth } from '../../context/AuthContext';

import { db } from '../../utils/init-firebase';
import { allStatuses, statuses, monthNames } from '../../utils/value-objects';

import { lastDayOfMonth, endOfDay } from 'date-fns';
import { generateYears } from '../../utils/helpers';
import { deleteProject, getCounter } from '../../data/Projects';
import { ProjectObject, Project } from '../../models/project';

const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const pagination = 20;
    const navigate = useNavigate();
    const [projects, setProjects] = React.useState<ProjectObject[]>([]);
    const [lastDoc, setLastDoc] = React.useState<QueryDocumentSnapshot<DocumentData>>();
    const [count, setCount] = React.useState<number>(0);

    const [page, setPage] = React.useState<number>(0);
    const [pages, setPages] = React.useState<number>(0);
    const [status, setStatus] = React.useState<string>('All');
    const [monthSelected, setMonthSelected] = React.useState<number>(-1);
    const [yearSelected, setYearSelected] = React.useState<number>(new Date().getFullYear());

    const toast = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const onClose = () => setIsOpen(false);
    const cancelRef = React.useRef(null);
    const [project, setProject] = React.useState<ProjectObject>();

    useEffect(() => {
        if (currentUser) {
            getCounter('projects').then((count) => {
                setPage(1);
                setCount(count?.value | 0);
                setPages(Math.ceil(count?.value / pagination));
            });
        }
    }, [currentUser]);

    useEffect(() => {
        if (count) {
            queryProjects(lastDoc);
        }
    }, [count]);

    const fetchMore = () => {
        queryProjects(lastDoc);
    };

    const removeProject = (project: ProjectObject) => {
        setProject(project);
        setIsOpen(true);
    };

    const handleDeleteProject = () => {
        if (currentUser && project) {
            deleteProject(project.id);
            // setProjects(projects.filter(p => p.id !== project.id));

            toast({
                title: 'Project deleted',
                description: 'The project has been deleted',
                status: 'success',
                duration: 9000,
                isClosable: true
            });

            setIsOpen(false);
            const projectsCopy = [...projects];
            const index = projectsCopy.findIndex((p) => p.id === project.id);
            if (index > -1) {
                projectsCopy.splice(index, 1);
                setProjects(projectsCopy);
            }
        }
    };

    const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLastDoc(undefined);
        setStatus(e.target.value);
    };

    const handleFilterDate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLastDoc(undefined);
        setMonthSelected(Number(e.target.value));
    };

    useEffect(() => {
        queryProjects(lastDoc, true);
    }, [monthSelected, yearSelected, status]);

    const queryProjects = (lastDoc: QueryDocumentSnapshot<DocumentData> | undefined, newQuery = false) => {
        if (currentUser) {
            // Where Status
            const whereStatement = status !== 'All' ? where('status', '==', status) : where('status', 'in', statuses);

            // Where Month

            const startOfMonth = monthSelected >= 0 ? new Date(yearSelected, monthSelected, 1) : new Date(yearSelected, 0, 1);

            const endOfMonth = monthSelected >= 0 && startOfMonth ? endOfDay(lastDayOfMonth(startOfMonth)) : new Date(yearSelected, 11, 31);

            const whereStart = where('created', '>=', Timestamp.fromDate(startOfMonth));
            const whereEnds = where('created', '<=', Timestamp.fromDate(endOfMonth));

            if (lastDoc && !newQuery) {
                const queryWithLast = query(collection(db, 'projects'), limit(pagination), whereStatement, whereStart, whereEnds, orderBy('created', 'desc'), startAfter(lastDoc));
                const unsubscribe = onSnapshot(queryWithLast, (querySnapshot) => {
                    const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : undefined;

                    setProjects([
                        ...projects,
                        ...querySnapshot.docs.map((doc) => ({
                            id: doc.id,
                            data: doc.data() as Project
                        }))
                    ]);
                    setLastDoc(lastDoc);
                    unsubscribe();
                });
            } else {
                const queryFist = query(collection(db, 'projects'), whereStatement, whereStart, whereEnds, orderBy('created', 'desc'), limit(pagination));

                const unsubscribe = onSnapshot(queryFist, (querySnapshot) => {
                    const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : undefined;
                    setProjects(
                        querySnapshot.docs.map((doc) => ({
                            id: doc.id,
                            data: doc.data() as Project
                        }))
                    );
                    setLastDoc(lastDoc);
                    unsubscribe();
                });
            }
        }
    };

    return (
        <>
            {currentUser && (
                <>
                    <Container maxW="container.lg" overflowX="auto" py={4}>
                        <Flex mb="1" alignItems={'center'}>
                            <Spacer />
                            {currentUser.role === 'admin' && (
                                <Link onClick={() => navigate('users', { replace: true })} colorScheme={'blue.700'} mr={5}>
                                    Manage Users
                                </Link>
                            )}
                            <Box>
                                <NavLnk to="projects/add" name="New Project" colorScheme="blue.500" bg="blue.700" size="md" color="white">
                                    New Project
                                </NavLnk>
                            </Box>
                        </Flex>

                        <Box pt={10}>
                            <Flex alignItems={'center'}>
                                <Heading size="md" whiteSpace={'nowrap'} flex={1}>
                                    Project List
                                </Heading>
                                <Box>
                                    <Flex>
                                        <FormControl id="language_requested" ml={5}>
                                            <Flex alignItems={'center'} justifyContent={'start'}>
                                                <FormLabel my={0}>Year</FormLabel>
                                                <Select
                                                    maxW={150}
                                                    ml={2}
                                                    name={'yearSelected'}
                                                    id={'yearSelected'}
                                                    value={yearSelected}
                                                    onChange={(e) => setYearSelected(Number(e.target.value))}
                                                >
                                                    {generateYears().map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </Flex>
                                        </FormControl>
                                        <FormControl id="language_requested" ml={5}>
                                            <Flex alignItems={'center'} justifyContent={'start'}>
                                                <FormLabel my={0}>Month</FormLabel>
                                                <Select minW={140} ml={2} name={'monthSelected'} id={'monthSelected'} value={monthSelected} onChange={handleFilterDate}>
                                                    <option value={-1}>All</option>
                                                    {monthNames.map((s) => (
                                                        <option key={s.value} value={s.value}>
                                                            {s.name}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </Flex>
                                        </FormControl>
                                        <FormControl id="language_requested" ml={5}>
                                            <Flex alignItems={'center'} justifyContent={'start'}>
                                                <FormLabel my={0}>Status</FormLabel>
                                                <Select minW={140} ml={2} name={'status'} id={'status'} selected={status} onChange={handleFilter}>
                                                    {allStatuses.map((s: string) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </Flex>
                                        </FormControl>
                                    </Flex>
                                </Box>
                            </Flex>
                        </Box>
                        <Box>
                            <ProjectListTable projects={projects} removeProject={removeProject} />
                            <Spacer mt={10} />
                            <Center>
                                Showing {projects.length} of {count} projects
                            </Center>
                            <Center>
                                {count > projects.length && (
                                    <Link onClick={fetchMore} color={'blue.700'}>
                                        Load More...
                                    </Link>
                                )}
                            </Center>
                        </Box>
                    </Container>

                    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                        <AlertDialogOverlay>
                            <AlertDialogContent>
                                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                    Delete Project {project?.data.projectId}
                                </AlertDialogHeader>

                                <AlertDialogBody>Are you sure to delete this project? All related files will be deleted and you can't undo this action afterward.</AlertDialogBody>

                                <AlertDialogFooter>
                                    <Button ref={cancelRef} onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button colorScheme="red" onClick={handleDeleteProject} ml={3}>
                                        Delete
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>
                </>
            )}
        </>
    );
};

export default Dashboard;
