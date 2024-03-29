import { Table, Thead, Tr, Th, Tbody, Td, Center, Spinner, Flex } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ProjectObject } from '../../models/project';
import ProjectRow from './ProjectRow';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../hooks/useGlobalStore';

interface ProjectListTableProps {
    projects: ProjectObject[];
    removeProject: (project: ProjectObject) => void;
}

const ProjectListTable: React.FC<ProjectListTableProps> = ({ projects, removeProject }) => {
    const { currentUser } = useAuth();
    const { status, loading } = useStore()

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


    }, [projects])

    return (
        <>
            {!loading ? <>
                {urgentProjects.length ?
                    <Table variant='simple' mt='5'>
                        <Thead>
                            <Tr>
                                <Th px={1} pl={'15px'}>Request</Th>
                                <Th px={1} textAlign={'center'}>Project</Th>
                                <Th px={1} textAlign={'center'}>Service</Th>
                                <Th px={1} textAlign={'center'}>Source</Th>
                                <Th px={1} textAlign={'center'}>Target</Th>
                                <Th px={1} textAlign={'center'}>TimeLine</Th>
                                <Th px={1} textAlign={'center'}>Status</Th>
                                {currentUser?.role === 'admin' || (status === 'Quoted' && !loading) ? <>
                                    <Th px={1} textAlign={'right'}>Count</Th>
                                    <Th px={1} textAlign={'right'}>Cost</Th>
                                </> : null}
                                <Th maxW={20}></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {urgentProjects.map((project: ProjectObject) => (
                                <ProjectRow key={project.id} project={project} removeProject={removeProject} />
                            ))}
                        </Tbody>
                    </Table >
                    : null}
                {commonProjects.length ?
                    <Table variant='simple' mt='5'>
                        <Thead>
                            <Tr>
                                <Th px={1} pl={'15px'}>Request</Th>
                                <Th px={1} textAlign={'center'}>Project</Th>
                                <Th px={1} textAlign={'center'}>Service</Th>
                                <Th px={1} textAlign={'center'}>Source</Th>
                                <Th px={1} textAlign={'center'}>Target</Th>
                                <Th px={1} textAlign={'center'}>TimeLine</Th>
                                <Th px={1} textAlign={'center'}>Status</Th>
                                {currentUser?.role === 'admin' || (status === 'Quoted' && !loading) ? <>
                                    <Th px={1} textAlign={'right'}>Count</Th>
                                    <Th px={1} textAlign={'right'}>Cost</Th>
                                </> : null}
                                <Th maxW={20}></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {commonProjects.map((project: ProjectObject) => (
                                <ProjectRow key={project.id} project={project} removeProject={removeProject} />
                            ))}
                            {projects.length === 0 ? <Tr><Td colSpan={6}>
                                <Center>No projects found</Center>
                            </Td></Tr> : null}
                        </Tbody>
                    </Table >
                    : null}</>: 
                    <Flex h={'500px'} justifyContent={'center'} alignItems={'center'}><Spinner size='xl' /></Flex>}

        </>
    );
};

export default ProjectListTable;
