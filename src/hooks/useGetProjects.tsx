import { getFunctions, httpsCallable } from "firebase/functions";
import { useStore } from "./useGlobalStore";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@chakra-ui/react";
import { ProjectObject } from "../models/project";

export default function useGetProjects({
    projects,
    setProjects,
    setLastDoc,
    setCount,
    requestdb,
    lastDoc,
}: {
    projects: ProjectObject[],
    setProjects: (value: React.SetStateAction<ProjectObject[]>) => void,
    setLastDoc: (value: React.SetStateAction<string | undefined>) => void,
    setCount: (value: React.SetStateAction<number | undefined>) => void,
    requestdb: string,
    lastDoc: string | undefined
}) {
    const {
        currentUser,
        pagination,
        status,
        monthSelected,
        yearSelected,
        setState } = useStore()
    const { validate } = useAuth();
    const toast = useToast();

    const removeInvalidProps = (obj: any) => {
        return Object.fromEntries(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null)
        );
    };

    const getProjectQuery = async (
        newQuery: boolean = false
    ) => {
        try {
            if (currentUser) {
                await validate();
                setState({ loading: true, loadingMore: true });
                const functions = getFunctions();
                const getAllProjets = httpsCallable(functions, 'getProjects');


                const cleanPayload = removeInvalidProps({
                    status,
                    monthSelected,
                    yearSelected,
                    requestdb,
                    lastDoc,
                    newQuery,
                    pagination,
                    token: currentUser.token,
                    tenant: currentUser.tenant,
                });

                const projectData: any = await getAllProjets(cleanPayload);

                if (newQuery) {
                    setProjects(projectData?.data?.projects || []);
                } else {
                    setProjects([
                        ...projects,
                        ...projectData?.data?.projects || []
                    ]);
                }
                setState({ projectTranslators: projectData?.data?.translators || [] });
                setLastDoc(projectData?.data.lastDoc || null);
                setCount(projectData?.data?.count);
                setState({ loading: false, loadingMore: false });
            }

        } catch (error) {
            // Handle error
            toast({
                title: 'Error getting projects',
                description: 'There is an error getting the project list',
                status: 'error',
                duration: 9000,
                isClosable: true
            });
            setState({ loading: false, loadingMore: false });
        }
    };

    return getProjectQuery;
}