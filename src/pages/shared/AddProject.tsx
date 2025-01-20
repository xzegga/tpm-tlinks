import './AddProject.css';

import { addDays } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStateWithCallbackLazy } from 'use-state-with-callback';

import {
  Box, Breadcrumb, BreadcrumbItem, Button, Checkbox, CircularProgress, Container, Flex,
  FormControl, FormLabel, Heading, Input, InputGroup, Select, Spacer, Stack, Text, Textarea,
  VStack, Wrap, WrapItem
} from '@chakra-ui/react';

import Urgent from '../../assets/isUrgent.svg?react';
import DatePicker from '../../components/DatePicker';
import DropZone from '../../components/DropZone';
import Languages from '../../components/Languages';
import { saveProject } from '../../data/Projects';
import { getAllTenants } from '../../data/Tenant';
import { useStore } from '../../hooks/useGlobalStore';
import { Tenant } from '../../models/clients';
import { Doc } from '../../models/document';
import { Project } from '../../models/project';
import { ROLES } from '../../models/users';
import { useAuth } from '../../context/AuthContext';

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
  tenant: '',
  department: ''
};

const AddProject: React.FC = () => {
  const [files, setFiles] = useState<Doc[]>([]);
  const [saving, setSaving] = useStateWithCallbackLazy<boolean>(false);
  const { currentUser, tenant } = useStore();
  const { validate } = useAuth();
  const [project, setProject] = useState<Project>({
    ...initialState,
    tenant: tenant.slug,
    department: currentUser.department
  });

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {

      const fetchedTenants = await getAllTenants(currentUser.token);
      setTenants(fetchedTenants);
    };

    if (currentUser?.role === ROLES.Admin) {
      fetchData();
    }

  }, []);

  const saveRequest = async () => {
    if (!files) return;

    if (currentUser) {
      await validate();
      setSaving(true, () => console.log);
      const langs = files.map((f) => [...f.target]);
      let multilingual = false;

      langs.forEach((f) => {
        if (f.length > 1 || f.join('') !== project.targetLanguage) multilingual = true;
      });

      let tenantoptions = {}
      if (currentUser.role !== ROLES.Admin) {
        tenantoptions = {
          tenant: currentUser?.tenant,
          department: project.department ?? currentUser.department,
        }
      }

      const projectToSave: Project = {
        ...project,
        targetLanguage: multilingual ? 'Multilingual' : project.targetLanguage,
        ...tenantoptions,
      };

      await saveProject(projectToSave, files, tenant);
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

  const handleRole = async (e: ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    setProject({
      ...project,
      ...(value && { [`${name}`]: value }),
    });
  }

  return (
    <>
      {currentUser && (
        <Container maxW="full" mt={0} w={'container.lg'} overflow="hidden" width={'100%'}>
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
            <Flex border="1px" borderColor="gray.200" borderRadius="lg" mt="10" className={saving ? 'blured' : ''} position={'relative'}>
              <Box borderRadius="lg" bg="blue.700" color="white" flex={1}>
                <Box p={4}>
                  <Wrap>
                    <WrapItem>
                      <Box borderRadius="lg">
                        <Box m={4} color="white">
                          <VStack spacing={5}>
                            {currentUser.role === ROLES.Admin ? <>
                              <FormControl id="tenant">
                                <FormLabel>Client</FormLabel>
                                <InputGroup borderColor="#E0E1E7">
                                  <Select
                                    required
                                    name="tenant"
                                    value={project.tenant}
                                    onChange={handleRole}
                                    color="black"
                                    backgroundColor={'white'}
                                    size="md"
                                    flex={1}
                                  >
                                    {tenants && tenants.length ? <>
                                      {tenants.map((tn) => <option
                                        key={tn.id}
                                        value={tn.slug}
                                      >{tn.name}</option>)}
                                    </>
                                      : null}

                                  </Select>
                                </InputGroup>
                              </FormControl>
                            </> : null}

                            <FormControl id="department">
                              <FormLabel>Department</FormLabel>
                              <InputGroup borderColor="#E0E1E7">
                                <Select
                                  required
                                  name="department"
                                  value={project.department}
                                  onChange={handleRole}
                                  color="black"
                                  backgroundColor={'white'}
                                  size="md"
                                  flex={1}
                                >
                                  
                                  {
                                    currentUser.role === ROLES.Admin ?
                                      <>
                                        <option value='all'>All</option>
                                        {
                                          tenants && tenants.length ? <>
                                            {
                                              tenants.find(tn => tn.slug === project?.tenant)?.departments.map((dp) =>
                                                <option
                                                  key={dp}
                                                  value={dp}
                                                >{dp}
                                                </option>
                                              )
                                            }
                                          </>
                                            : null
                                        }
                                      </> : <>
                                        {
                                          currentUser.department === 'all' ? <>
                                            {
                                              tenant && tenant.departments.length ? <>
                                                {tenant.departments.map((dp) =>
                                                  <option
                                                    key={dp}
                                                    value={dp}
                                                  >{dp}
                                                  </option>)
                                                }
                                              </> : null
                                            }
                                          </> : <option value={currentUser.department}>
                                            {currentUser.department}
                                          </option>
                                        }
                                      </>
                                  }
                                </Select>
                              </InputGroup>
                            </FormControl>

                            <FormControl id="language_requested">
                              <FormLabel>Request Number</FormLabel>
                              <InputGroup borderColor="#E0E1E7">
                                <Input placeholder="Request Number" name="requestNumber" id="requestNumber" value={project.requestNumber} onChange={handleInput} />
                              </InputGroup>
                            </FormControl>

                            {currentUser.role === ROLES.Admin && (
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
                              <Stack spacing={5} direction="row" wrap={'wrap'}>
                                <Checkbox required name="isTranslation" id="isTranslation"
                                  checked={project.isTranslation} onChange={handleCheckbox}>
                                  Translation
                                </Checkbox>
                                <Checkbox name="isEditing" id="isEditing" checked={project.isEditing} onChange={handleCheckbox}>
                                  Editing
                                </Checkbox>
                                <Checkbox name="isCertificate" id="isCertificate" checked={project.isCertificate} onChange={handleCheckbox}>
                                  Requires certification
                                </Checkbox>
                              </Stack>

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

              <Flex flexDirection={'column'} justifyContent={'center'} minH={'100%'} cursor={'pointer'} flex={2} m="5">
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
