import { doc, setDoc } from 'firebase/firestore';
import { Dispatch, useRef, useState } from 'react';

import {
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
    AlertDialogOverlay, Button,
    useToast, Select,
    AlertStatus, Text
} from '@chakra-ui/react';

import { getProjectById, updateStatus } from '../data/Projects';
import { ProjectObject } from '../models/project';
import { db } from '../utils/init-firebase';
import { statuses } from '../utils/value-objects';
import { useAuth } from '../context/AuthContext';
import { FaArchive } from 'react-icons/fa';

export default function ChangeStatusSelector({ project, onSuccess, ids, setProject, button = false }: {
    project?: ProjectObject,
    ids?: string[],
    setProject?: Dispatch<React.SetStateAction<ProjectObject | undefined>>,
    onSuccess?: (status: string) => void,
    button?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false)
    const { validate } = useAuth();
    const onClose = () => setIsOpen(false)
    const cancelRef = useRef(null)
    const [status, setStatus] = useState<string>(ids?.length ? statuses[0] : project?.data?.status || '')
    const toast = useToast()

    const handleChangeStatus = (status: string) => {
        if (status !== '') {
            console.log(status)
            setStatus(status)
            setIsOpen(true)
        }
    }

    const changeStatus = async () => {
        if (project) {
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

            setIsOpen(false)
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
            >
                {ids && <option value="none">Select Status</option>}
                {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </Select> :
            <Button ml={3} leftIcon={<FaArchive />} colorScheme='orange' onClick={() => handleChangeStatus('Archived')}>Archive</Button>
        }
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {project ? <Text>Change Project Status</Text> :
                            <Text>You are about to change the state of selected projects.</Text>}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure? You can't undo this action afterwards.
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
        </AlertDialog>
    </>
}
