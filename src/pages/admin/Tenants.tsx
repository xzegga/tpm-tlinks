import {
    Box, Breadcrumb, BreadcrumbItem, Container, Flex, Image, Spacer, Table,
    Tbody, Td, Text, Th, Thead, Tr, FormControl, FormLabel, Input, InputGroup,
    Button,
    useToast,
    Checkbox
} from "@chakra-ui/react";
import React, { useEffect, useState } from 'react';
import { NavLink } from "react-router-dom";
import { Tenant } from "../../models/clients";
import { useDropzone } from "react-dropzone";
import { AiOutlineCloudUpload, AiOutlineEdit } from "react-icons/ai";
import { useStore } from "../../hooks/useGlobalStore";
import { ROLES } from "../../models/users";
import { getAllTenants, getImageUrl, saveTenant, updateTenant } from "../../data/Tenant";
import { toPascalCase } from "../../utils/toPascalCase";
import { transfromTimestamp } from "../../utils/helpers";
import { Timestamp } from "firebase/firestore";

const Tenants: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [departments, setDepartments] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [checked, setChecked] = useState<boolean>();
    const [file, setFile] = useState<File | null>(null);
    const { currentUser, setState, loading } = useStore();
    const [images, setImages] = useState<Record<string, string | null>>({});
    const toast = useToast()
    
    const {
        getRootProps,
        getInputProps
    } = useDropzone({
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/svg+xml': ['.svg'],
            'image/gif': ['gif']
        },
        onDrop: acceptedFiles => {
            const [selected] = acceptedFiles.map(file => file)
            setFile(selected);
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            const fetchedTenants = await getAllTenants(currentUser.token);
            setTenants(fetchedTenants);
        };

        if (currentUser?.role === ROLES.Admin) fetchData();
    }, []);

    const handleInputName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTenant({
            ...tenant,
            name: e.target.value,
            slug: toPascalCase(e.target.value)
        } as Tenant);
    };

    const handleInputCode = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTenant({
            ...tenant,
            code: e.target.value,
        } as Tenant);
        setCode(e.target.value)
    };

    const handleInputDep = (e: React.ChangeEvent<HTMLInputElement>) => {
        const departmentsArray = e.target.value.split(',')
            .map(item => item.trim())
            .filter(item => item !== '')

        setTenant({
            ...tenant,
            departments: departmentsArray
        } as Tenant);

        setDepartments(e.target.value)
    };

    const setCheckedItems = (chk: boolean)=>{
        setTenant({
            ...tenant,
            export: chk,
        } as Tenant);
        setChecked(checked)
    }

    const saveRequest = async () => {
        if (!tenant?.name || !tenant?.code) {
            toast({
                description: `Name or Code field are missing`,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (currentUser && currentUser.role === ROLES.Admin && tenant) {
            setState({ loading: true })

            if (tenant.id) {
                await updateTenant(tenant, file);

                const newTenants = [ ...tenants ];
                const index = newTenants.findIndex(item => item.id === tenant.id)
                
                if (index !== -1) {
                    newTenants[index] = {
                        ...newTenants[index],
                        name: tenant.name,
                        departments: tenant.departments,
                        code: tenant.code,
                        export: tenant.export,
                        ...(file && { image: `/ClientLogos/${file?.name}` })
                    }
                    setTenants(newTenants)
                }
            } else {
                await saveTenant(tenant, file);
                setTenants([...tenants, tenant]);
            }
            setState({ loading: false });
            cancelHandle();
        }
    };

    const cancelHandle = () => {
        setTenant(null);
        setFile(null);
        setDepartments('');
        setCode('')
    }

    useEffect(() => {
        const fetchTenantImages = async () => {
            const imageUrls = await Promise.all(
                tenants.map(async (tenant) => await getImageUrl(tenant.image))
            );
            const imagesArray = Object.assign({}, ...tenants.map((t, i) => ({ [t.id as string]: imageUrls[i] })));
            setImages(imagesArray);
        };

        fetchTenantImages();
    }, [tenants])

    return <>
        {currentUser ?
            <Container maxW="full" mt={0} w={'container.lg'} overflow="hidden" width={'100%'}>
                <Box pt={10} mb={8}>
                    <Flex mb='10'>
                        <Box>
                            <Breadcrumb separator='/'>
                                <BreadcrumbItem>
                                    <Text>Home</Text>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <NavLink to='/admin'>Project Dashboard</NavLink>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <Text>Clients</Text>
                                </BreadcrumbItem>
                            </Breadcrumb>
                        </Box>

                        <Spacer />
                    </Flex>
                </Box>
                <Box mb={10}>
                    <Flex gap={4} alignItems={'end'} justifyContent={'start'}>
                        <FormControl id="client_name" flex={2}>
                            <FormLabel>Client Name</FormLabel>
                            <InputGroup borderColor="#E0E1E7">
                                <Input placeholder="" name="name" id="name" value={tenant?.name || ''} onChange={handleInputName} />
                            </InputGroup>
                        </FormControl>
                        <FormControl id="departaments" flex={3}>
                            <FormLabel>Departments (Separated by comma)</FormLabel>
                            <InputGroup borderColor="#E0E1E7">
                                <Input placeholder="" name="departments" id="name" value={departments || ''} onChange={handleInputDep} />
                            </InputGroup>
                        </FormControl>
                        <FormControl id="code" flex={1}>
                            <FormLabel>Code</FormLabel>
                            <InputGroup borderColor="#E0E1E7">
                                <Input placeholder="" name="code" id="code" value={code || ''} onChange={handleInputCode} />
                            </InputGroup>
                        </FormControl>
                        <FormControl id="logo" flex={1}>
                            <InputGroup>
                                <Flex gap={2}>
                                    <Box {...getRootProps({ className: 'dropzone' })} flex={1} justifyContent={'center'}>
                                        <input {...getInputProps()} />
                                        <Flex direction={'column'} alignItems={'center'}>
                                            <Button leftIcon={<AiOutlineCloudUpload />} colorScheme="orange">Logo</Button>
                                        </Flex>
                                    </Box>
                                    <Button colorScheme={'blue'} variant='outline' onClick={cancelHandle}>Cancel</Button>
                                    <Button 
                                        isLoading={loading}
                                        colorScheme={'blue'} 
                                        loadingText='Saving'
                                        onClick={saveRequest}
                                        spinnerPlacement='start'
                                        >{
                                        tenant?.id ? <Text>Update Client</Text> : <Text>Add Client</Text>
                                    }</Button>
                                </Flex>
                            </InputGroup>
                        </FormControl>
                    </Flex>
                    <Flex mt={2}>
                        <FormControl id="code" flex={1}>
                            <InputGroup borderColor="#E0E1E7" h={10} >
                                <Checkbox 
                                    isChecked={tenant?.export}
                                    onChange={(e) => setCheckedItems(e.target.checked)}
                                >Export billing report</Checkbox>
                            </InputGroup>
                        </FormControl>  
                    </Flex>
                </Box>
                <Box>
                    {currentUser && currentUser?.role === ROLES.Admin && (
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Name</Th>
                                    <Th>Created</Th>
                                    <Th>Departments</Th>
                                    <Th>Code</Th>
                                    <Th>Edit</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {tenants?.map((client: Tenant) => (
                                    <Tr key={client.name}>
                                        <Td>

                                            <Flex alignItems={'center'}>
                                                {client?.image && client?.id && images ?
                                                    <Image borderRadius='full' boxSize='35px'
                                                        src={images[client.id] as string} mt="0" /> : null}
                                                <Text ml={3}>{client.name}</Text>
                                            </Flex>
                                        </Td>
                                        <Td>
                                            {client.created && transfromTimestamp(client.created as Timestamp)}
                                        </Td>
                                        <Td>
                                            {client?.departments?.join(', ')}
                                        </Td>
                                        <Td>
                                            {client?.code}
                                        </Td>

                                        <Td>
                                            <Button size='sm' variant={'outline'} colorScheme="blue" leftIcon={<AiOutlineEdit />} onClick={() => {
                                                setTenant({ ...client });
                                                setDepartments(client.departments?.join(', ') || '');
                                                setCode(client.code);
                                            }}>Edit</Button>{' '}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )
                    }
                </Box>
            </Container> : null} </>;
};

export default Tenants;
