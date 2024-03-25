import { Table, Thead, Tr, Th, Tbody, Td, Center, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ProjectObject } from '../../models/project';
import ProjectRow from './ProjectRow';

interface ProjectListTableProps {
    projects: ProjectObject[];
    removeProject: (project: ProjectObject) => void;
}

const ProjectListTable: React.FC<ProjectListTableProps> = ({ projects, removeProject }) => {

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
            {urgentProjects.length ?
                <Table variant='simple' mt='5'>
                    <Thead>
                        <Tr>
                            <Th paddingLeft={'15px'}>Request</Th>
                            <Th>Project</Th>
                            <Th>Service</Th>
                            <Th>Source</Th>
                            <Th>Target</Th>
                            <Th>TimeLine</Th>
                            <Th>Status</Th>
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
                            <Th paddingLeft={'15px'}>Request</Th>
                            <Th>Project</Th>
                            <Th>Service</Th>
                            <Th>Source</Th>
                            <Th>Target</Th>
                            <Th>TimeLine</Th>
                            <Th>Status</Th>
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
                : null}
        </>
    );
};

export default ProjectListTable;
