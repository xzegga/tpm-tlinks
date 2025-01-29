import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/init-firebase';
import { LoggedUser } from '../store/initialGlobalState';
import { removeUndefinedProps } from '../utils/removeUndefined';
import { ROLES } from '../models/users';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const getAllUsers = async () => {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(query(usersCollection));

    const result = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data()
    }));
    return result;
};

export const getUserById = async (claims: any, user: LoggedUser): Promise<LoggedUser | null> => {
    try {
        const userCollection = collection(db, 'users');
        const querySnapshot = await getDocs(query(userCollection, where('uid', '==', claims.user_id)));

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as LoggedUser;
        }

        const newUser = {
            ...removeUndefinedProps(user),
            role: ROLES.Unauthorized
        };

        const docRef = await addDoc(userCollection, newUser);
        return { ...newUser, id: docRef.id } as LoggedUser;
    } catch (error) {
        console.log('Error getting user by ID:', error);
        return null;
    }
};

export const saveUser = async (token: string, user: any): Promise<any> => {
    const functions = getFunctions();
    const saveUserFuncion = httpsCallable(functions, 'saveUser');

    const results: any = await saveUserFuncion({
        token,
        user
    });

    if (results?.data) {
        return results.data;
    }
};

export const validateSession = async (token: string): Promise<any> => {
    const functions = getFunctions();
    const validateToken = httpsCallable(functions, 'verifyToken');

    const results: any = await validateToken({
        token
    });
    return results.data.valid;
};

export const removeUser = async (token: string, uid: string, id: string): Promise<any> => {
    const functions = getFunctions();
    const removeUserFuncion = httpsCallable(functions, 'removeUser');
    try {
        const message: any = await removeUserFuncion({
            token,
            uid,
            id
        });
        return message;
    } catch (error: any) {
        return error;
    }
};
