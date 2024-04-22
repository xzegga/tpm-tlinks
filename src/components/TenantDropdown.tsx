import { Select } from "@chakra-ui/react";
import { useStore } from "../hooks/useGlobalStore"
import { ROLES } from "../models/users";
import { useEffect } from "react";
import { Tenant } from "../models/clients";
import { getAllTenants } from "../data/Tenant";
import { useAuth } from "../context/AuthContext";

export default function TenantDropdown({
    value, handleChange,
    disabled = false,
    select = 'all'
}:
    {
        value: string;
        handleChange: (...args: any[]) => any;
        disabled?: boolean;
        select?: string;
        required?: boolean;
    }) {

    const { currentUser, tenants, loading, setState } = useStore();
    const { validate } = useAuth()

    useEffect(() => {
        if (tenants?.length) setState({ loading: false })
    }, [tenants]);

    useEffect(() => {
        const fetchData = async () => {
            setState({ loading: true })
            await validate();
            const fetchedTenants: Tenant[] = await getAllTenants(
                currentUser.token,
            );
            setState({ tenants: fetchedTenants });
        };

        if (currentUser?.role === ROLES.Admin && !tenants.length && !loading) fetchData();
    }, []);


    if (currentUser?.role !== ROLES.Admin) return;

    return <>
        <Select
            required
            name="tenant"
            value={value}
            onChange={handleChange}
            color="black"
            backgroundColor={'white'}
            size="md"
            flex={1}
            disabled={disabled}
        >
            {select && <option
                {...(select !== 'None' ? { value: select.toLowerCase() } : { value: '' })}>{select}</option>}
            {tenants && tenants.length
                ?
                <>
                    {tenants.map((tn) => <option
                        key={tn.id}
                        value={tn.slug}
                    >{tn.name}</option>)}
                </>
                : null}

        </Select>
    </>
}