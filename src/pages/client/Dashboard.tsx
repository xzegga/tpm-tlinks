import { getFunctions, httpsCallable } from 'firebase/functions';
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineFileExcel } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

import {
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
    AlertDialogOverlay, Box, Button, Center, Container, Flex, FormControl, FormLabel, Heading,
    Input, Link, Select, Spacer, Tag, TagLabel, Text, useToast
} from '@chakra-ui/react';

import NavLnk from '../../components/NavLnk';
import ProjectListTable from '../../components/tables/ProjectListTable';
import TenantDropdown from '../../components/TenantDropdown';
import { deleteProject } from '../../data/Projects';
import { useStore } from '../../hooks/useGlobalStore';
import useProjectExtras from '../../hooks/useProjectExtras';
import { ProjectObject } from '../../models/project';
import { ROLES } from '../../models/users';
import { exportToExcel } from '../../utils/export';
import { generateYears } from '../../utils/helpers';
import { allStatuses, monthNames } from '../../utils/value-objects';
import { useAuth } from '../../context/AuthContext';
import ChangeStatusSelector from '../../components/ChangeStatus';

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const cancelRef = useRef(null);
    const { validate } = useAuth();
    const {
        tenant,
        currentUser,
        pagination,
        status,
        monthSelected,
        yearSelected,
        tenantQuery,
        selectedIds,
        refresh,
        setState } = useStore()

    const [projects, setProjects] = useState<ProjectObject[]>([]);
    const [project, setProject] = useState<ProjectObject>();
    const { debounce } = useProjectExtras(project);

    const [lastDoc, setLastDoc] = useState<string>();
    const [request, setRequest] = useState<string>('');
    const [requestdb, setRequestdb] = useState<string>('');
    const [count, setCount] = useState<number>()
    const [isOpen, setIsOpen] = useState(false);

    const onClose = () => setIsOpen(false);

    const fetchMore = () => {
        getProjectQuery(false);
    };

    const removeProject = (project: ProjectObject) => {
        setProject(project);
        setIsOpen(true);
    };

    const handleDeleteProject = async () => {
        if (currentUser && project) {
            await validate();
            deleteProject(project.id);

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

    const handleFilter = (e: ChangeEvent<HTMLSelectElement>) => {
        setLastDoc(undefined);
        setState({ status: e.target.value });
    };

    const handleFilterDate = (e: ChangeEvent<HTMLSelectElement>) => {
        setLastDoc(undefined);
        setState({ monthSelected: Number(e.target.value) })
    };

    useEffect(() => {
        getProjectQuery(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthSelected, yearSelected, status, requestdb, pagination, tenantQuery]);

    useEffect(() => {
        if (refresh === true) {
            setState({ refresh: false });
            getProjectQuery(true);
        }
    }, [refresh])

    const setRequestDb = (req: string) => {
        setRequestdb(req);
    }

    const getProjectQuery = async (
        newQuery: boolean = false
    ) => {
        try {
            if (currentUser) {
                await validate();
                setState({ loading: true, loadingMore: true });
                const functions = getFunctions();
                const getAllProjets = httpsCallable(functions, 'getProjects');

                let tenant = null;
                if (currentUser.role === ROLES.Admin) {
                    tenant = tenantQuery && tenantQuery !== '' ? tenantQuery : currentUser.tenant;
                }

                const projectData: any = await getAllProjets({
                    status,
                    monthSelected,
                    yearSelected,
                    requestdb,
                    lastDoc,
                    newQuery,
                    pagination,
                    token: currentUser.token,
                    tenant,
                });

                if (newQuery) {
                    setProjects(projectData?.data?.projects || []);
                } else {
                    setProjects([
                        ...projects,
                        ...projectData?.data?.projects || []
                    ]);
                }

                setLastDoc(projectData?.data.lastDoc || null);
                setCount(projectData?.data?.count);
                setState({ loading: false, loadingMore: false });
            }

        } catch (error) {
            // Handle error
            toast({
                title: 'Error getting projects',
                description: 'There is an error getting the project list',
                status: 'error',
                duration: 9000,
                isClosable: true
            });
            setState({ loading: false, loadingMore: false });
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

    const handleRole = async (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setState({ tenantQuery: value })
    }

    const debouncedHandleRequestChange = useMemo(() => debounce(setRequestDb, 300), []);

    const onChangeStatusSuccess = (st: string) => {
        const newProjectStatuses = projects.map((item) => (
            {
                ...item,
                data: {
                    ...item.data,
                    ...(selectedIds.includes(item.id) && { status: st }),
                }
            }
        ));
        setProjects(newProjectStatuses);
        setState({ selectedIds: [], status: st })
    }

    return (
        <>
            {currentUser && (
                <>
                    <Container maxW="container.lg" w={'container.lg'} overflowX="auto" py={4}>
                        <Flex mb="1" alignItems={'center'}>
                            <Heading size="md" whiteSpace={'nowrap'} pl={3}>
                                <Flex alignItems={'center'} gap={3}>
                                    <Text>Project List</Text>
                                    {currentUser.role === 'admin' || tenant.export &&
                                        <TenantDropdown
                                            value={tenantQuery || currentUser.tenant}
                                            select={'all'}
                                            handleChange={handleRole} />
                                    }
                                </Flex>
                            </Heading>
                            <Spacer />
                            {currentUser.role === ROLES.Admin && (
                                <Flex>

                                    <Link onClick={() => navigate('users', { replace: true })} colorScheme={'blue.700'} mr={5}>
                                        Manage Users
                                    </Link>
                                    <Link onClick={() => navigate('clients', { replace: true })} colorScheme={'blue.700'} mr={5}>
                                        Manage Clients
                                    </Link>
                                </Flex>
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
                                                {currentUser.role === ROLES.Admin ?
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
                                {currentUser.role === ROLES.Admin ?
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
                        {currentUser.role === ROLES.Admin && selectedIds?.length ?
                            <Box borderTop={1} borderTopColor={'black'} bgColor={'yellow.50'}
                                color={'black'} overflow={'hidden'} mt={4}>
                                <Flex alignItems={'center'} gap={3} py={2} px={4}
                                >
                                    <Text>Change Status</Text>
                                    <ChangeStatusSelector ids={selectedIds} onSuccess={onChangeStatusSuccess} />
                                </Flex>
                            </Box>
                            : null}
                        <Box>
                            <ProjectListTable
                                projects={projects}
                                removeProject={removeProject} />
                            <Spacer mt={10} />
                            <Center>
                                Showing {projects.length} of {count ? count : 0} projects
                            </Center>
                            <Center>
                                {count && count > projects.length && (
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
