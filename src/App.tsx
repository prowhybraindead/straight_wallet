import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Transfer from './pages/Transfer';
import Receive from './pages/Receive';
import Analysis from './pages/Analysis';
import Savings from './pages/Savings';
import Card from './pages/Card';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff, Sparkles, Wallet, ArrowRight } from 'lucide-react';

// ═══════════════════════════════════════════════
//  PREMIUM ANIME-STYLE LOGIN / REGISTER
// ═══════════════════════════════════════════════
const Login = () => {
  const { login, register } = useAuth();
  const [isReg, setIsReg] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // Added phone state
  const [pin, setPin] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isReg) {
        if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
          throw new Error('PIN must be exactly 6 digits');
        }
        await register(email, pass, name, pin, phone);
      } else {
        await login(email, pass);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 animated-bg" />

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 rounded-full bg-white/10 blur-xl"
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-32 right-12 w-32 h-32 rounded-full bg-white/5 blur-xl"
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-8 w-12 h-12 rounded-full bg-neon-cyan/20 blur-lg"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", damping: 20 }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <motion.div
            className="flex flex-col items-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white/20 p-3 rounded-2xl mb-3 backdrop-blur-xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Straight Wallet</h1>
            <p className="text-white/60 text-sm mt-1">Your Super App for Finance</p>
          </motion.div>

          {/* Tab switcher */}
          <div className="flex bg-white/10 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setIsReg(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${!isReg ? 'bg-white text-slate-900 shadow-lg' : 'text-white/60 hover:text-white'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsReg(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${isReg ? 'bg-white text-slate-900 shadow-lg' : 'text-white/60 hover:text-white'
                }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isReg ? 'register' : 'login'}
              initial={{ opacity: 0, x: isReg ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isReg ? -20 : 20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {isReg && (
                <div>
                  <label className="text-white/70 text-xs font-semibold uppercase tracking-wider block mb-1.5">Full Name</label>
                  <input
                    className="w-full p-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 backdrop-blur-sm focus:bg-white/15 transition-all"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-white/70 text-xs font-semibold uppercase tracking-wider block mb-1.5">Email</label>
                <input
                  className="w-full p-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 backdrop-blur-sm focus:bg-white/15 transition-all"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-white/70 text-xs font-semibold uppercase tracking-wider block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    className="w-full p-3.5 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 backdrop-blur-sm focus:bg-white/15 transition-all"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isReg && (
                <div>
                  <label className="text-white/70 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                    Security PIN <span className="text-neon-pink">(6 digits — required)</span>
                  </label>
                  <input
                    className="w-full p-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 backdrop-blur-sm text-center tracking-[0.5em] text-xl font-mono focus:bg-white/15 transition-all"
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={submitting}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 bg-white text-slate-900 hover:bg-white/90 disabled:opacity-50 shadow-lg shadow-white/10"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isReg ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Sparkle decoration */}
          <motion.div
            className="flex items-center justify-center gap-1 mt-6 text-white/30"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-widest">Powered by TrainCredit</span>
            <Sparkles className="w-3 h-3" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// ═══════════════════════════════════════════════
//  LOADING SCREEN
// ═══════════════════════════════════════════════
const LoadingScreen = () => (
  <div className="h-full flex items-center justify-center animated-bg">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full"
      />
      <p className="text-white/60 text-sm font-medium">Loading your wallet...</p>
    </motion.div>
  </div>
);

import AliasModal from './components/AliasModal';

// ═══════════════════════════════════════════════
//  PROTECTED ROUTE
// ═══════════════════════════════════════════════
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Login />;
  return (
    <>
      <AliasModal />
      {children}
    </>
  );
};

// ═══════════════════════════════════════════════
//  APP
// ═══════════════════════════════════════════════
function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              className: 'dark:bg-slate-800 dark:text-white dark:border-slate-700',
            }}
          />
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
              <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
              <Route path="/transfer" element={<ProtectedRoute><Layout><Transfer /></Layout></ProtectedRoute>} />
              <Route path="/receive" element={<ProtectedRoute><Layout><Receive /></Layout></ProtectedRoute>} />
              <Route path="/analysis" element={<ProtectedRoute><Layout><Analysis /></Layout></ProtectedRoute>} />
              <Route path="/savings" element={<ProtectedRoute><Layout><Savings /></Layout></ProtectedRoute>} />
              <Route path="/card" element={<ProtectedRoute><Layout><Card /></Layout></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
