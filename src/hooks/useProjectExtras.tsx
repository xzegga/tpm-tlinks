import { ChangeEvent, useMemo, useState } from "react";
import { updateAmount, updateComments, updateWordCount } from "../data/Projects";
import { ProjectObject } from "../models/project";
import { useAuth } from "../context/AuthContext";
import { useStore } from "./useGlobalStore";


// Define the type for the debounce function
export type DebounceFunc<T extends unknown[]> = (...args: T) => void;

export default function useProjectExtras(
    project?: ProjectObject,
) {

    const [billed, setBilled] = useState(project?.data?.billed);
    const [wordCount, setWordCount] = useState(project?.data?.wordCount);
    const [comments, setComments] = useState(project?.data?.comments);
    const { validate } = useAuth();
    const { setState } = useStore();

    const [loading, setLoading] = useState<{
        billed: boolean,
        wordCount: boolean,
        comments: boolean
    }>({
        billed: false,
        wordCount: false,
        comments: false
    })

    const debounce = <T extends unknown[]>(func: (...args: T) => void, delay: number): DebounceFunc<T> => {
        let timeoutId: NodeJS.Timeout;
        return (...args: T) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Function to handle text change
    const handleCommentChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e?.target?.value !== '' && project) {
            setLoading({ ...loading, comments: true })
            await updateComments(project.id, e?.target?.value)
            setLoading({ ...loading, comments: false })
        }
    };

    const handleBilledChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e?.target?.value !== '' && project) {
            await validate();

            setLoading({ ...loading, billed: true })
            const amount = parseFloat(Number(e?.target?.value).toFixed(2));
            await updateAmount(project.id, amount)
            setLoading({ ...loading, billed: false })
            dbHandleRefresh();
        }
    };

    const handleWordCountChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e?.target?.value !== '' && project) {
            setLoading({ ...loading, wordCount: true })
            await updateWordCount(project.id, parseFloat(Number(e?.target?.value).toFixed(2)))
            setLoading({ ...loading, wordCount: false })
            dbHandleRefresh();
        }
    };

    const handleRefresh = () =>{
        setState({refresh: true});
    }

    const dbHandleCommentChange = useMemo(() => debounce(handleCommentChange, 300), []);
    const dbHandleBilledChange = useMemo(() => debounce(handleBilledChange, 300), []);
    const dbHandleWordCountChange = useMemo(() => debounce(handleWordCountChange, 300), []);
    const dbHandleRefresh = useMemo(() => debounce(handleRefresh, 200), []);

    return {
        dbHandleCommentChange,
        dbHandleBilledChange,
        dbHandleWordCountChange,
        loading,
        billed,
        setBilled,
        wordCount,
        setWordCount,
        comments,
        setComments,
        debounce
    }
}