import { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    User,
    Mail,
    Shield,
    Trash2,
    Plus,
    X,
    CheckCircle,
    ArrowLeft,
    ShieldCheck,
    Users,
    Key,
    Search,
    RefreshCw,
    Briefcase,
    Crown,
    Eye,
    EyeOff,
    PlaneTakeoff,
    Sparkles,
    Filter,
    Check,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

// ── Shining Animated Stars Configurations (Slow & Gentle Ambient Twinkle) ────
const SHINING_SPARKLES = [
    { top: '7%', left: '10%', size: 22, duration: 6.5, delay: 0 },
    { top: '14%', left: '26%', size: 16, duration: 8.0, delay: 2.5 },
    { top: '20%', left: '6%', size: 26, duration: 9.0, delay: 1.0 },
    { top: '32%', left: '46%', size: 18, duration: 7.2, delay: 4.0 },
    { top: '48%', left: '14%', size: 24, duration: 8.5, delay: 1.8 },
    { top: '64%', left: '30%', size: 16, duration: 6.8, delay: 3.2 },
    { top: '76%', left: '8%', size: 20, duration: 9.5, delay: 2.0 },
    { top: '84%', left: '40%', size: 22, duration: 7.0, delay: 0.8 },
    { top: '9%', left: '66%', size: 18, duration: 7.8, delay: 2.2 },
    { top: '16%', left: '90%', size: 24, duration: 8.8, delay: 4.5 },
    { top: '70%', left: '86%', size: 18, duration: 7.4, delay: 1.5 },
    { top: '86%', left: '74%', size: 20, duration: 9.2, delay: 3.5 },
];

const TWINKLE_STARS = [
    { top: '4%', left: '20%', size: 4, duration: 5.2, delay: 0.5 },
    { top: '11%', left: '38%', size: 3, duration: 6.8, delay: 2.4 },
    { top: '18%', left: '16%', size: 5, duration: 6.0, delay: 1.2 },
    { top: '26%', left: '3%', size: 3, duration: 7.5, delay: 3.8 },
    { top: '36%', left: '22%', size: 4, duration: 6.2, delay: 1.8 },
    { top: '42%', left: '3%', size: 3, duration: 7.0, delay: 0.9 },
    { top: '54%', left: '20%', size: 4, duration: 5.8, delay: 3.2 },
    { top: '66%', left: '10%', size: 5, duration: 7.8, delay: 2.1 },
    { top: '74%', left: '26%', size: 3, duration: 5.5, delay: 4.2 },
    { top: '80%', left: '3%', size: 4, duration: 7.2, delay: 2.8 },
    { top: '90%', left: '18%', size: 3, duration: 6.4, delay: 1.0 },
    { top: '5%', left: '80%', size: 4, duration: 6.0, delay: 1.7 },
    { top: '24%', left: '94%', size: 3, duration: 7.6, delay: 3.4 },
    { top: '38%', left: '86%', size: 4, duration: 5.4, delay: 4.6 },
    { top: '58%', left: '92%', size: 3, duration: 6.9, delay: 0.7 },
    { top: '78%', left: '94%', size: 4, duration: 6.3, delay: 3.6 },
];

const UserManagement = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN'
    const [showPassword, setShowPassword] = useState(false);

    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE'
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            // Normalize roles from ROLE_ADMIN to ADMIN
            const normalized = (res.data || []).map(u => ({
                ...u,
                role: u.role?.startsWith?.('ROLE_') ? u.role.replace('ROLE_', '') : u.role,
            }));
            setUsers(normalized);
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error('Unable to fetch user roster');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'ROLE_ADMIN') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (submitting) return;

        // Client-side duplication check
        if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase().trim())) {
            toast.error('Identity collision: This email is already assigned to an associate.', {
                duration: 6000,
                icon: '⚠️'
            });
            return;
        }

        setSubmitting(true);
        const loadToast = toast.loading('Provisioning new associate node...');
        try {
            await api.post('/users', {
                ...newUser,
                email: newUser.email.trim(),
            });
            toast.success('Associate successfully provisioned!', { id: loadToast });
            setShowAddModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'EMPLOYEE' });
            fetchUsers();
        } catch (error) {
            console.error('Provisioning failed', error);
            const errorData = error.response?.data;
            const message = typeof errorData === 'string' ? errorData : (errorData?.message || 'Node provisioning failed');
            toast.dismiss(loadToast);
            toast.error(message, { duration: 5000 });
        } finally {
            setSubmitting(false);
        }
    };

    const openDeleteModal = (targetUser) => {
        if (targetUser?.email === user?.email) {
            toast.error('Security constraint: You cannot delete your own administrative account.');
            return;
        }
        setUserToDelete(targetUser);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        const loadToast = toast.loading('Deleting user...');
        try {
            await api.delete(`/users/${userToDelete.id}`);
            toast.success(`User ${userToDelete.name || ''} deleted successfully`, { id: loadToast });
            setUserToDelete(null);
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user', error);
            const errorData = error.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.message || 'Failed to delete user');
            toast.error(errorMsg, { id: loadToast });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        const loadToast = toast.loading('Updating user permissions...');
        try {
            await api.put(`/users/${userId}`, { role: newRole });
            toast.success(`Role updated to ${newRole}`, { id: loadToast });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update role', error);
            toast.error('Failed to update role', { id: loadToast });
        }
    };

    // Derived statistics
    const employeeCount = useMemo(() => users.filter(u => u.role === 'EMPLOYEE').length, [users]);
    const managerCount = useMemo(() => users.filter(u => u.role === 'MANAGER').length, [users]);
    const adminCount = useMemo(() => users.filter(u => u.role === 'ADMIN').length, [users]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = 
                !searchTerm ||
                u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(u.id).includes(searchTerm);

            const matchesRole = 
                roleFilter === 'ALL' ||
                u.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    return (
        <div
            className="w-full min-h-screen relative p-4 sm:p-6 lg:p-10 pt-6 sm:pt-8 lg:pt-10 pb-24 animate-fadeIn"
            style={{
                background: 'linear-gradient(135deg, #2a1e80 0%, #462ebc 28%, #6742db 50%, #9e59be 75%, #df8785 100%)',
                backgroundAttachment: 'fixed',
            }}
        >
            {/* ═══════════ FIXED ANIMATED BACKGROUND ATMOSPHERE ═══════════ */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* 1. Soft glowing cloud-like bokeh orbs drifting across sky */}
            <motion.div
                className="absolute top-12 right-1/4 w-[420px] h-[340px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(200, 180, 255, 0.12) 50%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
                animate={{
                    x: [0, 35, -20, 0],
                    y: [0, -25, 15, 0],
                    scale: [1, 1.1, 0.95, 1],
                }}
                transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                className="absolute -bottom-20 right-10 w-[500px] h-[400px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(254, 205, 190, 0.35) 0%, rgba(223, 136, 132, 0.18) 50%, transparent 75%)',
                    filter: 'blur(75px)',
                }}
                animate={{
                    x: [0, -40, 25, 0],
                    y: [0, 20, -20, 0],
                    scale: [1, 1.08, 0.96, 1],
                }}
                transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                className="absolute top-1/3 left-10 w-[450px] h-[380px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                animate={{
                    x: [0, 30, -30, 0],
                    y: [0, -30, 20, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* ═══════════ SHINING ANIMATED STARS & CONSTELLATIONS ═══════════ */}
            {/* Global Star Gradient Definition */}
            <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
                <defs>
                    <radialGradient id="starGleamUser" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="35%" stopColor="#fff8db" stopOpacity="0.95" />
                        <stop offset="70%" stopColor="#fef08a" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                    </radialGradient>
                </defs>
            </svg>

            {/* 1. Large 4-Point Sparkling Stars with Diamond Glow Rays */}
            {SHINING_SPARKLES.map((star, idx) => (
                <motion.div
                    key={`user-sparkle-${idx}`}
                    className="absolute pointer-events-none select-none"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                    }}
                    initial={{ opacity: 0.15, scale: 0.6 }}
                    animate={{
                        opacity: [0.15, 0.9, 0.15],
                        scale: [0.6, 1.25, 0.6],
                        rotate: [0, 15, 0],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: 'easeInOut',
                    }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]"
                    >
                        <path
                            d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
                            fill="url(#starGleamUser)"
                        />
                        <circle cx="12" cy="12" r="3" fill="#ffffff" />
                    </svg>
                </motion.div>
            ))}

            {/* 2. Twinkling Night Sky Stars with Luminous Halos */}
            {TWINKLE_STARS.map((star, idx) => (
                <motion.div
                    key={`user-twinkle-${idx}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        backgroundColor: '#ffffff',
                        boxShadow: `0 0 ${star.size * 2.5}px ${star.size * 0.8}px rgba(255, 255, 255, 0.9)`,
                    }}
                    animate={{
                        opacity: [0.15, 0.85, 0.15],
                        scale: [0.75, 1.35, 0.75],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            {/* 3. Shooting Star Meteor Trails */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    top: '10%',
                    left: '15%',
                    width: '130px',
                    height: '2px',
                    transform: 'rotate(-28deg)',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 65%, rgba(255,255,255,1) 100%)',
                    filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.9))',
                }}
                animate={{
                    x: [-80, 520],
                    y: [-40, 270],
                    opacity: [0, 1, 0.8, 0],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 8,
                    ease: 'easeOut',
                }}
            />

            <motion.div
                className="absolute pointer-events-none"
                style={{
                    top: '30%',
                    left: '60%',
                    width: '100px',
                    height: '2px',
                    transform: 'rotate(-28deg)',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 65%, rgba(255,255,255,1) 100%)',
                    filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.9))',
                }}
                animate={{
                    x: [-60, 400],
                    y: [-30, 200],
                    opacity: [0, 1, 0.8, 0],
                }}
                transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatDelay: 11,
                    delay: 4,
                    ease: 'easeOut',
                }}
            />
            </div>

            {/* ═══════════ MAIN CONTENT WRAPPER ═══════════ */}
            <div className="w-full max-w-7xl mx-auto relative z-10 space-y-6">
                {/* ── 1. CINEMATIC EXECUTIVE HEADER ───────────────────────── */}
                <div className="relative">
                    {/* Soaring passenger jet with smooth gliding contrail */}
                    <div className="absolute top-2 right-4 pointer-events-none opacity-90 hidden lg:block">
                        <div className="relative">
                            <svg className="w-64 h-16 overflow-visible" viewBox="0 0 260 60" fill="none">
                                <motion.path
                                    d="M 10 50 Q 120 40, 240 15"
                                    stroke="url(#heroPlaneContrailUser)"
                                    strokeWidth="2"
                                    strokeDasharray="5 5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 0.85 }}
                                    transition={{ duration: 1.6, ease: 'easeOut' }}
                                />
                                <defs>
                                    <linearGradient id="heroPlaneContrailUser" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
                                        <stop offset="60%" stopColor="#ffffff" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <motion.div
                                className="absolute -top-1 right-2"
                                animate={{ x: [0, 6, -4, 0], y: [0, -4, 3, 0], rotate: [28, 32, 26, 28] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <PlaneTakeoff className="w-8 h-8 text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)]" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Navigation Back Link */}
                    <div className="mb-5">
                        <motion.button 
                            onClick={() => navigate('/admin')}
                            whileHover={{ x: -3 }}
                            whileTap={{ scale: 0.96 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/25 shadow-md cursor-pointer group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                            <span>Return to Admin Console</span>
                        </motion.button>
                    </div>

                    {/* Header Content */}
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[11px] font-black uppercase tracking-[0.15em] text-white shadow-sm mb-4"
                        >
                            <ShieldCheck className="w-4 h-4 text-emerald-300" />
                            <span>Nikitha Travel Request • Corporate Security &amp; Access Control</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-3 drop-shadow-md"
                        >
                            Team Roster &amp;
                            <br />
                            <span className="text-white">Identity Control.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-sm sm:text-base text-white/90 font-medium leading-relaxed max-w-xl"
                        >
                            Provision associate nodes, configure corporate role authorizations, and maintain organizational directory governance.
                        </motion.p>
                    </div>
                </div>

                {/* ── 2. STATS ROW (4 COMPACT CARDS) ─────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
                    {/* Card 1: Total Roster */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => setRoleFilter('ALL')}
                        className={`p-4 sm:p-4.5 rounded-2xl bg-white cursor-pointer transition-all duration-300 relative overflow-hidden shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] border group select-none ${
                            roleFilter === 'ALL'
                                ? 'ring-2 ring-[#6541e9] border-[#6541e9]/40 shadow-indigo-500/15'
                                : 'border-white/80 hover:border-indigo-100 hover:shadow-lg'
                        }`}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#6541e9] text-white flex items-center justify-center shadow-md shadow-[#6541e9]/25 group-hover:scale-105 transition-transform">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-[#6541e9] border border-indigo-100/80 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#6541e9]" />
                                All Roles
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Total Roster
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {users.length}
                                </p>
                                <span className="text-[11px] font-bold text-indigo-600">
                                    {users.length === 1 ? 'member' : 'members'}
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block truncate">
                                All active nodes
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 2: Employees */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => setRoleFilter('EMPLOYEE')}
                        className={`p-4 sm:p-4.5 rounded-2xl bg-white cursor-pointer transition-all duration-300 relative overflow-hidden shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] border group select-none ${
                            roleFilter === 'EMPLOYEE'
                                ? 'ring-2 ring-teal-500 border-teal-500/40 shadow-teal-500/15'
                                : 'border-white/80 hover:border-teal-100 hover:shadow-lg'
                        }`}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-100/80 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                Requesters
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Employees
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {employeeCount}
                                </p>
                                <span className="text-[11px] font-bold text-teal-600">
                                    Staff
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block truncate">
                                Travel requesters
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 3: Managers */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => setRoleFilter('MANAGER')}
                        className={`p-4 sm:p-4.5 rounded-2xl bg-white cursor-pointer transition-all duration-300 relative overflow-hidden shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] border group select-none ${
                            roleFilter === 'MANAGER'
                                ? 'ring-2 ring-amber-500 border-amber-500/40 shadow-amber-500/15'
                                : 'border-white/80 hover:border-amber-100 hover:shadow-lg'
                        }`}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                                <Briefcase className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100/80 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Approvers
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Managers
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {managerCount}
                                </p>
                                <span className="text-[11px] font-bold text-amber-600">
                                    Leads
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block truncate">
                                Approval authorities
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 4: Administrators */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => setRoleFilter('ADMIN')}
                        className={`p-4 sm:p-4.5 rounded-2xl bg-gradient-to-br from-[#24175b] via-[#321c7b] to-[#48249c] text-white shadow-[0_12px_30px_-10px_rgba(36,23,91,0.4)] border border-white/20 cursor-pointer relative overflow-hidden flex flex-col justify-between group select-none ${
                            roleFilter === 'ADMIN' ? 'ring-2 ring-indigo-400' : 'hover:shadow-lg'
                        }`}
                    >
                        <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none" />

                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-md group-hover:scale-105 transition-transform">
                                <Crown className="w-4 h-4 text-amber-300" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/15 border border-white/20 text-white backdrop-blur-md shadow-2xs flex items-center gap-1">
                                Executive
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200/90 block">
                                Administrators
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <p className="text-2xl font-black text-white tracking-tight">
                                    {adminCount}
                                </p>
                                <span className="text-[11px] font-bold text-amber-300">
                                    Superuser
                                </span>
                            </div>
                            <span className="text-[11px] text-indigo-200/80 font-medium block truncate">
                                Full executive access
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* ── 3. MAIN WORKSPACE CONTAINER ─────────────────────────── */}
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(20,10,60,0.25)] border border-white/80 space-y-6">
                {/* Search & Filter Strip */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-100">
                    {/* Search Input */}
                    <div className="relative flex-grow max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search associate by name, email, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#6541e9] focus:ring-2 focus:ring-[#6541e9]/15 transition-all outline-none"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs & Primary Action */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        {/* Role Filter Pills */}
                        <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60">
                            {['ALL', 'EMPLOYEE', 'MANAGER', 'ADMIN'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        roleFilter === role
                                            ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {role === 'ALL' ? 'All' : role.charAt(0) + role.slice(1).toLowerCase() + 's'}
                                </button>
                            ))}
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={fetchUsers}
                            title="Reload directory"
                            className="p-2.5 bg-slate-50 border border-slate-200/90 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors cursor-pointer"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6541e9]' : ''}`} />
                        </button>

                        {/* Add Associate Button - Nikitha Brand Gradient */}
                        <motion.button
                            onClick={() => setShowAddModal(true)}
                            whileHover={{ scale: 1.025, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            className="px-5 py-2.5 rounded-2xl text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-900/20 cursor-pointer select-none"
                            style={{
                                background: 'linear-gradient(135deg, #cb0f41 0%, #a21a58 50%, #852278 100%)',
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Associate</span>
                        </motion.button>
                    </div>
                </div>

                {/* ── DIRECTORY TABLE CONTENT ───────────────────────────── */}
                <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Associate Directory</h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200">
                                {filteredUsers.length} {filteredUsers.length === 1 ? 'record' : 'records'}
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                            Verified Institutional Identity Pool
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live Directory Sync
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 text-center">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-[#6541e9] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Syncing Associate Directory...
                        </p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No associates found</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                            {searchTerm ? `No results match "${searchTerm}". Try a different search term or clear the filter.` : 'No associates match the selected role criteria.'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                        Associate &amp; Identity
                                    </th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                        Authorization / Role
                                    </th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                        Security Status
                                    </th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((u) => {
                                    const isSelf = u.email === user?.email;
                                    const roleColors = {
                                        ADMIN: {
                                            badge: 'bg-purple-50 text-purple-700 border-purple-200',
                                            avatar: 'from-[#24175b] via-[#48249c] to-[#6541e9]',
                                            icon: Crown
                                        },
                                        MANAGER: {
                                            badge: 'bg-amber-50 text-amber-700 border-amber-200',
                                            avatar: 'from-amber-500 to-orange-600',
                                            icon: Briefcase
                                        },
                                        EMPLOYEE: {
                                            badge: 'bg-teal-50 text-teal-700 border-teal-200',
                                            avatar: 'from-teal-500 to-emerald-600',
                                            icon: User
                                        }
                                    }[u.role] || {
                                        badge: 'bg-slate-50 text-slate-700 border-slate-200',
                                        avatar: 'from-slate-600 to-slate-800',
                                        icon: User
                                    };

                                    const RoleIcon = roleColors.icon;

                                    return (
                                        <motion.tr 
                                            key={u.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group hover:bg-slate-50/70 transition-colors"
                                        >
                                            {/* Column 1: Associate Details */}
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    {/* Initial Avatar */}
                                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${roleColors.avatar} flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                                                        {(u.name?.[0] || 'U').toUpperCase()}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-slate-900 text-sm tracking-tight truncate">
                                                                {u.name}
                                                            </p>
                                                            {isSelf && (
                                                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-200">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                                                            <Mail className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="text-xs font-medium text-slate-500 truncate">
                                                                {u.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Column 2: Role Selector */}
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <select 
                                                            value={u.role}
                                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                            className={`appearance-none pl-8 pr-8 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6541e9]/20 ${roleColors.badge}`}
                                                        >
                                                            <option value="EMPLOYEE">Employee</option>
                                                            <option value="MANAGER">Manager</option>
                                                            <option value="ADMIN">Admin</option>
                                                        </select>
                                                        <RoleIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-80" />
                                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 text-[10px]">
                                                            ▼
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Column 3: Security Status */}
                                            <td className="px-8 py-5">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Active Associate
                                                </span>
                                            </td>

                                            {/* Column 4: Actions */}
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => openDeleteModal(u)}
                                                    disabled={isSelf}
                                                    title={isSelf ? 'Cannot delete your own account' : 'Remove associate'}
                                                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                                                        isSelf 
                                                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                                                            : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm hover:shadow-rose-500/20 active:scale-95'
                                                    }`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                </div>
            </div>
            </div>

            {/* ── 4. MODERN ADD ASSOCIATE MODAL ───────────────────────────── */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-100"
                        >
                            {/* Modal Header */}
                            <div className="relative p-7 sm:p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-[#6541e9] text-[11px] font-bold uppercase tracking-wider mb-2 border border-indigo-200/60">
                                            <Shield className="w-3.5 h-3.5" />
                                            <span>Directory Provisioning</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            Add New Associate
                                        </h2>
                                        <p className="text-xs text-slate-500 font-medium mt-1">
                                            Provision a corporate employee, manager, or administrator.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setShowAddModal(false)} 
                                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleAddUser} className="p-7 sm:p-8 space-y-5">
                                {/* Name Field */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                                        Legal Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input 
                                            required
                                            type="text"
                                            placeholder="e.g. Rahul Sharma"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#6541e9] focus:ring-4 focus:ring-[#6541e9]/10 transition-all outline-none"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                                        Corporate Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input 
                                            required
                                            type="email"
                                            placeholder="name@company.com"
                                            className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 transition-all outline-none ${
                                                users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase().trim()) 
                                                    ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-500/15' 
                                                    : 'border-slate-200 focus:border-[#6541e9] focus:ring-[#6541e9]/10'
                                            }`}
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                        />
                                    </div>
                                    {newUser.email && users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase().trim()) && (
                                        <p className="text-[11px] font-bold text-rose-500 tracking-wide mt-1">
                                            ⚠️ This identity already exists in your roster
                                        </p>
                                    )}
                                </div>

                                {/* Password Field with Show/Hide */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                                        Initial Password
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input 
                                            required
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter temporary password"
                                            className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#6541e9] focus:ring-4 focus:ring-[#6541e9]/10 transition-all outline-none"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Role Selector Cards */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                                        Authorization Level
                                    </label>
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {[
                                            { role: 'EMPLOYEE', label: 'Employee', icon: User, desc: 'Requisitions' },
                                            { role: 'MANAGER', label: 'Manager', icon: Briefcase, desc: 'Approvals' },
                                            { role: 'ADMIN', label: 'Admin', icon: Crown, desc: 'Full Access' },
                                        ].map(({ role, label, icon: Icon, desc }) => {
                                            const isSelected = newUser.role === role;
                                            return (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setNewUser({ ...newUser, role })}
                                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'border-[#6541e9] bg-indigo-50/70 shadow-sm ring-2 ring-[#6541e9]/20'
                                                            : 'border-slate-200 bg-white hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-[#6541e9]' : 'text-slate-400'}`} />
                                                    <p className={`text-xs font-black ${isSelected ? 'text-[#6541e9]' : 'text-slate-800'}`}>
                                                        {label}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-3">
                                    <motion.button 
                                        type="submit"
                                        disabled={submitting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm shadow-lg shadow-rose-900/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed select-none"
                                        style={{
                                            background: 'linear-gradient(135deg, #cb0f41 0%, #a21a58 50%, #852278 100%)',
                                        }}
                                    >
                                        {submitting ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span>Provision Associate</span>
                                                <CheckCircle className="w-4 h-4" />
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── 5. SIMPLE MINIMAL CONFIRMATION MODAL ─────────────────────── */}
            <AnimatePresence>
                {userToDelete && (
                    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                        {/* Clean Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isDeleting && setUserToDelete(null)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />

                        {/* Minimal Card */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative z-10 border border-slate-100 text-center"
                        >
                            {/* Soft Danger Icon */}
                            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-5 h-5" />
                            </div>

                            {/* Headline */}
                            <h3 className="text-lg font-bold text-slate-900">
                                Delete User?
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                Are you sure you want to remove <span className="font-semibold text-slate-800">{userToDelete.name}</span>? This will permanently delete their account and travel records.
                            </p>

                            {/* Action Buttons */}
                            <div className="mt-6 flex items-center gap-3">
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => setUserToDelete(null)}
                                    className="flex-1 py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={confirmDeleteUser}
                                    className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
