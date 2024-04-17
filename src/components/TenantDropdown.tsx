import { Select } from "@chakra-ui/react";
import { useStore } from "../hooks/useGlobalStore"
import { ROLES } from "../models/users";
import { useEffect, useState } from "react";
import { Tenant } from "../models/clients";
import { getAllTenants } from "../data/Tenant";

export default function TenantDropdown(
    { value, handleChange, disabled = false, showAll = false, showNone = true }: {
        value: string;
        handleChange: (...args: any[]) => any;
        disabled?: boolean;
        showAll?: boolean;
        showNone?: boolean;
    }) {

    const { currentUser } = useStore();
    const [tenants, setTenants] = useState<Tenant[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const fetchedTenants = await getAllTenants();
            setTenants(fetchedTenants);
        };

        if (currentUser?.role === ROLES.Admin) fetchData();
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
            {showAll && <option value="all">All</option>}
            {showNone && <option value="none">None</option>}
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