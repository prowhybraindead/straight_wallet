import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    type User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    pin?: string;
    balance: number;
    savings: number;
    accountNumber: string;
}



interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, pin: string) => Promise<void>;
    logout: () => Promise<void>;
    verifyPin: (pin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch Profile
                const docRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data() as UserProfile);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const register = async (email: string, pass: string, pin: string) => {
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, pass);
        // Create Profile
        const newProfile: UserProfile = {
            uid: newUser.uid,
            email: newUser.email!,
            pin, // In production, hash this!
            balance: 1000, // Sign up bonus
            savings: 0,
            accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString()
        };
        await setDoc(doc(db, 'users', newUser.uid), newProfile);
        setProfile(newProfile);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const verifyPin = async (inputPin: string): Promise<boolean> => {
        if (!profile || !profile.pin) return false;
        return profile.pin === inputPin;
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, register, logout, verifyPin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
