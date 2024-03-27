import React from 'react';

import { Tr, Td, Flex, Badge, Link, Text, IconButton, LinkBox, Tooltip } from '@chakra-ui/react';
import { Timestamp } from 'firebase/firestore';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

import { shortenName, transfromTimestamp } from '../../utils/helpers';
import Flag from '../Flag';
import Status from '../Status';
import { ProjectObject } from '../../models/project';
import { AiOutlineStar } from 'react-icons/ai';
import Urgent from '../../assets/isUrgent.svg?react';
interface ProjectRowProps {
    project: ProjectObject;
    removeProject: (project: ProjectObject) => void;
}

const stripped = {
    backgroundImage: 'linear-gradient(130deg, #faf9f0 44.44%, #fffceb 44.44%, #fffceb 50%, #faf9f0 50%, #faf9f0 94.44%, #fffceb 94.44%, #fffceb 100%)',
    backgroundSize: '58.74px 70.01px'
};

const ProjectRow: React.FC<ProjectRowProps> = ({ project, removeProject }) => {
    const navigate = useNavigate();

    return (

        <Tr cursor={'pointer'} _hover={{ bg: 'gray.100' }} style={project.data.status === 'Archived' ? stripped : {}}>
            <LinkBox
                as={Td}
                onClick={() => {
                    navigate(`project/${project.id}`);
                }}
                p={2}
                pl={4}
                maxW={65}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                <Flex alignItems={'center'}>
                    <Text whiteSpace={'nowrap'} maxW={65} marginRight={0}>
                        <Tooltip label={project?.data.requestNumber.toString()} aria-label="A tooltip">
                            <span style={{ minWidth: '34px' }}>{shortenName(project?.data.requestNumber.toString(), 5)}</span>
                        </Tooltip>
                    </Text>
                    {project?.data?.isUrgent ?
                        <Urgent className="isUrgent" style={{ marginBottom: '5px' }} />
                        : null}
                </Flex>
            </LinkBox>
            <LinkBox
                as={Td}
                p={2}
                onClick={() => {
                    navigate(`project/${project.id}`);
                }}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                <Link color={'blue.400'}>
                    <Text whiteSpace={'nowrap'}>{project?.data?.projectId}</Text>
                </Link>
            </LinkBox>
            <LinkBox
                as={Td}
                p={2}
                onClick={() => {
                    navigate(`project/${project.id}`);
                }}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                <Flex alignItems={'center'}>
                    {project?.data?.isTranslation && (
                        <Badge mr={3} px={2} colorScheme="gray">
                            T
                        </Badge>
                    )}
                    {project?.data?.isEditing && (
                        <Badge mr={3} colorScheme="purple" px={2}>
                            E
                        </Badge>
                    )}
                    {project?.data?.isCertificate && (
                        <Badge colorScheme="blue" px={2}>
                            C
                        </Badge>
                    )}
                </Flex>
            </LinkBox>
            <LinkBox
                as={Td}
                p={2}
                onClick={() => {
                    navigate(`project/${project.id}`);
                }}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                <Flex alignItems={'center'}>
                    <Flag name={project?.data?.sourceLanguage} />
                    {project?.data?.sourceLanguage}
                </Flex>
            </LinkBox>
            <LinkBox
                p={2}
                as={Td}
                onClick={() => {
                    navigate(`project/${project.id}`);
                }}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                <Flex alignItems={'center'}>
                    {project.data.targetLanguage !== 'Multilingual' ? (
                        <Flag name={project?.data?.targetLanguage} />
                    ) : (
                        <Text mr={2} color={'orange'}>
                            <AiOutlineStar fontSize={18} />
                        </Text>
                    )}
                    {project?.data?.targetLanguage}
                </Flex>
            </LinkBox>
            <LinkBox
                p={2}
                as={Td}
                onClick={() => {
                    navigate(`project/${project.id}`);
                }}
                cursor={'pointer'}
                style={{ whiteSpace: 'nowrap' }}
                _hover={{ bg: 'gray.100' }}
            >
                {project.data.created && transfromTimestamp(project.data.timeLine as Timestamp)}
            </LinkBox>
            <LinkBox
                as={Td}
                p={2}
                onClick={() => {
                    navigate(`project/${project.id}`);
                }}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                {project.data.status && <Status status={project.data.status} />}
            </LinkBox>
            <Td maxW={20} p={0}>
                <IconButton
                    variant="ghost"
                    height={10}
                    icon={<RiDeleteBin6Line color={'#f84141'} />}
                    aria-label="toggle-dark-mode"
                    onClick={() => {
                        removeProject(project);
                    }}
                    disabled={project.data.status !== 'Received'}
                />
            </Td>
        </Tr>

    );
};

export default ProjectRow;
