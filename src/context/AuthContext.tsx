import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../utils/init-firebase'
import firebase, {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  confirmPasswordReset
} from 'firebase/auth'
import { apiUrl } from '../utils/config';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { ROLES } from '../models/users';

export type User = firebase.User | null;

type Roles = {
  role: keyof typeof ROLES;
}

export type UserWithRoles = User & Roles;

type ContextState = {
  currentUser: UserWithRoles | null | undefined,
  signInWithGoogle: () => Promise<firebase.UserCredential>,
  login: (...args: any[]) => Promise<firebase.UserCredential>,
  register: (...args: any[]) => Promise<firebase.UserCredential>,
  logout: (...args: any[]) => Promise<void>,
  forgotPassword: (...args: any[]) => Promise<void>,
  resetPassword: (...args: any[]) => Promise<void>,
}

let currentUser;

export const AuthContext = createContext<ContextState>({
  currentUser
} as ContextState)

export const useAuth = () => useContext(AuthContext)

export interface AuthContextProviderProps {
  children: React.ReactNode
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {

  const [currentUser, setCurrentUser] = useState<UserWithRoles | null | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      updateUser(currentUser as UserWithRoles);
    })
    return () => unsubscribe()
  }, [])

  const updateUser = async (user: UserWithRoles) => {
    if (user) {
      const userDetails = await getRoles(user);
      if (!userDetails) {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          created: Timestamp.now(),
          photoUrl: user.photoURL,
          role: 'unauthorized',
          tenant: 'fiuFtXRQ73mmgUwnRwRE',
          department: '',
        })
      }
      user.role = userDetails?.role || 'unauthorized';
    }
    setCurrentUser(user);
  }

  const getRoles = async (user: UserWithRoles) => {
    const userRef = doc(db, 'users', user.uid)
    const userData = await getDoc(userRef)
    return userData.data();
  }


  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const register = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const forgotPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email, {
      url: `${apiUrl}login`,
    })
  }

  const resetPassword = (oobCode: string, newPassword: string) => {
    return confirmPasswordReset(auth, oobCode, newPassword)
  }

  const logout = () => {
    return signOut(auth)
  }

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const value: ContextState = {
    currentUser,
    signInWithGoogle,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
