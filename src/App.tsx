import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Transfer from './pages/Transfer';
import Receive from './pages/Receive';
import Analysis from './pages/Analysis';
import Savings from './pages/Savings';
import React, { useState } from 'react';

// Login Component (Inline for simplicity, or separate)
const Login = () => {
  const { login, register } = useAuth();
  const [isReg, setIsReg] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isReg) await register(email, pass, pin);
      else await login(email, pass);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold">{isReg ? 'Register' : 'Login'}</h2>
        <input className="w-full p-3 border rounded-lg" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full p-3 border rounded-lg" type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} />
        {isReg && <input className="w-full p-3 border rounded-lg" type="password" placeholder="6-digit PIN" maxLength={6} value={pin} onChange={e => setPin(e.target.value)} />}
        <button className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold">
          {isReg ? 'Sign Up' : 'Sign In'}
        </button>
        <p className="text-center text-sm text-indigo-600 cursor-pointer" onClick={() => setIsReg(!isReg)}>
          {isReg ? 'Already have an account? Login' : 'Create an account'}
        </p>
      </form>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] bg-white min-h-[800px] h-[85vh] rounded-[40px] shadow-2xl overflow-hidden relative border-8 border-slate-900 ring-4 ring-slate-300">
            {/* iPhone Notch Simulation */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50"></div>

            <div className="h-full overflow-y-auto no-scrollbar scroll-smooth">
              <Routes>
                <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
                <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
                <Route path="/transfer" element={<ProtectedRoute><Layout><Transfer /></Layout></ProtectedRoute>} />
                <Route path="/receive" element={<ProtectedRoute><Layout><Receive /></Layout></ProtectedRoute>} />
                <Route path="/analysis" element={<ProtectedRoute><Layout><Analysis /></Layout></ProtectedRoute>} />
                <Route path="/savings" element={<ProtectedRoute><Layout><Savings /></Layout></ProtectedRoute>} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
