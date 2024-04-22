import { Timestamp, addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Tenant } from '../models/clients';
import { db, storage } from '../utils/init-firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

export async function saveTenant(tenant: Tenant, file?: File | null) {
    try {
        const tenantDoc = collection(db, 'tenants');
        const created = tenant.created ? tenant.created : Timestamp.now();

        // Save documents and document references
        let uploadTask;
        if (file) {
            const path = `/ClientLogos/${file.name}`;
            const storageRef = ref(storage, path);
            uploadTask = await uploadBytesResumable(storageRef, file);
        }
        const tenantRef = await addDoc(tenantDoc, {
            created: created,
            name: tenant.name,
            slug: tenant.slug || '',
            departments: tenant.departments || [],
            code: tenant.code,
            export: tenant.export,
            ...(uploadTask ? { image: uploadTask?.metadata.fullPath } : {})
        });

        return tenantRef;
    } catch (error) {
        console.log(error);
    }
}

export const getAllTenants = async (token: string): Promise<Tenant[]> => {
    const functions = getFunctions();
    const getAllTenants = httpsCallable(functions, 'getTenants');

    const results = await getAllTenants({
        token
    });

    if (Array.isArray(results.data)) {
        const tenants = results?.data.map((item) => item.data);
        return tenants as Tenant[];
    }

    return [];
};

export const getTenantBySlug = async (slug: string): Promise<Tenant | null> => {
    try {
        const tenantsCollection = collection(db, 'tenants');
        const querySnapshot = await getDocs(query(tenantsCollection, where('slug', '==', slug)));

        if (querySnapshot.empty) {
            return null; // No tenant found with the given slug
        }

        const tenantDoc = querySnapshot.docs[0];
        const tenantData = tenantDoc.data();

        return {
            id: tenantDoc.id,
            name: tenantData.name,
            slug: tenantData.slug,
            departments: tenantData.departments,
            created: tenantData.created,
            code: tenantData.code,
            image: tenantData.image || '',
            export: tenantData.export || false
        } as Tenant;
    } catch (error) {
        console.error('Error fetching tenant:', error);
        throw error; // Re-throw the error for handling at a higher level
    }
};

export const getImageUrl = async (fullPath: string): Promise<string | null> => {
    if (!fullPath) return null;
    try {
        const imageRef = ref(storage, fullPath); // Create a reference to the image
        const url = await getDownloadURL(imageRef);
        return url;
    } catch (error) {
        console.error('Error fetching image URL:', error);
        return null; // Handle errors gracefully (optional: return placeholder URL)
    }
};

// Function to update an existing tenant
export async function updateTenant(tenant: Tenant, file?: File | null) {
    if (!tenant.id) return;

    try {
        const tenantRef = doc(db, 'tenants', tenant.id);

        const updatedData: any = {
            name: tenant.name,
            departments: tenant.departments,
            code: tenant.code,
            export: tenant.export || false
        };

        // Optionally update image if a new file is provided
        if (file) {
            const path = `/ClientLogos/${file.name}`;
            const storageRef = ref(storage, path);
            const uploadTask = await uploadBytesResumable(storageRef, file);
            updatedData.image = uploadTask?.metadata.fullPath;
        }

        await updateDoc(tenantRef, updatedData);
    } catch (error) {
        console.error('Error updating tenant:', error);
    }
}

// Function to delete a tenant
export async function removeTenant(tenantId: string) {
    try {
        const tenantRef = doc(db, 'tenants', tenantId);
        await deleteDoc(tenantRef);
    } catch (error) {
        console.error('Error deleting tenant:', error);
    }
}
