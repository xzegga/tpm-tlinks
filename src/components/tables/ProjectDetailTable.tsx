import {
    Table, Tbody, Tr, Td, Badge, Flex, Center, Text, FormControl,
    Textarea,
    Box,
    Input,
    Spinner
} from "@chakra-ui/react";
import { Timestamp } from "firebase/firestore";
import { ProjectObject } from "../../models/project";

import { transfromTimestamp } from "../../utils/helpers";
import Flag from "../Flag";
import { useAuth } from "../../context/AuthContext";
import { ChangeEvent, useMemo, useState } from "react";
import { updateAmount, updateComments, updateWordCount } from "../../data/Projects";

export interface ProjectTableProps {
    project: ProjectObject;
}

// Define the type for the debounce function
export type DebounceFunc<T extends unknown[]> = (...args: T) => void;

// Debounce function
export const debounce = <T extends unknown[]>(func: (...args: T) => void, delay: number): DebounceFunc<T> => {
    let timeoutId: NodeJS.Timeout;
    return (...args: T) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

const ProjectTable: React.FC<ProjectTableProps> = ({ project }) => {
    const { currentUser } = useAuth()
    const [loading, setLoading] = useState<{
        billed: boolean,
        wordCount: boolean,
        comments: boolean
    }>({
        billed: false,
        wordCount: false,
        comments: false
    })

    const [billed, setBilled] = useState(project?.data?.billed || 0);
    const [wordCount, setWordCount] = useState(project?.data?.wordCount || 0);
    const [comments, setComments] = useState(project?.data?.comments || 0);

    // Function to handle text change
    const handleCommentChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e?.target?.value !== '') {
            setLoading({ ...loading, comments: true })
            await updateComments(project.id, e?.target?.value)
            setLoading({ ...loading, comments: false })
        }
    };

    const handleBilledChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e?.target?.value !== '') {
            setLoading({ ...loading, billed: true })
            await updateAmount(project.id, Number(e?.target?.value))
            setLoading({ ...loading, billed: false })
        }
    };

    const handleWordCountChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e?.target?.value !== '') {
            setLoading({ ...loading, wordCount: true })
            await updateWordCount(project.id, Number(e?.target?.value))
            setLoading({ ...loading, wordCount: false })
        }
    };

    const dbHandleCommentChange = useMemo(() => debounce(handleCommentChange, 300), []);
    const dbHandleBilledChange = useMemo(() => debounce(handleBilledChange, 300), []);
    const dbHandleWordCountChange = useMemo(() => debounce(handleWordCountChange, 300), []);

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
                    {currentUser?.role === 'admin' ? (
                        <>
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
                                                    setBilled(Number(e.target.value));
                                                }}
                                                borderColor="gray.300"
                                                _hover={{
                                                    borderRadius: 'gray.300'
                                                }}
                                                placeholder="Billed amount"
                                                w={'30%'}
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

                            {/* Word Count */}
                            <Tr>
                                <Td maxW='35%' w={'35%'}>
                                    <Text py={2} fontWeight={'bold'}>Word Count:</Text>
                                </Td>

                                <Td >
                                    <Flex>
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
                                    </Flex>
                                </Td>
                            </Tr>
                        </>
                    ) : null}
                    {project?.data?.comments !== '' ? <>
                        <Tr>
                            <Td borderWidth={0}
                                colSpan={currentUser?.role !== 'admin' ? 2 : 1}
                            ><Text py={2} fontWeight={'bold'}>Translator Comments:</Text>
                                {currentUser?.role !== 'admin' ?
                                    <Box background={'yellow.100'} color={'yellow.900'} w={'100%'} p={3} borderRadius={3}>
                                        <Text >{project?.data?.comments}</Text>
                                    </Box> :
                                    null}
                            </Td>
                            {currentUser?.role === 'admin' ? (
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