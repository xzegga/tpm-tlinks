import { Timestamp } from 'firebase/firestore';

import {
    Badge, Box, Center, Flex, FormControl, Input, Spinner, Table, Tbody, Td, Text, Textarea, Tr
} from '@chakra-ui/react';

import { useStore } from '../../hooks/useGlobalStore';
import useProjectExtras from '../../hooks/useProjectExtras';
import { ProjectObject } from '../../models/project';
import { ROLES } from '../../models/users';
import { transfromTimestamp } from '../../utils/helpers';
import Flag from '../Flag';

export interface ProjectTableProps {
    project: ProjectObject;
    setUpdate?: (arg: boolean) => void
}


const ProjectTable: React.FC<ProjectTableProps> = ({ project }) => {
    const { currentUser } = useStore();

    const {
        loading,
        billed,
        setBilled,
        wordCount,
        setWordCount,
        comments,
        setComments,
        dbHandleCommentChange,
        dbHandleBilledChange,
        dbHandleWordCountChange
    } = useProjectExtras(project);

    return (
        <Center>
            <Table variant='simple' size='sm' mt='5'>
                <Tbody>
                    <Tr>
                        <Td maxW='35%' w={'35%'}>
                            <Text fontWeight={'bold'}>Request Number:</Text> </Td>
                        <Td maxW='70%'>
                            <Flex>
                                {project?.data?.requestNumber}
                            </Flex>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Service Requested: </Text></Td>
                        <Td>
                            {project.data.isTranslation && <Badge mr={3} px={2} colorScheme='gray'>Translation</Badge>}
                            {project.data.isEditing && <Badge mr={3} colorScheme='purple' px={2}>Edition</Badge>}
                            {project.data.isCertificate && <Badge colorScheme='blue' px={2}>Certification</Badge>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Source Language:</Text> </Td>
                        <Td>
                            <Flex>
                                <Flag name={project.data.sourceLanguage} />
                                {project?.data?.sourceLanguage}
                            </Flex>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Target Language:</Text> </Td>
                        <Td>
                            <Flex>
                                {project.data.targetLanguage !== 'Multilingual' && <Flag name={project.data.targetLanguage} />}
                                {project?.data?.targetLanguage}
                            </Flex>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Requested Date:</Text></Td>
                        <Td>{project.data.created && transfromTimestamp((project.data.created as Timestamp))}</Td>
                    </Tr>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Time Line: </Text> </Td>
                        <Td >{project.data.timeLine && transfromTimestamp((project.data.timeLine as Timestamp))}</Td>
                    </Tr>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Additional Info:</Text> </Td>
                        <Td >
                            <Flex>
                                {project?.data?.additionalInfo}
                            </Flex>
                        </Td>
                    </Tr>
                    {currentUser?.role === ROLES.Admin ? (
                        <>
                            {/* Word Count */}
                            <Tr>
                                <Td maxW='35%' w={'35%'}>
                                    <Text py={2} fontWeight={'bold'}>Word Count:</Text>
                                </Td>

                                <Td >
                                    <FormControl id="wordCount_number">
                                        <Flex gap={2} alignItems={'center'} w={'100%'}>
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
                                                placeholder="Word Count"
                                                w={'30%'}
                                            />

                                            <Box maxW={'30%'} w={'30%'}>
                                                {loading?.wordCount && <Flex>
                                                    <Spinner size='xs' color="orange.500" />
                                                    <Text ml={1} color={'orange.500'}>Saving</Text></Flex>}
                                            </Box>
                                        </Flex>
                                    </FormControl>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td maxW='35%' w={'35%'}>
                                    <Text py={2} fontWeight={'bold'}>Billed Amount:</Text>
                                </Td>

                                <Td>
                                    <FormControl id="billed_amount">
                                        <Flex gap={2} alignItems={'center'} w={'100%'}>
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
                                                placeholder="Billed amount"
                                                w={'30%'}
                                                type="number"
                                            />
                                            <Box maxW={'30%'} w={'30%'}>
                                                {loading?.billed && <Flex>
                                                    <Spinner size='xs' color="orange.500" />
                                                    <Text ml={1} color={'orange.500'}>Saving</Text></Flex>}
                                            </Box>
                                        </Flex>
                                    </FormControl>
                                </Td>
                            </Tr>


                        </>
                    ) : null}
                    {project?.data?.comments !== '' ? <>
                        <Tr>
                            <Td borderWidth={0}
                                colSpan={currentUser?.role !== ROLES.Admin ? 2 : 1}
                            ><Text py={2} fontWeight={'bold'}>Translator Comments:</Text>
                                {currentUser?.role !== ROLES.Admin ?
                                    <Box background={'yellow.100'} color={'yellow.900'} w={'100%'} p={3} borderRadius={3}>
                                        <Text >{project?.data?.comments}</Text>
                                    </Box> :
                                    null}
                            </Td>
                            {currentUser?.role === ROLES.Admin ? (
                                <Td borderWidth={0}>

                                    <FormControl id="comments_info">
                                        <Textarea
                                            name="comments"
                                            id="comments"

                                            value={comments}
                                            onChange={(e) => {
                                                dbHandleCommentChange(e);
                                                setComments(e.target.value);
                                            }}
                                            borderColor="gray.300"
                                            _hover={{
                                                borderRadius: 'gray.300'
                                            }}
                                            placeholder="Message"
                                        />
                                    </FormControl>
                                    <Box maxW={'30%'} w={'30%'} mt={2}>
                                        {loading?.comments && <Flex>
                                            <Spinner size='xs' color="orange.500" />
                                            <Text ml={1} color={'orange.500'}>Saving</Text></Flex>}
                                    </Box>
                                </Td>
                            ) : null}
                        </Tr>
                    </> : null}

                </Tbody>
            </Table>
        </Center >
    );
}

export default ProjectTable;