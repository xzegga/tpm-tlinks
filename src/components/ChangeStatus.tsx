import { doc, setDoc } from 'firebase/firestore';
import { Dispatch, useRef, useState } from 'react';
import { TRS_ENABLED } from '../models/clients';

import {
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
    AlertDialogOverlay, Button,
    useToast, Select,
    AlertStatus, Text,
    Alert,
} from '@chakra-ui/react';

import { getProjectById, updateStatus } from '../data/Projects';
import { ProjectObject } from '../models/project';
import { ROLES } from '../models/users';
import { db } from '../utils/init-firebase';
import { adminStatuses, adminStatusesWithNoTranslators, translatorStatuses } from '../utils/value-objects';
import { useAuth } from '../context/AuthContext';
import { FaArchive } from 'react-icons/fa';
import { Tenant } from '../models/clients';
import { WarningTwoIcon } from '@chakra-ui/icons'


export default function ChangeStatusSelector({ project, onSuccess, ids, setProject, button = false, role, tenant }: {
    project?: ProjectObject,
    ids?: string[],
    setProject?: Dispatch<React.SetStateAction<ProjectObject | undefined>>,
    onSuccess?: (status: string) => void,
    role: string;
    button?: boolean;
    tenant?: Tenant;
}) {
    const [isOpen, setIsOpen] = useState(false)
    const { validate } = useAuth();
    const onClose = () => setIsOpen(false)
    const cancelRef = useRef(null)

    const canSeeTranslators =
        tenant?.translators === TRS_ENABLED.Client ||
        (tenant?.translators === TRS_ENABLED.Admin && role === ROLES.Admin);

    const statusAvailable =
        role === ROLES.Admin
            ? (canSeeTranslators ? adminStatuses : adminStatusesWithNoTranslators)
            : translatorStatuses;

    const [status, setStatus] = useState<string>(ids?.length ? statusAvailable[0] : project?.data?.status || '')
    const toast = useToast()

    const handleChangeStatus = (status: string) => {
        if (status !== '' && status !== project?.data.status) {
            setStatus(status)
            setIsOpen(true)
        }
    }

    const changeStatus = async () => {
        if (project) {
            setIsOpen(false)
            await validate();
            const response = await getProjectById(project?.id);

            await setDoc(doc(db, 'projects', project.id), {
                ...response.data,
                status: status
            })

            // update project status
            if (setProject) setProject({ ...project, data: { ...project.data, status: status } })

            toast({
                description: `Status for ${project.data.projectId} has been changed to ${status}`,
                status: 'info',
                duration: 9000,
                isClosable: true,
            })
        }

        if (ids?.length && status) {
            await validate();
            const response = await updateStatus(ids, status);
            toast({
                description: response.message,
                status: response.type as AlertStatus,
                duration: 9000,
                isClosable: true,
            })

            setIsOpen(false)
            if (onSuccess) onSuccess(status);
        }
    }

    return <>
        {!button ?
            <Select
                onChange={(e) => handleChangeStatus(e.target.value)}
                maxW={'150px'}
                value={project?.data.status}
            >
                {ids && <option value="none">Select Status</option>}
                {
                    statusAvailable.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))
                }
            </Select> :
            <Button ml={3} leftIcon={<FaArchive />} colorScheme='orange' onClick={() => handleChangeStatus('Archived')}>Archive</Button>
        }
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            size={'lg'}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {project ? <Text display={
                            'flex'
                        }>Change Project Status</Text> :
                            <Text>You are about to change the state of selected projects.</Text>}
                    </AlertDialogHeader>

                    <AlertDialogBody>

                        <Text>Are you sure you want to change the status to <span style={{ fontWeight: "bold" }}>{status}</span>?</Text>
                        {project?.data.translatorId && role !== ROLES.Translator &&
                            <div>

                                <Text display={'inline-block'} pt={2}>This project has already been assigned to a translator</Text>
                                {project.data.status === 'In Progress' ?
                                    <span> and is currently <span style={{ fontWeight: "bold" }}>in progress.</span></span> : <span>.</span>}
                                <Alert status='warning' mt={4} borderRadius={'md'} display={'flex'} alignItems={'center'}>
                                    <WarningTwoIcon boxSize={10} color={'orange.400'} mr={3} />
                                    Changing the status will unassign the translator from the project.</Alert>
                            </div>}

                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme={'blue'} onClick={changeStatus} ml={3}>
                            Change to {status}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog >

    </>
}
