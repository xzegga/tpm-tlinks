import {
    Container,
    Flex,
    Box,
    Breadcrumb,
    BreadcrumbItem,
    Spacer,
    Heading,
    Wrap,
    WrapItem,
    VStack,
    FormControl,
    FormLabel,
    InputGroup,
    Stack,
    Checkbox,
    Textarea,
    Button,
    Text,
    Input,
    CircularProgress
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import DropZone from '../../components/DropZone';
import Languages from '../../components/Languages';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DatePicker from '../../components/DatePicker';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import { Timestamp } from 'firebase/firestore';
import { Project } from '../../models/project';
import { Doc } from '../../models/document';
import { saveProject } from '../../data/Projects';
import { addDays } from 'date-fns';
import './AddProject.css';
import Urgent from '../../assets/isUrgent.svg?react';

const initialState: Project = {
    projectId: '',
    isEditing: false,
    isTranslation: true,
    isCertificate: false,
    sourceLanguage: 'English',
    targetLanguage: 'Spanish',
    timeLine: Timestamp.fromDate(addDays(new Date(), 5)),
    additionalInfo: '',
    status: 'Received',
    requestNumber: '',
    documents: [],
    isUrgent: false,
};

const AddProject: React.FC = () => {
    const [files, setFiles] = useState<Doc[]>([]);
    const [saving, setSaving] = useStateWithCallbackLazy<boolean>(false);
    const [project, setProject] = useState<Project>(initialState);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const saveRequest = async () => {
        if (!files) return;

        if (currentUser) {
            setSaving(true, null);
            const langs = files.map((f) => [...f.target]);
            let multilingual = false;

            langs.forEach((f) => {
                if (f.length > 1 || f.join('') !== project.targetLanguage) multilingual = true;
            });
            const projectToSave: Project = { ...project, targetLanguage: multilingual ? 'Multilingual' : project.targetLanguage };

            await saveProject(projectToSave, files);
            setSaving(false, () => navigate(`/${currentUser?.role}`));
        }
    };

    const handleLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProject({ ...project, [e.target.name]: e.target.value });
    };

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProject({ ...project, [e.target.name]: e.target.checked });
    };

    const handleDate = (date: Date) => {
        setProject({ ...project, timeLine: Timestamp.fromDate(date) });
    };

    const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setProject({ ...project, additionalInfo: e.target.value });
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProject({ ...project, [e.target.name]: e.target.value });
    };

    const handleDateCreated = (date: Date) => {
        setProject({ ...project, created: Timestamp.fromDate(new Date(date)) });
    };

    return (
        <>
            {currentUser && (
                <Container maxW="full" mt={0} overflow="hidden" width={'100%'}>
                    <Flex mb="10">
                        <Box>
                            <Breadcrumb separator="/">
                                <BreadcrumbItem>
                                    <Text>Home</Text>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <NavLink to={`/${currentUser.role}`}>Project Dashboard</NavLink>
                                </BreadcrumbItem>
                            </Breadcrumb>
                        </Box>

                        <Spacer />
                    </Flex>
                    <Heading size="md">Add Project Request</Heading>
                    <Box position={'relative'} width={'100%'}>
                        <Flex border="1px" borderColor="gray.200" borderRadius="lg" variant="outline" mt="10" className={saving ? 'blured' : ''} position={'relative'}>
                            <Box borderRadius="lg" bg="blue.700" color="white">
                                <Box p={4}>
                                    <Wrap>
                                        <WrapItem>
                                            <Box borderRadius="lg">
                                                <Box m={8} color="white">
                                                    <VStack spacing={5}>
                                                        <FormControl id="language_requested">
                                                            <FormLabel>Request Number</FormLabel>
                                                            <InputGroup borderColor="#E0E1E7">
                                                                <Input placeholder="Request Number" name="requestNumber" id="requestNumber" value={project.requestNumber} onChange={handleInput} />
                                                            </InputGroup>
                                                        </FormControl>
                                                        {currentUser.role === 'admin' && (
                                                            <FormControl id="language_requested">
                                                                <FormLabel>Created Date (Only Admin)</FormLabel>
                                                                <InputGroup borderColor="#E0E1E7">
                                                                    <Box color={'black'}>
                                                                        <DatePicker handleDate={handleDateCreated}></DatePicker>
                                                                    </Box>
                                                                </InputGroup>
                                                            </FormControl>
                                                        )}
                                                        <FormControl id="language_requested">
                                                            <FormLabel>Source Language</FormLabel>
                                                            <InputGroup borderColor="#E0E1E7">
                                                                <Languages handleChange={handleLanguage} name={'sourceLanguage'} selected={project.sourceLanguage}></Languages>
                                                            </InputGroup>
                                                        </FormControl>
                                                        <FormControl id="language_requested">
                                                            <FormLabel>Language Requested</FormLabel>
                                                            <InputGroup borderColor="#E0E1E7">
                                                                <Languages handleChange={handleLanguage} name={'targetLanguage'} selected={project.targetLanguage}></Languages>
                                                            </InputGroup>
                                                        </FormControl>
                                                        <FormControl id="services">
                                                            <Stack spacing={5} direction="row">
                                                                <Checkbox required name="isTranslation" id="isTranslation" checked={project.isTranslation} onChange={handleCheckbox} defaultIsChecked>
                                                                    Translation
                                                                </Checkbox>
                                                                <Checkbox name="isEditing" id="isEditing" checked={project.isEditing} onChange={handleCheckbox}>
                                                                    Editing
                                                                </Checkbox>
                                                            </Stack>
                                                            <Checkbox name="isCertificate" id="isCertificate" checked={project.isCertificate} onChange={handleCheckbox}>
                                                                Requires certification
                                                            </Checkbox>
                                                        </FormControl>
                                                        <div className='border-top'></div>
                                                        <FormControl id="urgent">
                                                            <Flex alignItems={'center'}>
                                                                <Checkbox name="isUrgent" id="isUrgent" checked={project.isUrgent} onChange={handleCheckbox}>
                                                                    <Flex alignItems={'center'}>Mark as Urgent <Urgent className="isUrgent" /></Flex>
                                                                </Checkbox>
                                                            </Flex>
                                                        </FormControl>

                                                        <FormControl id="language_requested">
                                                            <FormLabel>Project Timeline</FormLabel>
                                                            <InputGroup borderColor="#E0E1E7">
                                                                <Box color={'black'}>
                                                                    <DatePicker handleDate={handleDate} restrictDate={true}></DatePicker>
                                                                </Box>
                                                            </InputGroup>
                                                        </FormControl>
                                                        <FormControl id="additional_information">
                                                            <FormLabel>Additional Information</FormLabel>
                                                            <Textarea
                                                                name="additionalInfo"
                                                                id="additionalInfo"
                                                                value={project.additionalInfo}
                                                                onChange={handleTextArea}
                                                                borderColor="gray.300"
                                                                _hover={{
                                                                    borderRadius: 'gray.300'
                                                                }}
                                                                placeholder="message"
                                                            />
                                                        </FormControl>
                                                        <FormControl id="name" float="right">
                                                            {files.length > 0 ? (
                                                                <Button variant="outline" color="white" onClick={saveRequest}>
                                                                    Submit Project
                                                                </Button>
                                                            ) : (
                                                                <Text color={'yellow.300'}>
                                                                    Add files on the right box <br /> to save the new project
                                                                </Text>
                                                            )}
                                                        </FormControl>
                                                    </VStack>
                                                </Box>
                                            </Box>
                                        </WrapItem>
                                    </Wrap>
                                </Box>
                            </Box>

                            <Flex flexDirection={'column'} justifyContent={'center'} minH={'100%'} cursor={'pointer'} flex={1} m="5">
                                <DropZone setFileList={setFiles} targetLanguage={project.targetLanguage} />
                            </Flex>
                        </Flex>
                        <Flex
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                pointerEvents: 'none'
                            }}
                            justifyContent={'center'}
                        >
                            {saving && (
                                <Flex alignItems={'center'} justifyContent={'center'} direction={'column'}>
                                    <CircularProgress isIndeterminate mb={2} /> Saving Project Details...
                                </Flex>
                            )}
                        </Flex>
                    </Box>
                </Container>
            )}
        </>
    );
};

export default AddProject;
