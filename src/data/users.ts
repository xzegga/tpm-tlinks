import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/init-firebase';
import { LoggedUser } from '../store/initialGlobalState';
import { removeUndefinedProps } from '../utils/removeUndefined';
import { ROLES } from '../models/users';

export const getUserById = async (user: LoggedUser): Promise<void> => {
    try {
        const userCollection = collection(db, 'users');
        const querySnapshot = await getDocs(query(userCollection, where('uid', '==', user.uid)));

        if (querySnapshot.empty) {
            await addDoc(userCollection, {
                ...removeUndefinedProps(user),
                role: ROLES.Unauthorized
            });
        }

    } catch (error) {
        console.log('Error getting user by ID:', error);
    }
};
