import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
    type User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

import type { UserProfile } from '../types/user';
import { ensureUniqueAccountNumber } from '../utils/accountGenerator';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, name: string, pin: string, phone: string) => Promise<void>;
    logout: () => Promise<void>;
    verifyPin: (pin: string) => Promise<boolean>;
    refreshProfile: () => Promise<void>;
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
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setProfile(null);
                setLoading(false);
            }
        });
        return unsubscribeAuth;
    }, []);

    // Real-time profile listener
    useEffect(() => {
        if (!user) return;
        const docRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile);
            }
            setLoading(false);
        }, (error) => {
            console.error('Profile listener error:', error);
            setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const register = async (email: string, pass: string, name: string, pin: string, phone: string) => {
        if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
            throw new Error('PIN must be exactly 6 digits');
        }

        // 1. Create Auth User
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, pass);

        // 2. Generate Unique Account Number
        const accountNumber = await ensureUniqueAccountNumber();

        // 3. Create Profile
        const newProfile: UserProfile = {
            uid: newUser.uid,
            email: newUser.email!,
            displayName: name || 'User',
            phone,
            pin,
            balance: 0, // Start with 0
            savings: 0,
            accountNumber,
            alias: '', // Empty initially, triggers AliasModal
            cards: [], // Empty initially
            createdAt: new Date().toISOString(),
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

    const refreshProfile = useCallback(async () => {
        if (!user) return;
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, register, logout, verifyPin, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
