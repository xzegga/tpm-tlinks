import {
    Table, Tbody, Tr, Td, Badge, Flex, Center, Text, FormControl,
    FormLabel,
    Textarea,
    Divider,
    Box
} from "@chakra-ui/react";
import { Timestamp } from "firebase/firestore";
import { ProjectObject } from "../../models/project";

import { transfromTimestamp } from "../../utils/helpers";
import Flag from "../Flag";
import { useAuth } from "../../context/AuthContext";
import { ChangeEvent, ChangeEventHandler, SetStateAction, useState } from "react";
import { updateComments } from "../../data/Projects";

export interface ProjectTableProps {
    project: ProjectObject;
}

// Define the type for the debounce function
type DebounceFunc<T extends unknown[]> = (...args: T) => void;

// Debounce function
const debounce = <T extends unknown[]>(func: (...args: T) => void, delay: number): DebounceFunc<T> => {
    let timeoutId: NodeJS.Timeout;
    return (...args: T) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

const ProjectTable: React.FC<ProjectTableProps> = ({ project }) => {
    const { currentUser } = useAuth()
    const [text, setText] = useState('');

    // Function to handle text change
    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e?.target?.value !== '') {
            updateComments(project.id, e?.target?.value)
        }
    };

    const debouncedHandleTextChange = debounce(handleTextChange, 300);

    return (
        <Center>
            <Table variant='simple' size='sm' mt='5'>
                <Tbody>
                    <Tr>
                        <Td><Text fontWeight={'bold'}>Request Number:</Text> </Td>
                        <Td>
                            <Flex>
                                {project?.data?.requestNumber}
                            </Flex>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td><Text fontWeight={'bold'}>Service Requested: </Text></Td>
                        <Td>
                            {project.data.isTranslation && <Badge mr={3} px={2} colorScheme='gray'>Translation</Badge>}
                            {project.data.isEditing && <Badge mr={3} colorScheme='purple' px={2}>Edition</Badge>}
                            {project.data.isCertificate && <Badge colorScheme='blue' px={2}>Certification</Badge>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td><Text fontWeight={'bold'}>Source Language:</Text> </Td>
                        <Td>
                            <Flex>
                                <Flag name={project.data.sourceLanguage} />
                                {project?.data?.sourceLanguage}
                            </Flex>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td><Text fontWeight={'bold'}>Target Language:</Text> </Td>
                        <Td>
                            <Flex>
                                {project.data.targetLanguage !== 'Multilingual' && <Flag name={project.data.targetLanguage} />}
                                {project?.data?.targetLanguage}
                            </Flex>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td><Text fontWeight={'bold'}>Requested Date:</Text></Td>
                        <Td>{project.data.created && transfromTimestamp((project.data.created as Timestamp))}</Td>
                    </Tr>
                    <Tr>
                        <Td ><Text fontWeight={'bold'}>Time Line: </Text> </Td>
                        <Td >{project.data.timeLine && transfromTimestamp((project.data.timeLine as Timestamp))}</Td>
                    </Tr>
                    <Tr>
                        <Td borderWidth={0}><Text fontWeight={'bold'}>Additional Info:</Text> </Td>
                        <Td borderWidth={0}>
                            <Flex>
                                {project?.data?.additionalInfo}
                            </Flex>
                        </Td>
                    </Tr>
                    {project?.data?.comments !== '' ? <>
                        <Tr>
                            <Td borderWidth={0}
                                colSpan={currentUser?.role !== 'admin' ? 2 : 1}
                            ><Text py={2} fontWeight={'bold'}>Translator Comments:</Text>
                                {currentUser?.role !== 'admin' ?
                                    <Box background={'yellow.100'} color={'yellow.900'} w={'100%'} p={3} borderRadius={3}><Text >{project?.data?.comments}</Text></Box> :
                                    null}
                            </Td>
                            {currentUser?.role === 'admin' ? (
                                <Td borderWidth={0}>
                                    <Flex>
                                        <FormControl id="additional_information">
                                            <Textarea
                                                name="additionalInfo"
                                                id="additionalInfo"
                                                value={project?.data?.comments}
                                                onChange={(e) => debouncedHandleTextChange(e)}
                                                borderColor="gray.300"
                                                _hover={{
                                                    borderRadius: 'gray.300'
                                                }}
                                                placeholder="Message"
                                            />
                                        </FormControl>
                                    </Flex>
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