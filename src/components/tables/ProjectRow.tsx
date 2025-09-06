import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { AiOutlineStar } from 'react-icons/ai';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

import {
    Badge, Box, Checkbox, Flex, FormControl, IconButton, Input, Link, LinkBox, Spinner, Td, Text, Tooltip, Tr,
    useToast, Select,
    TagLabel, Tag,
    TagCloseButton
} from '@chakra-ui/react';


import Urgent from '../../assets/isUrgent.svg?react';
import { useStore } from '../../hooks/useGlobalStore';
import useProjectExtras from '../../hooks/useProjectExtras';
import { ProjectObject } from '../../models/project';
import { ROLES } from '../../models/users';
import { shortenFileName, shortenName, transfromTimestamp } from '../../utils/helpers';
import Flag from '../Flag';
import Status from '../Status';
import { removeTranslatorId, updateTranslatorId } from '../../data/Projects';
interface ProjectRowProps {
    project: ProjectObject;
    removeProject: (project: ProjectObject) => void;
    translators?: any[];
}

const stripped = {
    backgroundImage: 'linear-gradient(130deg, #faf9f0 44.44%, #fffceb 44.44%, #fffceb 50%, #faf9f0 50%, #faf9f0 94.44%, #fffceb 94.44%, #fffceb 100%)',
    backgroundSize: '58.74px 70.01px'
};

const ProjectRow: React.FC<ProjectRowProps> = ({ project, removeProject, translators }) => {
    const navigate = useNavigate();
    const { status, loading: projectLoading, currentUser, selectedIds, projectTranslators, setState, tenant } = useStore();
    const toast = useToast()
    const {
        loading,
        billed,
        setBilled,
        wordCount,
        setWordCount,
        dbHandleBilledChange,
        dbHandleWordCountChange
    } = useProjectExtras(project);

    const badgeConfig = [
        { key: 'isTranslation', label: 'T', color: 'gray' },
        { key: 'isEditing', label: 'E', color: 'purple' },
        { key: 'isCertificate', label: 'C', color: 'blue' },
        { key: 'isBittext', label: 'B', color: 'green' },
        { key: 'isGlossary', label: 'G', color: 'red' },
        { key: 'isStyleSheet', label: 'S', color: 'orange' },
        { key: 'isMemory', label: 'M', color: 'yellow' },
    ];

    const convertTimeStamp = (time: any) => {
        const timeStamp = new Timestamp(time._seconds, time._nanoseconds);
        return transfromTimestamp(timeStamp)
    }

    const handleSelected = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const target = e.target as HTMLInputElement;
        const isChecked = target.checked;

        // Assuming your array is stored in a state variable called 'ids'
        const index = selectedIds.indexOf(id);

        if (isChecked && index === -1) {
            if (selectedIds.length < 30) {
                // If the checkbox is checked and the id doesn't exist in the array, add it
                setState({ selectedIds: [...selectedIds, id] });
            } else {
                toast({
                    description: `Only 30 projects can have their state changed at the same time.`,
                    status: 'warning',
                    duration: 9000,
                    isClosable: true,
                })
            }

        } else if (!isChecked && index !== -1) {
            // If the checkbox is unchecked and the id exists in the array, remove it
            const updatedIds = selectedIds.filter(item => item !== id);
            setState({ selectedIds: updatedIds });
        }
    }

    const assignTranslator = async (translatorId: string | null, project: ProjectObject) => {
        const projectId = project.id;

        try {
            if (translatorId) {
                setState({ loading: true });
                // If translatorId is provided, assign it to the project
                await updateTranslatorId(projectId, translatorId);
                toast({
                    description: `Translator assigned successfully.`,
                    status: "info",
                    duration: 9000,
                    isClosable: true,
                });
            } else {
                // If no translatorId is provided, remove the existing translatorId
                await removeTranslatorId(projectId);
                toast({
                    description: `Translator removed successfully.`,
                    status: "info",
                    duration: 9000,
                    isClosable: true,
                });
            }
            setState({ loading: false, refresh: true });
        } catch (error) {
            // Handle errors for both assign and remove operations
            console.error("Failed to assign/remove translator:", error);
            toast({
                description: `Failed to assign/remove translator.`,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
    };

    const getAssignedProjectTranslator = (projectId: string) => {
        const assignedProjectTranslator = projectTranslators.find((translator) => translator.projectId === projectId);
        return assignedProjectTranslator?.name;
    }

    return (

        <Tr cursor={'pointer'} _hover={{ bg: 'gray.100' }} style={project.data.status === 'Archived' ? stripped : {}}>
            <Td px={0} pl={1}>
                <Checkbox isChecked={selectedIds.includes(project.id)} onChange={(e) => handleSelected(e, project.id)}></Checkbox>
            </Td>
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
                {badgeConfig.map(({ key, label, color }) =>
                    (project?.data as Record<string, any>)[key] ? (
                        <Badge key={key} mr={2} colorScheme={color} px={2}>
                            {label}
                        </Badge>
                    ) : null
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
                {project.data.created && convertTimeStamp(project.data.created)}
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
            {tenant.translators ? <>
                {currentUser?.role !== ROLES.Translator && project.data.status === 'Received' ? <>
                    <Td px={1.5} py={0.5}>
                        <FormControl id="wordCount_number">
                            <Select
                                h={'30px'}
                                maxW={'180px'}
                                name="department"
                                value={project.data.translatorId}
                                onChange={(e) => assignTranslator(e.target.value, project)}
                            >
                                <option value=''>Select</option>
                                {translators?.length && translators?.map((translator: any) => (
                                    <option
                                        key={translator.uid}
                                        value={translator.uid}
                                    >{translator.name}</option>

                                ))}
                            </Select>
                        </FormControl>
                    </Td>
                </> : <Td px={1.5} py={0.5}>
                    {currentUser?.role !== ROLES.Translator && project.data.status !== 'Assigned' ?
                        <Select
                            h={'30px'}
                            maxW={'180px'}
                            name="department"
                            disabled={true}
                        >
                            <option value=''>Select</option>
                        </Select>
                        : null}

                    {currentUser?.role !== ROLES.Translator && project.data.status === 'Assigned' ? <>
                        {getAssignedProjectTranslator(project.id) !== undefined ?
                            <Tag size={'sm'} py={'2px'} variant='outline' colorScheme='blue'>
                                <TagLabel>
                                    <Tooltip label={getAssignedProjectTranslator(project.id)} aria-label='A tooltip'>
                                        {shortenFileName(getAssignedProjectTranslator(project.id) || '', 10)}
                                    </Tooltip>
                                </TagLabel>
                                <TagCloseButton onClick={() => assignTranslator(null, project)} />
                            </Tag> : null
                        }
                    </> : null}
                </Td>}
            </> : null}

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
                {currentUser?.role !== ROLES.Translator && status === 'Quoted' && !projectLoading ?
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
                            {currentUser?.role !== ROLES.Translator &&
                                <IconButton
                                    variant="ghost"
                                    height={10}
                                    icon={<RiDeleteBin6Line color={'#f84141'} />}
                                    aria-label="toggle-dark-mode"
                                    onClick={() => {
                                        removeProject(project);
                                    }}
                                    disabled={project.data.status !== 'Received'}
                                />}
                        </Box>
                    }
                </Flex>
            </Td>
        </Tr>

    );
};

export default ProjectRow;
