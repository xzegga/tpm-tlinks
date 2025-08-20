import React, { useEffect, useState } from 'react';

import { Box, Center, Flex, Spinner, Table, Tbody, Td, Th, Thead, Tr, useToast } from '@chakra-ui/react';

import { useStore } from '../../hooks/useGlobalStore';
import { ProjectObject } from '../../models/project';
import { ROLES } from '../../models/users';
import ProjectRow from './ProjectRow';
import { useAuth } from '../../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface ProjectListTableProps {
    projects: ProjectObject[];
    removeProject: (project: ProjectObject) => void;
}

const ProjectListTable: React.FC<ProjectListTableProps> = ({ projects, removeProject }) => {
    const { currentUser } = useStore();
    const { status, loading, loadingMore } = useStore()
    const { validate } = useAuth();
    const { setState } = useStore()
    const [translators, setTranslators] = useState([]);
    const toast = useToast();

    const [urgentProjects, setUrgentProjects] = useState<ProjectObject[]>([]);
    const [commonProjects, setCommonProjects] = useState<ProjectObject[]>([]);

    useEffect(() => {
        setUrgentProjects(
            projects.filter((prj) => prj.data.isUrgent === true && !['Archived'].includes(prj.data.status))
        );
        setCommonProjects(
            [...projects.filter((prj) => !prj.data.isUrgent),
            ...projects.filter((prj) => prj.data.isUrgent === true && ['Archived'].includes(prj.data.status))]
        )
        getTranslatorUsers();


    }, [projects])

    const getTranslatorUsers = async () => {
        try {
            if (currentUser) {
                await validate();
                setState({ loading: true, loadingMore: true });
                const functions = getFunctions();
                const getTranslators = httpsCallable(functions, 'getTranslatorUsers');
                if (currentUser.role !== ROLES.Translator) {
                    const usersData: any = await getTranslators({
                        tenant: currentUser.tenant,
                        department: currentUser.department,
                        role: ROLES.Translator,
                        token: currentUser.token
                    });

                    setTranslators(usersData?.data || []);
                }
                setState({ loading: false, loadingMore: false });
            }

        } catch (error) {
            // Handle error
            setTranslators([]);
            setState({ loading: false, loadingMore: false });
        }
    };

    return (
        <Box position={'relative'}>
            {!loading || loadingMore ? <>
                {loadingMore && <Flex
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
                {urgentProjects.length ?
                    <Table variant='simple' mt='5'>
                        <Thead>
                            <Tr>
                                <Th px={0} pl={'15px'}></Th>
                                <Th px={1} pl={'15px'}>Request</Th>
                                <Th px={1} textAlign={'center'}>Project</Th>
                                <Th px={1} textAlign={'center'}>Service</Th>
                                <Th px={1} textAlign={'center'}>Source</Th>
                                <Th px={1} textAlign={'center'}>Target</Th>
                                <Th px={1} textAlign={'center'}>TimeLine</Th>
                                <Th px={1} textAlign={'center'}>Status</Th>
                                {currentUser.role !== ROLES.Translator && <Th px={1} textAlign={'center'}>Translator</Th>}
                                {currentUser?.role === ROLES.Admin || (status === 'Quoted' && !loading) ? <>
                                    <Th px={1} textAlign={'right'}>Count</Th>
                                    <Th px={1} textAlign={'right'}>Cost</Th>
                                </> : null}
                                <Th maxW={20}></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {urgentProjects.map((project: ProjectObject) => (
                                <ProjectRow key={project.id}
                                    project={project}
                                    removeProject={removeProject}
                                    translators={translators} />
                            ))}
                        </Tbody>
                    </Table >
                    : null}
                {commonProjects.length ?
                    <Table variant='simple' mt='5'>
                        <Thead>
                            <Tr>
                                <Th px={0} pl={'15px'}></Th>
                                <Th px={1} pl={'15px'}>Request</Th>
                                <Th px={1} textAlign={'center'}>Project</Th>
                                <Th px={1} textAlign={'center'}>Service</Th>
                                <Th px={1} textAlign={'center'}>Source</Th>
                                <Th px={1} textAlign={'center'}>Target</Th>
                                <Th px={1} textAlign={'center'}>TimeLine</Th>
                                <Th px={1} textAlign={'center'}>Status</Th>
                                {currentUser.role !== ROLES.Translator && <Th px={1} textAlign={'center'}>Translator</Th>}
                                {currentUser?.role === ROLES.Admin || (status === 'Quoted' && !loading) ? <>
                                    <Th px={1} textAlign={'right'}>Count</Th>
                                    <Th px={1} textAlign={'right'}>Cost</Th>
                                </> : null}
                                <Th maxW={20}></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {commonProjects.map((project: ProjectObject) => (
                                <ProjectRow
                                    key={project.id}
                                    project={project}
                                    removeProject={removeProject}
                                    translators={translators} />
                            ))}
                            {projects.length === 0 ?
                                <Tr>
                                    <Td colSpan={6}>
                                        <Center>No projects found</Center>
                                    </Td>
                                </Tr> : null}
                        </Tbody>
                    </Table >
                    : null}
            </> :
                <Flex h={'500px'} justifyContent={'center'} alignItems={'center'}><Spinner size='xl' /></Flex>
            }

        </Box>
    );
};

export default ProjectListTable;
