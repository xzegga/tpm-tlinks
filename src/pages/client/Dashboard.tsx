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
    Tag,
    TagLabel,
    Text
} from '@chakra-ui/react';
import {
    query, collection, onSnapshot, limit, DocumentData, QueryDocumentSnapshot,
    startAfter, orderBy, where, Timestamp, QueryFieldFilterConstraint, getCountFromServer
} from 'firebase/firestore';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NavLnk from '../../components/NavLnk';
import ProjectListTable from '../../components/tables/ProjectListTable';
import { useAuth } from '../../context/AuthContext';

import { db } from '../../utils/init-firebase';
import { allStatuses, statuses, monthNames, defaultStatuses, billingStatuses } from '../../utils/value-objects';

import { lastDayOfMonth, endOfDay } from 'date-fns';
import { generateYears } from '../../utils/helpers';
import { deleteProject } from '../../data/Projects';
import { ProjectObject, Project } from '../../models/project';
import { AiOutlineFileExcel } from 'react-icons/ai';
import { exportToExcel } from '../../utils/export';
import useProjectExtras from '../../hooks/useProjectExtras';
import { useStore } from '../../hooks/useGlobalStore';

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const { pagination, status, monthSelected, yearSelected, setState } = useStore((state) => (
        {
            pagination: state.pagination,
            status: state.status,
            monthSelected: state.monthSelected,
            yearSelected: state.yearSelected,
            loading: state.loading,
            setState: state.setState
        }
    ))

    const [projects, setProjects] = React.useState<ProjectObject[]>([]);
    const [lastDoc, setLastDoc] = React.useState<QueryDocumentSnapshot<DocumentData>>();
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
    const { debounce } = useProjectExtras(project);

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
        setState({ status: e.target.value });
    };

    const handleFilterDate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLastDoc(undefined);
        setState({ monthSelected: Number(e.target.value) })
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

        setState({loading: true});
        if (currentUser) {
            // Where Status
            let wereStatus;

            switch (status) {
                case 'All':
                    wereStatus = where('status', 'in', statuses);
                    break;
                case 'Active':
                    wereStatus = where('status', 'in', defaultStatuses);
                    break;
                case 'Billing':
                    wereStatus = where('status', 'in', billingStatuses);
                    break;
                case 'Quoted':
                    wereStatus = where('billed', '>', 0);
                    break;
                default:
                    wereStatus = where('status', '==', status);
            }
            // Where Month

            const startOfMonth = monthSelected >= 0 ? new Date(yearSelected, monthSelected, 1) : new Date(yearSelected, 0, 1);

            const endOfMonth = monthSelected >= 0 && startOfMonth ? endOfDay(lastDayOfMonth(startOfMonth)) : new Date(yearSelected, 11, 31);

            const wereStart = where('created', '>=', Timestamp.fromDate(startOfMonth));
            const wereEnds = where('created', '<=', Timestamp.fromDate(endOfMonth));
            const wereRequest = requestdb !== '' ? where('requestNumber', '==', requestdb) : null;

            const countQuery = query(collection(db, "projects"), wereStatus, wereStart, wereEnds, orderBy('created', 'desc'));
            const snapshot = await getCountFromServer(countQuery);

            setWereStatement({
                wereStatus,
                wereStart,
                wereEnds,
                wereRequest,
                count: snapshot.data().count
            });
            if(snapshot.data().count === 0 ) setState({loading: false});
        }
    }


    const queryProjects = (lastDoc: QueryDocumentSnapshot<DocumentData> | undefined, newQuery = false) => {
        if (currentUser && wereStatement) {
            const {
                wereStatus,
                wereStart,
                wereEnds,
                wereRequest,
                count
            } = wereStatement;

            if (count === 0) {
                setProjects([] as ProjectObject[]);
                return;
            }
            if (count > 0) {
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
                        setState({loading: false});
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
                        setState({loading: false});
                        unsubscribe();
                    });
                }

            }

        }
    };

    function exportToExcelFn(): void {
        const headers = [['Request No', 'Project', 'Source Language', 'Target Language', 'Word Count', 'Total']];
        const dataArray = projects.map((item) => (
            [
                item.data.requestNumber,
                item.data.projectId,
                item.data.sourceLanguage,
                item.data.targetLanguage,
                item.data.wordCount || 0,
                item.data.billed || 0
            ]
        ));
        const data = [...headers, ...dataArray];

        const fileName = `tpm-${months[monthSelected]}-${yearSelected}.xlsx`;
        exportToExcel(data, fileName)
    }

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
                                                onChange={(e) => setState({ yearSelected: Number(e.target.value) })}
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
                                                {currentUser.role === 'admin' ?
                                                    <option value={'Billing'}>
                                                        Billing
                                                    </option> : null
                                                }
                                            </Select>
                                        </Flex>
                                    </FormControl>
                                    <FormControl id="page_size" ml={3}>
                                        <Flex alignItems={'center'} justifyContent={'start'}>
                                            <FormLabel my={0}>Page</FormLabel>
                                            <Select w={'70px'} ml={1} name={'page'} id={'page'}
                                                value={pagination} onChange={(e) => setState({ pagination: e.target.value })}>
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
                            <Flex gap={4} pt={5} pl={0} alignItems={'center'}>
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
                                {currentUser.role === 'admin' ?
                                    <Flex flex={1} alignContent={'flex-end'}>
                                        <Button
                                            size={'xs'}
                                            ml={'auto'}
                                            color={'green.500'}
                                            leftIcon={<AiOutlineFileExcel />}
                                            onClick={exportToExcelFn}
                                        >Export to Excel</Button>
                                    </Flex>
                                    : null}

                            </Flex>
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
