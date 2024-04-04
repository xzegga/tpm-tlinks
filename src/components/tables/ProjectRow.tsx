import React from 'react';

import { Tr, Td, Flex, Badge, Link, Text, IconButton, LinkBox, Tooltip, FormControl, Input, Box, Spinner } from '@chakra-ui/react';
import { Timestamp } from 'firebase/firestore';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

import { shortenName, transfromTimestamp } from '../../utils/helpers';
import Flag from '../Flag';
import Status from '../Status';
import { ProjectObject } from '../../models/project';
import { AiOutlineStar } from 'react-icons/ai';
import Urgent from '../../assets/isUrgent.svg?react';
import { useAuth } from '../../context/AuthContext';
import useProjectExtras from '../../hooks/useProjectExtras';
import { useStore } from '../../hooks/useGlobalStore';
import { ROLES } from '../../models/users';
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
    const { currentUser } = useStore();

    const { status, loading: projectLoading } = useStore()

    const {
        loading,
        billed,
        setBilled,
        wordCount,
        setWordCount,
        dbHandleBilledChange,
        dbHandleWordCountChange
    } = useProjectExtras(project);

    return (

        <Tr cursor={'pointer'} _hover={{ bg: 'gray.100' }} style={project.data.status === 'Archived' ? stripped : {}}>
            <LinkBox
                as={Td}
                onClick={() => {
                    navigate(`project/${project.id}`);
                }}
                py={1.5} px={1.5}
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
                py={1.5} px={1.5}
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
                py={1.5} px={1.5}
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
                py={1.5} px={1.5}
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
                py={1.5} px={1.5}
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
                py={1.5} px={1.5}
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
                py={1.5} px={1.5}
                onClick={() => {
                    navigate(`project/${project.id}`);
                }}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                {project.data.status && <Status status={project.data.status} />}
            </LinkBox>
            {currentUser?.role === ROLES.Admin ? <>
                <Td px={1.5} py={0.5}>
                    <FormControl id="wordCount_number">
                        <Input
                            name="wordCount"
                            id="wordCount"
                            value={wordCount}
                            onChange={(e) => {
                                dbHandleWordCountChange(e);
                                setWordCount(Number(e.target.value));
                            }}
                            borderColor="gray.300"
                            _hover={{
                                borderRadius: 'gray.300'
                            }}
                            textAlign={'right'}
                            fontSize={'xs'}
                            px={1.5} py={1}
                            w={'60px'}
                            h={'30px'}
                        />
                    </FormControl>
                </Td>
                <Td px={1.5} py={0.5}>
                    <FormControl id="billed_amount">
                        <Input
                            name="billed"
                            id="billed"
                            value={billed}
                            onChange={(e) => {
                                dbHandleBilledChange(e);
                                setBilled(parseFloat(e.target.value));
                            }}
                            borderColor="gray.300"
                            _hover={{
                                borderRadius: 'gray.300'
                            }}
                            textAlign={'right'}
                            fontSize={'xs'}
                            px={1.5} py={1}
                            w={'60px'}
                            h={'30px'}
                            type="number"
                        />
                    </FormControl>
                </Td>
            </> : <>
                {status === 'Quoted' && !projectLoading ?
                    <>
                        <LinkBox
                            py={1.5} px={1.5}
                            as={Td}
                            onClick={() => {
                                navigate(`project/${project.id}`);
                            }}
                            cursor={'pointer'}
                            style={{ whiteSpace: 'nowrap' }}
                            _hover={{ bg: 'gray.100' }}
                            fontSize={'sm'}
                            textAlign={'left'}
                        >
                            {project.data.wordCount}
                        </LinkBox>
                        <LinkBox
                            p={1}
                            as={Td}
                            onClick={() => {
                                navigate(`project/${project.id}`);
                            }}
                            cursor={'pointer'}
                            style={{ whiteSpace: 'nowrap' }}
                            _hover={{ bg: 'gray.100' }}
                            textAlign={'right'}
                            fontSize={'sm'}
                        >
                            <Flex justifyContent={'space-between'}>
                                <Text>$ </Text>
                                <Text>{project.data.billed}</Text>
                            </Flex>
                        </LinkBox>
                    </> :
                    null
                }
            </>
            }

            <Td maxW={15} p={0}>
                <Flex>
                    {loading?.wordCount || loading?.billed ? <Flex>
                        <Spinner size='xs' color="orange.500" />
                        <Text ml={1} color={'orange.500'}>Saving</Text></Flex> :
                        <Box maxW={'30%'} w={'30%'}>
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
                        </Box>
                    }
                </Flex>
            </Td>
        </Tr>

    );
};

export default ProjectRow;
