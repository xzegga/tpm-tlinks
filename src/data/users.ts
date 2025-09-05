import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
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

// export const getUserById = async (claims: any, user: LoggedUser): Promise<LoggedUser | null> => {
//     try {
//         const userCollection = collection(db, 'users');
//         const querySnapshot = await getDocs(query(userCollection, where('uid', '==', claims.user_id)));

//         if (!querySnapshot.empty) {
//             return querySnapshot.docs[0].data() as LoggedUser;
//         }

//         const newUser = {
//             ...removeUndefinedProps(user),
//             role: ROLES.Unauthorized
//         };

//         const docRef = await addDoc(userCollection, newUser);
//         return { ...newUser, id: docRef.id } as LoggedUser;
//     } catch (error) {
//         console.log('Error getting user by ID:', error);
//         return null;
//     }
// };

/**
 * Obtiene el usuario por su UID o lo crea si no existe.
 * Devuelve un LoggedUser sin el token; el token se asigna en AuthContext.
 */
export const getUserById = async (uid: string, user: LoggedUser): Promise<LoggedUser | null> => {
    try {
        const userId = uid ?? user.uid;
        if (!userId) {
            console.log('getUserById: missing uid');
            return null;
        }

        // Referencia al doc con ID = uid para que siempre sea el mismo
        const ref = doc(db, 'users', userId);
        const snap = await getDoc(ref);

        // Perfil base con los datos actuales (sin undefined)
        const base = removeUndefinedProps({
            uid: userId,
            tenant: user.tenant ?? null,
            role: user.role ?? ROLES.Unauthorized,
            department: user.department ?? null,
            name: user.name ?? null,
            photoUrl: user.photoUrl ?? null,
            email: user.email ?? null
        });

        // Crea o actualiza el documento de usuario (merge)
        await setDoc(ref, base, { merge: true });

        // Devuelve el perfil actualizado (sin incluir el token)
        const data = snap.exists() ? snap.data() ?? base : base;
        return { ...(data as LoggedUser) };
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
