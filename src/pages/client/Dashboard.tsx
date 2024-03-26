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
    Select,
    Input,
    HStack,
    Tag,
    TagLabel,
    Text
} from '@chakra-ui/react';
import { query, collection, onSnapshot, limit, DocumentData, QueryDocumentSnapshot, startAfter, orderBy, where, Timestamp, QueryFieldFilterConstraint } from 'firebase/firestore';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NavLnk from '../../components/NavLnk';
import ProjectListTable from '../../components/tables/ProjectListTable';
import { useAuth } from '../../context/AuthContext';

import { db } from '../../utils/init-firebase';
import { allStatuses, statuses, monthNames, defaultStatuses } from '../../utils/value-objects';

import { lastDayOfMonth, endOfDay } from 'date-fns';
import { generateYears } from '../../utils/helpers';
import { deleteProject } from '../../data/Projects';
import { ProjectObject, Project } from '../../models/project';
import { debounce } from '../../components/tables/ProjectDetailTable';

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [projects, setProjects] = React.useState<ProjectObject[]>([]);
    const [lastDoc, setLastDoc] = React.useState<QueryDocumentSnapshot<DocumentData>>();
    const [pagination, setPagination] = React.useState<string>('20');
    const [status, setStatus] = React.useState<string>('Active');

    const [monthSelected, setMonthSelected] = React.useState<number>(new Date().getMonth());
    const [yearSelected, setYearSelected] = React.useState<number>(new Date().getFullYear());
    const [request, setRequest] = React.useState<string>('');
    const [requestdb, setRequestdb] = React.useState<string>('');
    const [wereStatement, setWereStatement] = React.useState<{
        wereStatus: QueryFieldFilterConstraint,
        wereStart: QueryFieldFilterConstraint,
        wereEnds: QueryFieldFilterConstraint,
        wereRequest: QueryFieldFilterConstraint | null,
        count: number,
    }>();

    const toast = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const onClose = () => setIsOpen(false);
    const cancelRef = React.useRef(null);
    const [project, setProject] = React.useState<ProjectObject>();

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wereStatement]);

    useEffect(() => {
        createWhere();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthSelected, yearSelected, status, requestdb, pagination]);

    const setRequestDb = (req: string) => {
        setRequestdb(req);
    }

    const debouncedHandleRequestChange = useMemo(() => debounce(setRequestDb, 300), []);

    const createWhere = async () => {
        if (currentUser) {
            // Where Status
            const wereStatus = status == 'All' ? where('status', 'in', statuses) :
                status === 'Active' ? where('status', 'in', defaultStatuses) : where('status', '==', status);

            // Where Month

            const startOfMonth = monthSelected >= 0 ? new Date(yearSelected, monthSelected, 1) : new Date(yearSelected, 0, 1);

            const endOfMonth = monthSelected >= 0 && startOfMonth ? endOfDay(lastDayOfMonth(startOfMonth)) : new Date(yearSelected, 11, 31);

            const wereStart = where('created', '>=', Timestamp.fromDate(startOfMonth));
            const wereEnds = where('created', '<=', Timestamp.fromDate(endOfMonth));
            const wereRequest = requestdb !== '' ? where('requestNumber', '==', requestdb) : null;

            const countQuery = query(collection(db, "projects"), wereStart, wereEnds, wereStatus, orderBy('created', 'desc'));

            await countQuery.count().get();
            const unsubscribe = onSnapshot(countQuery, (querySnapshot) => {
                setWereStatement({
                    wereStatus,
                    wereStart,
                    wereEnds,
                    wereRequest,
                    count: querySnapshot.docs.length
                });
                unsubscribe();
            });
        }
    }


    const queryProjects = (lastDoc: QueryDocumentSnapshot<DocumentData> | undefined, newQuery = false) => {
        if (currentUser && wereStatement) {
            const {
                wereStatus,
                wereStart,
                wereEnds,
                wereRequest,
                count = 10
            } = wereStatement;

            const paging = pagination !== 'All' ? Number(pagination) : count;

            if (lastDoc && !newQuery && paging) {
                const queryWithLast = !wereRequest ? query(
                    collection(db, 'projects'),
                    limit(paging),
                    wereStatus,
                    wereStart,
                    wereEnds,
                    orderBy('created', 'desc'),
                    startAfter(lastDoc)
                ) : query(
                    collection(db, 'projects'),
                    wereRequest,
                    limit(paging),
                    orderBy('created', 'desc'),
                );

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
                const queryFist = !wereRequest ? query(
                    collection(db, 'projects'),
                    wereStatus,
                    wereStart,
                    wereEnds,
                    orderBy('created', 'desc'),
                    limit(paging)) :
                    query(
                        collection(db, 'projects'),
                        wereRequest,
                        limit(paging),
                        orderBy('created', 'desc')
                    );

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
                    <Container maxW="container.lg" w={'container.lg'} overflowX="auto" py={4}>
                        <Flex mb="1" alignItems={'center'}>
                            <Heading size="md" whiteSpace={'nowrap'} pl={3}>
                                Project List
                            </Heading>
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
                            <Box>
                                <Flex>
                                    <FormControl id="requestNumber" ml={2}>
                                        <Flex alignItems={'center'} justifyContent={'start'}>
                                            <FormLabel my={0}>Request</FormLabel>
                                            <Input w={75}
                                                value={request}
                                                type='text'
                                                onChange={(e) => {
                                                    debouncedHandleRequestChange(e.target.value);
                                                    setRequest(e.target.value)
                                                }}></Input>
                                        </Flex>
                                    </FormControl>
                                    <FormControl id="year_selection" ml={3}>
                                        <Flex alignItems={'center'} justifyContent={'start'}>
                                            <FormLabel my={0}>Year</FormLabel>
                                            <Select
                                                w={90}
                                                ml={1}
                                                name={'yearSelected'}
                                                id={'yearSelected'}
                                                value={yearSelected}
                                                onChange={(e) => setYearSelected(Number(e.target.value))}
                                            >
                                                {generateYears().map((s, index) => (
                                                    <option key={index} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Flex>
                                    </FormControl>
                                    <FormControl id="month_selection" ml={3}>
                                        <Flex alignItems={'center'} justifyContent={'start'}>
                                            <FormLabel my={0}>Month</FormLabel>
                                            <Select minW={140} ml={1} name={'monthSelected'} id={'monthSelected'} value={monthSelected} onChange={handleFilterDate}>
                                                {/* <option value={-1}>All</option> */}
                                                {monthNames.map((s, index) => (
                                                    <option key={index} value={s.value}>
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Flex>
                                    </FormControl>
                                    <FormControl id="language_requested" ml={3}>
                                        <Flex alignItems={'center'} justifyContent={'start'}>
                                            <FormLabel my={0}>Status</FormLabel>
                                            <Select minW={140} ml={1} name={'status'} id={'status'} value={status} onChange={handleFilter}>
                                                {allStatuses.map((s: string, index) => (
                                                    <option key={index} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Flex>
                                    </FormControl>
                                    <FormControl id="page_size" ml={3}>
                                        <Flex alignItems={'center'} justifyContent={'start'}>
                                            <FormLabel my={0}>Page</FormLabel>
                                            <Select w={'70px'} ml={1} name={'page'} id={'page'}
                                                value={pagination} onChange={(e) => setPagination(e.target.value)}>
                                                {['All', '10', '20', '50'].map((s: string, index) =>
                                                    <option key={index} value={s}>
                                                        {s}
                                                    </option>
                                                )}
                                            </Select>
                                        </Flex>
                                    </FormControl>
                                </Flex>
                            </Box>
                        </Box>
                        <Box>
                            <HStack spacing={4} pt={4} pl={3}>
                                {[
                                    { Request: requestdb },
                                    { Year: yearSelected },
                                    { Month: monthSelected },
                                    { Status: status }
                                ].map((obj, index) => (
                                    <Box key={index}>
                                        {
                                            Object.keys(obj)[0] === 'Request' && Object.values(obj)[0] !== '' ?
                                                <Flex gap={3}>
                                                    <Tag size={'sm'} key={index} variant='outline' colorScheme='blue'>
                                                        <TagLabel>{Object.keys(obj)[0]}: {Object.values(obj)[0]}</TagLabel>
                                                    </Tag>
                                                    <Text fontSize={'xs'}>Ignored Filters:</Text>
                                                </Flex> :
                                                <>{
                                                    !['', -1,].includes(Object.values(obj)[0]) ?
                                                        <Tag size={'sm'} key={index} variant='outline' colorScheme='blue'>
                                                            <TagLabel>
                                                                {Object.keys(obj)[0]}: {
                                                                    Object.keys(obj)[0] === 'Month' ?
                                                                        months[Object.values(obj)[0]] : Object.values(obj)[0]
                                                                }
                                                            </TagLabel>
                                                        </Tag> : null
                                                }</>
                                        }

                                    </Box>
                                ))}
                            </HStack>
                        </Box>
                        <Box>
                            <ProjectListTable projects={projects} removeProject={removeProject} />
                            <Spacer mt={10} />
                            <Center>
                                Showing {projects.length} of {wereStatement?.count} projects
                            </Center>
                            <Center>
                                {wereStatement?.count && wereStatement?.count > projects.length && (
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
