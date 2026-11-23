import { useState, useEffect, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    Calendar, 
    CheckCircle2, 
    XCircle, 
    FileText, 
    ArrowRight, 
    Plane, 
    ShieldCheck, 
    Zap, 
    ChevronRight, 
    ChevronLeft, 
    Search, 
    Clock, 
    History, 
    TrendingUp, 
    Sparkles, 
    Filter, 
    RefreshCw, 
    Check, 
    X, 
    User, 
    Briefcase,
    Building2,
    CheckCircle,
    SlidersHorizontal,
    PlaneTakeoff,
    MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReq, setSelectedReq] = useState(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter & Tab states
    const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
    const [searchTerm, setSearchTerm] = useState('');
    const [modeFilter, setModeFilter] = useState('ALL');

    // Graph Analytics State
    const [isGraphPopupOpen, setIsGraphPopupOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [viewType, setViewType] = useState('MONTHLY'); // 'MONTHLY' | 'YEARLY'

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/requests');
            setRequests(res.data || []);
        } catch (error) {
            console.error('Failed to fetch requests', error);
            toast.error('Failed to load travel requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.accessToken) {
            navigate('/login');
            return;
        }
        fetchRequests();
    }, [user?.accessToken, navigate]);

    const handleDecision = async (status) => {
        if (!selectedReq) return;

        if (status === 'REJECTED' && !comment.trim()) {
            toast.error('Rejection reason is mandatory. Please provide reviewer notes.');
            return;
        }

        const loadingToast = toast.loading(`${status === 'APPROVED' ? 'Approving' : 'Rejecting'} request...`);
        setIsSubmitting(true);
        try {
            await api.put(`/requests/${selectedReq.id}/manager`, {
                status: status,
                managerComments: comment
            });
            toast.success(`Request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully!`, { id: loadingToast });
            setSelectedReq(null);
            setComment('');
            fetchRequests();
        } catch (error) {
            console.error('Update failed', error);
            const statusCode = error.response?.status;
            if (statusCode === 401) {
                toast.error('Unauthorized. Please log in again.', { id: loadingToast });
                navigate('/login');
                return;
            }
            const serverData = error.response?.data;
            const message = typeof serverData === 'string'
                ? serverData
                : serverData?.message || serverData?.error || JSON.stringify(serverData) || error.message || 'Failed to update request';
            toast.error(message, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectRequest = (req) => {
        setSelectedReq(req);
        setComment(req.managerComments || '');
        const el = document.getElementById('manager-workspace-card');
        if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < 70) {
                const navbarHeight = 85;
                const targetY = window.pageYOffset + rect.top - navbarHeight;
                window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
            }
        }
    };

    const handleBackToList = () => {
        setSelectedReq(null);
        setComment('');
        const el = document.getElementById('manager-workspace-card');
        if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < 70) {
                const navbarHeight = 85;
                const targetY = window.pageYOffset + rect.top - navbarHeight;
                window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
            }
        }
    };

    // Filter buckets
    const pendingRequests = useMemo(() => requests.filter(r => r.status === 'SUBMITTED' || r.status === 'PENDING'), [requests]);
    const approvedRequests = useMemo(() => requests.filter(r => r.status === 'APPROVED' || r.status === 'BOOKED'), [requests]);
    const rejectedRequests = useMemo(() => requests.filter(r => r.status === 'REJECTED'), [requests]);

    const approvedCount = approvedRequests.length;
    const rejectedCount = rejectedRequests.length;
    const pendingCount = pendingRequests.length;

    // Filtered list based on active tab, search, and mode
    const displayedRequests = useMemo(() => {
        let baseList = [];
        if (activeTab === 'PENDING') baseList = pendingRequests;
        else if (activeTab === 'APPROVED') baseList = approvedRequests;
        else if (activeTab === 'REJECTED') baseList = rejectedRequests;
        else baseList = requests;

        return baseList.filter(req => {
            const matchesSearch = 
                !searchTerm ||
                req.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.employee?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.fromLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.toLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(req.id).includes(searchTerm);

            const matchesMode = 
                modeFilter === 'ALL' ||
                req.travelMode?.toLowerCase() === modeFilter.toLowerCase();

            return matchesSearch && matchesMode;
        });
    }, [requests, pendingRequests, approvedRequests, rejectedRequests, activeTab, searchTerm, modeFilter]);

    // Analytics calculation
    const getFilteredStats = (m, y, type) => {
        const filtered = requests.filter(r => {
            const date = new Date(r.departureDate);
            if (Number.isNaN(date.getTime())) return false;
            if (type === 'YEARLY') return date.getFullYear() === y;
            return date.getFullYear() === y && date.getMonth() === m;
        });

        const app = filtered.filter(r => r.status === 'APPROVED' || r.status === 'BOOKED').length;
        const rej = filtered.filter(r => r.status === 'REJECTED').length;
        const pen = filtered.filter(r => r.status === 'SUBMITTED' || r.status === 'PENDING').length;

        return [
            { name: 'Approved', value: app, color: '#10b981' },
            { name: 'Pending', value: pen, color: '#f59e0b' },
            { name: 'Rejected', value: rej, color: '#ef4444' }
        ].filter(d => d.value > 0);
    };

    const currentAnalytics = useMemo(() => getFilteredStats(selectedMonth, selectedYear, viewType), [requests, selectedMonth, selectedYear, viewType]);

    // Overall analytics for side widget
    const overallAnalytics = useMemo(() => {
        const app = approvedCount;
        const rej = rejectedCount;
        const pen = pendingCount;
        return [
            { name: 'Approved', value: app, color: '#10b981' },
            { name: 'Pending', value: pen, color: '#f59e0b' },
            { name: 'Rejected', value: rej, color: '#ef4444' }
        ].filter(d => d.value > 0);
    }, [approvedCount, rejectedCount, pendingCount]);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const changeMonth = (dir) => {
        let newMonth = selectedMonth + dir;
        let newYear = selectedYear;
        if (newMonth < 0) { newMonth = 11; newYear--; }
        if (newMonth > 11) { newMonth = 0; newYear++; }
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    // Quick review comment presets
    const commentPresets = [
        "Approved per corporate travel policy.",
        "Budget cleared for official client visit.",
        "Itinerary verified and authorized.",
        "Please provide alternate flight timings."
    ];

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

                {/* Global Star Gradient Definition */}
                <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
                    <defs>
                        <radialGradient id="starGleamManager" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                            <stop offset="35%" stopColor="#fff8db" stopOpacity="0.95" />
                            <stop offset="70%" stopColor="#fef08a" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                        </radialGradient>
                    </defs>
                </svg>

                {/* 1. Large 4-Point Sparkling Stars */}
                {SHINING_SPARKLES.map((star, idx) => (
                    <motion.div
                        key={`mgr-sparkle-${idx}`}
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
                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]">
                            <path
                                d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
                                fill="url(#starGleamManager)"
                            />
                            <circle cx="12" cy="12" r="3" fill="#ffffff" />
                        </svg>
                    </motion.div>
                ))}

                {/* 2. Twinkling Night Sky Stars */}
                {TWINKLE_STARS.map((star, idx) => (
                    <motion.div
                        key={`mgr-twinkle-${idx}`}
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
            </div>

            {/* ═══════════ MAIN CONTENT WRAPPER ═══════════ */}
            <div className="w-full max-w-7xl mx-auto relative z-10 space-y-6">
                {/* ── 1. CINEMATIC EXECUTIVE HEADER ───────────────────────── */}
                <div className="relative">
                    {/* Soaring passenger jet with contrail */}
                    <div className="absolute top-2 right-4 pointer-events-none opacity-90 hidden lg:block">
                        <div className="relative">
                            <svg className="w-64 h-16 overflow-visible" viewBox="0 0 260 60" fill="none">
                                <motion.path
                                    d="M 10 50 Q 120 40, 240 15"
                                    stroke="url(#heroPlaneContrailManager)"
                                    strokeWidth="2"
                                    strokeDasharray="5 5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 0.85 }}
                                    transition={{ duration: 1.6, ease: 'easeOut' }}
                                />
                                <defs>
                                    <linearGradient id="heroPlaneContrailManager" x1="0%" y1="100%" x2="100%" y2="0%">
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

                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-sm mb-4"
                        >
                            CORPORATE FLIGHT DESK • MANAGER AUTHORIZATION HUB
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-3 drop-shadow-md"
                        >
                            Review &amp; Authorize
                            <br />
                            <span className="text-white">Team Travel.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-sm sm:text-base text-white/90 font-medium leading-relaxed max-w-xl"
                        >
                            Verify employee flight itineraries, enforce travel policy compliance, and issue instant authorizations to dispatch tickets.
                        </motion.p>
                    </div>
                </div>

                {/* ── 2. STATS ROW (4 COMPACT CARDS) ─────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
                    {/* Card 1: Awaiting Sign-off */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => { setActiveTab('PENDING'); setSelectedReq(null); }}
                        className={`p-4 sm:p-4.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden bg-white border border-white/80 shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] group select-none ${
                            activeTab === 'PENDING' ? 'border-amber-400 ring-2 ring-amber-100/70 shadow-amber-500/15' : 'hover:border-amber-100 hover:shadow-lg'
                        }`}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                                <Clock className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100/80 flex items-center gap-1 shadow-2xs">
                                <span className={`w-1.5 h-1.5 rounded-full bg-amber-500 ${pendingCount > 0 ? 'animate-ping' : ''}`} />
                                Review
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Awaiting Sign-off
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <p className="text-2xl font-black tracking-tight text-slate-900">
                                    {pendingCount}
                                </p>
                                <span className="text-[11px] font-bold text-amber-600">
                                    {pendingCount > 0 ? 'Action needed' : 'Clear'}
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block truncate">
                                Action required
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 2: Approved */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => { setActiveTab('APPROVED'); setSelectedReq(null); }}
                        className={`p-4 sm:p-4.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden bg-white border border-white/80 shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] group select-none ${
                            activeTab === 'APPROVED' ? 'border-emerald-400 ring-2 ring-emerald-100/70 shadow-emerald-500/15' : 'hover:border-emerald-100 hover:shadow-lg'
                        }`}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100/80 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Approved
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Approved
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <p className="text-2xl font-black tracking-tight text-slate-900">
                                    {approvedCount}
                                </p>
                                <span className="text-[11px] font-bold text-emerald-600">
                                    {approvedCount > 0 ? 'Verified' : 'None'}
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block truncate">
                                Ready for ticketing
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 3: Declined */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => { setActiveTab('REJECTED'); setSelectedReq(null); }}
                        className={`p-4 sm:p-4.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden bg-white border border-white/80 shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] group select-none ${
                            activeTab === 'REJECTED' ? 'border-rose-400 ring-2 ring-rose-100/70 shadow-rose-500/15' : 'hover:border-rose-100 hover:shadow-lg'
                        }`}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform">
                                <XCircle className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100/80 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Declined
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Declined
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <p className="text-2xl font-black tracking-tight text-slate-900">
                                    {rejectedCount}
                                </p>
                                <span className="text-[11px] font-bold text-rose-600">
                                    {rejectedCount > 0 ? 'Logged' : 'None'}
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block truncate">
                                Policy violations
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 4: Action / Visual Analytics */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => setIsGraphPopupOpen(true)}
                        className="p-4 sm:p-4.5 rounded-2xl text-white shadow-lg shadow-rose-950/20 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between group border border-white/20 select-none"
                        style={{
                            background: 'linear-gradient(135deg, #d91456 0%, #cb0f41 45%, #8c1d7e 100%)',
                        }}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-md group-hover:scale-105 transition-transform">
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 border border-white/30 text-white backdrop-blur-md shadow-2xs flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                                <span>Audit</span>
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block">
                                Executive Audit
                            </span>
                            <p className="text-xl sm:text-2xl font-black text-white mt-0.5 leading-tight tracking-tight">
                                Analytics Visualizer
                            </p>
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-white/95 group-hover:underline">
                                <span>Open breakdown charts →</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── 3. MAIN WORKSPACE CARD ──────────────────────────────── */}
                <div id="manager-workspace-card" className="bg-white backdrop-blur-2xl rounded-[2.8rem] p-7 sm:p-10 border border-white/80 shadow-[0_25px_70px_-15px_rgba(20,10,60,0.3)] space-y-8 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {selectedReq ? (
                            /* ══════════════════════════════════════════════════════════ */
                            /* ── VIEW 1: DEDICATED AUTHORIZATION & DECISION PAGE ────── */
                            /* ══════════════════════════════════════════════════════════ */
                            <motion.div
                                key={`review-${selectedReq.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {/* Navigation / Header Bar */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handleBackToList}
                                            className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 text-slate-700 hover:text-[#6541e9] transition-all group flex items-center gap-2 font-bold text-xs border border-slate-200/80 shadow-xs cursor-pointer active:scale-95"
                                        >
                                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                            <span>Back to Itinerary Stream</span>
                                        </button>
                                        <div className="h-5 w-[1px] bg-slate-300 hidden sm:block" />
                                        <div className="hidden sm:block">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Manager Authorization Desk</p>
                                            <p className="text-xs font-extrabold text-slate-700">
                                                Requisitions / {selectedReq.status === 'SUBMITTED' ? 'Pending Review' : selectedReq.status} / <span className="text-[#6541e9]">Ref #{selectedReq.id}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs flex items-center gap-1.5 ${
                                            selectedReq.status === 'APPROVED' || selectedReq.status === 'BOOKED'
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                : selectedReq.status === 'REJECTED'
                                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}>
                                            <span className={`w-2 h-2 rounded-full ${
                                                selectedReq.status === 'APPROVED' || selectedReq.status === 'BOOKED'
                                                    ? 'bg-emerald-500'
                                                    : selectedReq.status === 'REJECTED'
                                                        ? 'bg-rose-500'
                                                        : 'bg-amber-500 animate-pulse'
                                            }`} />
                                            {selectedReq.status === 'APPROVED' || selectedReq.status === 'BOOKED'
                                                ? 'Authorized'
                                                : selectedReq.status === 'REJECTED'
                                                    ? 'Declined'
                                                    : 'Pending Authorization'}
                                        </span>
                                    </div>
                                </div>

                                {/* Dedicated Review 2-Column Spacious Workspace */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    {/* LEFT COLUMN: TRAVELER DOSSIER & ROUTE SUMMARY (7 Cols) */}
                                    <div className="lg:col-span-7 space-y-5">
                                        {/* Passenger Identity Card */}
                                        <div className="bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-slate-50 rounded-2xl p-5 border border-indigo-100/80 flex items-center justify-between">
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6541e9] to-[#0069a3] text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                                                    {(selectedReq.employee?.name || selectedReq.employee?.email || 'EP')
                                                        .split(' ')
                                                        .map(n => n[0])
                                                        .join('')
                                                        .toUpperCase()
                                                        .slice(0, 2)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-extrabold text-slate-900 text-base leading-tight truncate">
                                                            {selectedReq.employee?.name || 'Corporate Employee'}
                                                        </h4>
                                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white text-[#6541e9] border border-indigo-100 shadow-2xs">
                                                            Employee ID: {selectedReq.employee?.id ?? selectedReq.employeeId ?? 'N/A'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium truncate mt-1">
                                                        {selectedReq.employee?.email || 'employee@company.com'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-white text-[#6541e9] border border-indigo-100 shadow-xs shrink-0">
                                                Ref #{selectedReq.id}
                                            </span>
                                        </div>

                                        {/* Detailed Flight Itinerary Card */}
                                        <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                                            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200/60">
                                                <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Flight Route & Schedule</span>
                                                <span className="font-black text-[#6541e9] bg-indigo-50 border border-indigo-100/80 px-2.5 py-1 rounded-lg text-[10px] uppercase">
                                                    {selectedReq.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Origin</p>
                                                    <p className="font-black text-slate-900 text-base sm:text-lg truncate mt-0.5">{selectedReq.fromLocation}</p>
                                                    <p className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-[#6541e9]" />
                                                        <span>{new Date(selectedReq.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </p>
                                                    {selectedReq.preferredTime && (
                                                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                                                            <Clock className="w-3 h-3" />
                                                            <span>Preferred: {selectedReq.preferredTime}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-center px-4 shrink-0">
                                                    <div className="p-2.5 rounded-full bg-white shadow-xs border border-indigo-100">
                                                        <Plane className="w-5 h-5 text-[#6541e9] transform rotate-45" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase mt-1">
                                                        {selectedReq.travelMode || 'Flight'}
                                                    </span>
                                                </div>

                                                <div className="flex-1 min-w-0 text-right">
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Destination</p>
                                                    <p className="font-black text-[#6541e9] text-base sm:text-lg truncate mt-0.5">{selectedReq.toLocation}</p>
                                                    {selectedReq.tripType === 'round-trip' && selectedReq.returnDate && (
                                                        <>
                                                            <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center justify-end gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                                                <span>Ret: {new Date(selectedReq.returnDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            </p>
                                                            {selectedReq.preferredReturnTime && (
                                                                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-end gap-1.5">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span>Preferred: {selectedReq.preferredReturnTime}</span>
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {selectedReq.reasonForTravel && (
                                                <div className="pt-3 border-t border-slate-200/60">
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1.5">Travel Justification</p>
                                                    <p className="text-xs text-slate-700 font-medium italic bg-white p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                                                        "{selectedReq.reasonForTravel}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* RIGHT COLUMN: DECISION PANEL (5 Cols) */}
                                    <div className="lg:col-span-5 space-y-5 sticky top-24">
                                        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90 relative overflow-hidden space-y-5">
                                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                                                <div className="w-2.5 h-6 bg-gradient-to-b from-[#6541e9] to-[#0069a3] rounded-full" />
                                                <div>
                                                    <h3 className="text-base font-black text-slate-900 tracking-tight">Authorization Decision</h3>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Review & Issue Official Clearance</p>
                                                </div>
                                            </div>

                                            {/* Reviewer Comment & Presets */}
                                            <div className="space-y-2.5">
                                                <label className="text-xs font-extrabold text-slate-700 block">
                                                    Manager Authorization Remarks <span className="text-slate-400 font-normal">(Mandatory if declining)</span>
                                                </label>

                                                {/* Preset Chips */}
                                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                                    {commentPresets.map((preset, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setComment(preset)}
                                                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-[#6541e9] transition-colors text-left border border-transparent hover:border-indigo-100 cursor-pointer"
                                                        >
                                                            + {preset}
                                                        </button>
                                                    ))}
                                                </div>

                                                <textarea
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    rows={3}
                                                    placeholder="Add clearance remarks, budget instructions, or justification notes..."
                                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#6541e9] focus:ring-2 focus:ring-indigo-100 outline-none resize-none transition-all"
                                                />
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDecision('REJECTED')}
                                                    disabled={isSubmitting}
                                                    className="py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95 cursor-pointer shadow-xs"
                                                >
                                                    <XCircle className="w-4 h-4 text-rose-600" />
                                                    <span>Decline Trip</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDecision('APPROVED')}
                                                    disabled={isSubmitting}
                                                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95 cursor-pointer"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                    <span>{isSubmitting ? 'Authorizing...' : 'Authorize Flight ✈'}</span>
                                                </button>
                                            </div>

                                            {/* SLA Hint */}
                                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-[#6541e9] shrink-0" />
                                                <span>Approved tickets automatically dispatch to corporate desk for PNR booking.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            /* ══════════════════════════════════════════════════════════ */
                            /* ── VIEW 2: FULL-WIDTH VERTICAL STREAM & EXECUTIVE PULSE ─ */
                            /* ══════════════════════════════════════════════════════════ */
                            <motion.div
                                key="stream-list"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-8"
                            >
                                {/* ── TOP ACTION & FILTER STRIP ── */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-2">
                                    {/* Tabs */}
                                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-none">
                                        <button
                                            onClick={() => { setActiveTab('PENDING'); setSelectedReq(null); }}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                                                activeTab === 'PENDING'
                                                    ? 'bg-white text-[#163c8c] shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            <span>Pending Review</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
                                                {pendingCount}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => { setActiveTab('APPROVED'); setSelectedReq(null); }}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                                                activeTab === 'APPROVED'
                                                    ? 'bg-white text-[#163c8c] shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            <span>Approved</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                                                {approvedCount}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => { setActiveTab('REJECTED'); setSelectedReq(null); }}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                                                activeTab === 'REJECTED'
                                                    ? 'bg-white text-[#163c8c] shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            <span>Rejected</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'}`}>
                                                {rejectedCount}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => { setActiveTab('ALL'); setSelectedReq(null); }}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                                                activeTab === 'ALL'
                                                    ? 'bg-white text-[#163c8c] shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            <span>All Records</span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                                                {requests.length}
                                            </span>
                                        </button>
                                    </div>

                                    {/* Search & Mode Filters */}
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className="relative flex-1 md:w-64">
                                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Filter employee, city, ref..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            />
                                            {searchTerm && (
                                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        <select
                                            value={modeFilter}
                                            onChange={(e) => setModeFilter(e.target.value)}
                                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                                        >
                                            <option value="ALL">All Modes</option>
                                            <option value="Flight">Flights</option>
                                            <option value="Train">Trains</option>
                                            <option value="Cab">Cabs</option>
                                        </select>

                                        <button
                                            onClick={fetchRequests}
                                            title="Sync requests"
                                            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* ── FULL-WIDTH VERTICAL ITINERARY STREAM ── */}
                                <div className="space-y-4">
                                    {/* Header Strip */}
                                    <div className="flex items-center justify-between px-2 pb-1">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-2 h-2 rounded-full bg-[#6541e9] animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#6541e9]">
                                                    Live Requisition Queue
                                                </span>
                                            </div>
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                                                <span>Itinerary Stream</span>
                                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#6541e9] text-xs font-black border border-indigo-100">
                                                    {displayedRequests.length} {displayedRequests.length === 1 ? 'Record' : 'Records'}
                                                </span>
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={fetchRequests}
                                                title="Refresh feed"
                                                className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-[#6541e9] hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
                                            >
                                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                            </button>
                                            <button
                                                onClick={() => navigate('/reports')}
                                                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <span>Team Reports</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200/80 animate-pulse p-6" />
                                            ))}
                                        </div>
                                    ) : displayedRequests.length === 0 ? (
                                        /* Modern Eye-Catching Empty State */
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50/60 to-transparent rounded-full pointer-events-none" />
                                            <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                                                <Plane className="w-10 h-10 text-[#6541e9] transform -rotate-12" />
                                            </div>

                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                                                {activeTab === 'PENDING' ? 'Flight Deck Clear!' : 'No Records Found'}
                                            </h3>
                                            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                                                {activeTab === 'PENDING'
                                                    ? 'All employee travel itineraries have been processed. Zero requests are currently pending manager authorization.'
                                                    : 'There are no travel requests matching your current filter criteria.'}
                                            </p>

                                            <div className="flex flex-wrap items-center justify-center gap-3">
                                                {activeTab === 'PENDING' && approvedCount > 0 && (
                                                    <button
                                                        onClick={() => setActiveTab('APPROVED')}
                                                        className="px-5 py-2.5 rounded-xl bg-[#6541e9] hover:bg-[#5332ce] text-white text-xs font-bold shadow-md shadow-indigo-900/10 transition-all flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>View {approvedCount} Approved Trips</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setIsGraphPopupOpen(true)}
                                                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                                                >
                                                    <TrendingUp className="w-4 h-4 text-slate-500" />
                                                    <span>View Analytics Visualizer</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        /* Full-Width Vertical List of Travel Cards */
                                        <div className="space-y-4">
                                            <AnimatePresence mode="popLayout">
                                                {displayedRequests.map((req) => {
                                                    const isPending = req.status === 'SUBMITTED' || req.status === 'PENDING';
                                                    const isApproved = req.status === 'APPROVED' || req.status === 'BOOKED';
                                                    const isRejected = req.status === 'REJECTED';

                                                    const employeeInitials = (req.employee?.name || req.employee?.email || 'EP')
                                                        .split(' ')
                                                        .map(n => n[0])
                                                        .join('')
                                                        .toUpperCase()
                                                        .slice(0, 2);

                                                    return (
                                                        <motion.div
                                                            key={req.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 15 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            onClick={() => handleSelectRequest(req)}
                                                            className="group relative rounded-3xl bg-white p-5 sm:p-6 transition-all duration-300 cursor-pointer border border-slate-200/90 hover:border-[#6541e9] hover:shadow-xl hover:-translate-y-0.5"
                                                        >
                                                            {/* Top Passenger & Status Strip */}
                                                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6541e9] to-[#0069a3] text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                                                                        {employeeInitials}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                                                                                {req.employee?.name || 'Corporate Employee'}
                                                                            </h4>
                                                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                                                                Ref: #{req.id}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate max-w-[180px] sm:max-w-xs">
                                                                            {req.employee?.email || 'employee@company.com'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Live Status Pill with Glowing Dot */}
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${isPending
                                                                        ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                                                                        : isApproved
                                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                                                            : 'bg-rose-50 text-rose-800 border-rose-200/80'
                                                                        }`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${isPending
                                                                            ? 'bg-amber-500 animate-pulse'
                                                                            : isApproved
                                                                                ? 'bg-emerald-500'
                                                                                : 'bg-rose-500'
                                                                            }`} />
                                                                        <span>{req.status === 'SUBMITTED' ? 'Pending Review' : req.status}</span>
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Flight Route Visualizer with Airport Codes & Contrail */}
                                                            <div className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 rounded-2xl p-4 border border-slate-100/90 mb-4">
                                                                <div className="flex items-center justify-between gap-3">
                                                                    {/* Origin */}
                                                                    <div className="text-left flex-1 min-w-0">
                                                                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                                            <MapPin className="w-3 h-3 text-[#6541e9]" />
                                                                            <span>ORIGIN</span>
                                                                        </div>
                                                                        <p className="font-black text-slate-900 text-sm sm:text-base mt-0.5 truncate">
                                                                            {req.fromLocation}
                                                                        </p>
                                                                    </div>

                                                                    {/* Center Flight Contrail Line */}
                                                                    <div className="flex flex-col items-center px-2 shrink-0">
                                                                        <div className="flex items-center gap-1.5 text-[#6541e9]">
                                                                            <div className="w-6 sm:w-10 h-[2px] bg-gradient-to-r from-indigo-200 to-indigo-400" />
                                                                            <div className="p-1.5 rounded-full bg-white shadow-xs border border-indigo-100">
                                                                                <Plane className="w-3.5 h-3.5 transform rotate-45 text-[#6541e9]" />
                                                                            </div>
                                                                            <div className="w-6 sm:w-10 h-[2px] bg-gradient-to-r from-indigo-400 to-indigo-200" />
                                                                        </div>
                                                                        <span className="text-[9px] font-black text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-full mt-1 uppercase tracking-wider border border-indigo-100">
                                                                            {req.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                                                                        </span>
                                                                    </div>

                                                                    {/* Destination */}
                                                                    <div className="text-right flex-1 min-w-0">
                                                                        <div className="flex items-center justify-end gap-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                                            <PlaneTakeoff className="w-3 h-3 text-[#6541e9]" />
                                                                            <span>DESTINATION</span>
                                                                        </div>
                                                                        <p className="font-black text-[#6541e9] text-sm sm:text-base mt-0.5 truncate">
                                                                            {req.toLocation}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Metadata Strip: Date, Travel Mode & Actions */}
                                                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                                                                <div className="flex items-center gap-3 text-slate-600">
                                                                    <div className="flex items-center gap-1.5 font-bold bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                                                                        <Calendar className="w-3.5 h-3.5 text-[#6541e9]" />
                                                                        <span>{new Date(req.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                                    </div>
                                                                    {req.tripType === 'round-trip' && req.returnDate && (
                                                                        <div className="flex items-center gap-1.5 font-bold bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                                                                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                                                            <span>Ret: {new Date(req.returnDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                                        </div>
                                                                    )}
                                                                    <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-[#6541e9] font-black text-[10px] uppercase">
                                                                        {req.travelMode || 'Flight'}
                                                                    </span>
                                                                </div>

                                                                {/* Action Button */}
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSelectRequest(req);
                                                                        }}
                                                                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-[#6541e9] hover:text-white cursor-pointer shadow-xs active:scale-95"
                                                                    >
                                                                        <span>{isPending ? 'Review & Authorize' : 'View Requisition'}</span>
                                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {req.reasonForTravel && (
                                                                <div className="mt-3 text-[11px] text-slate-500 font-medium truncate bg-slate-50/70 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-1.5">
                                                                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                                    <span className="font-bold text-slate-700">Purpose:</span>
                                                                    <span className="truncate">{req.reasonForTravel}</span>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                {/* ── VERTICAL EXECUTIVE OVERVIEW & STATUS BREAKDOWN ── */}
                                <div className="pt-8 border-t border-slate-100 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2.5 h-6 bg-gradient-to-b from-[#6541e9] to-[#0069a3] rounded-full" />
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Executive Overview</h3>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Requisition Pulse & Operations Status</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsGraphPopupOpen(true)}
                                            className="text-xs font-bold text-[#6541e9] hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            <span>Open Analytics Visualizer</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                                        {/* Card 1: 3-Pill Status Grid */}
                                        <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between space-y-3">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status Distribution</span>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('PENDING')}
                                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${activeTab === 'PENDING' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100' : 'bg-white border-slate-100 hover:border-amber-200'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black uppercase text-amber-700">Pending</span>
                                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                    </div>
                                                    <p className="text-lg font-black text-amber-800 mt-1">{pendingCount}</p>
                                                    <p className="text-[8px] font-bold text-amber-600/80">Review</p>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('APPROVED')}
                                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${activeTab === 'APPROVED' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black uppercase text-emerald-700">Approved</span>
                                                        <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                                    </div>
                                                    <p className="text-lg font-black text-emerald-800 mt-1">{approvedCount}</p>
                                                    <p className="text-[8px] font-bold text-emerald-600/80">Cleared</p>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('REJECTED')}
                                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${activeTab === 'REJECTED' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-100' : 'bg-white border-slate-100 hover:border-rose-200'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black uppercase text-rose-700">Declined</span>
                                                        <XCircle className="w-2.5 h-2.5 text-rose-500" />
                                                    </div>
                                                    <p className="text-lg font-black text-rose-800 mt-1">{rejectedCount}</p>
                                                    <p className="text-[8px] font-bold text-rose-600/80">Revoked</p>
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium text-center">Tap any card to filter feed</p>
                                        </div>

                                        {/* Card 2: Status Breakdown Donut Chart */}
                                        <div className="bg-gradient-to-b from-slate-50/90 to-white rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status Breakdown</span>
                                                <span className="text-[11px] font-black text-[#6541e9]">{requests.length > 0 ? Math.round((approvedCount / requests.length) * 100) : 0}% Cleared</span>
                                            </div>
                                            <div className="h-32 relative flex items-center justify-center">
                                                {overallAnalytics.length > 0 ? (
                                                    <>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={overallAnalytics}
                                                                    innerRadius={38}
                                                                    outerRadius={56}
                                                                    paddingAngle={requests.length > 1 ? 4 : 0}
                                                                    dataKey="value"
                                                                >
                                                                    {overallAnalytics.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '11px', fontWeight: 'bold' }} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                            <span className="text-xl font-black text-slate-900 leading-none">{requests.length}</span>
                                                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 mt-0.5">Total</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center text-xs text-slate-400 font-medium">No records</div>
                                                )}
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden flex">
                                                <div className="h-full bg-emerald-500" style={{ width: `${requests.length > 0 ? (approvedCount / requests.length) * 100 : 0}%` }} />
                                                <div className="h-full bg-amber-400" style={{ width: `${requests.length > 0 ? (pendingCount / requests.length) * 100 : 0}%` }} />
                                                <div className="h-full bg-rose-400" style={{ width: `${requests.length > 0 ? (rejectedCount / requests.length) * 100 : 0}%` }} />
                                            </div>
                                        </div>

                                        {/* Card 3: Corporate Travel Guidelines */}
                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-100/80 flex flex-col justify-between">
                                            <div className="flex items-start gap-2.5">
                                                <div className="p-1.5 rounded-xl bg-white shadow-xs text-[#6541e9] shrink-0 border border-indigo-100/60">
                                                    <ShieldCheck className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-slate-900 text-xs mb-1">Corporate Travel SLA</p>
                                                    <p className="text-[11px] text-slate-600 leading-relaxed">
                                                        Authorized requisitions immediately dispatch to corporate ticketing desk for PNR confirmation within 2 hours.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-2.5 border-t border-blue-100/60 flex items-center justify-between text-[10px] font-bold text-slate-500">
                                                <span>Auto-routing active</span>
                                                <span className="text-[#6541e9] font-black flex items-center gap-0.5">Policy 2026 ✓</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── 4. ANALYTICS VISUALIZER PORTAL (POPUP) ────────────────────── */}
            {isGraphPopupOpen && createPortal(
                <div 
                    className="fixed inset-0 z-[9999999] grid place-items-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-8"
                    onClick={() => setIsGraphPopupOpen(false)}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
                        style={{ maxHeight: '90vh' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Popup Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-[#0b1c4d] via-[#163c8c] to-[#1e40af] text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">Travel Operations Analytics</h3>
                                <p className="text-xs text-blue-200 mt-0.5">Monthly and annual authorization volume breakdown</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-1.5 rounded-xl flex gap-1 border border-white/20">
                                    <button 
                                        onClick={() => setViewType('MONTHLY')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewType === 'MONTHLY' ? 'bg-white text-[#163c8c] shadow-sm' : 'text-white/70 hover:text-white'}`}
                                    >
                                        Monthly
                                    </button>
                                    <button 
                                        onClick={() => setViewType('YEARLY')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewType === 'YEARLY' ? 'bg-white text-[#163c8c] shadow-sm' : 'text-white/70 hover:text-white'}`}
                                    >
                                        Yearly
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setIsGraphPopupOpen(false)}
                                    className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white text-white hover:text-slate-900 transition-all font-bold text-sm flex items-center justify-center"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Month/Year Navigation */}
                        <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => changeMonth(-1)}
                                    disabled={viewType === 'YEARLY'}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 shadow-xs transition-all ${viewType === 'YEARLY' ? 'opacity-30' : 'hover:bg-blue-50 hover:text-[#163c8c]'}`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div>
                                    <p className="text-base font-extrabold text-slate-900 leading-tight">
                                        {viewType === 'MONTHLY' ? `${monthNames[selectedMonth]} ${selectedYear}` : `Annual ${selectedYear}`}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => changeMonth(1)}
                                    disabled={viewType === 'YEARLY'}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 shadow-xs transition-all ${viewType === 'YEARLY' ? 'opacity-30' : 'hover:bg-blue-50 hover:text-[#163c8c]'}`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <select 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none shadow-xs"
                            >
                                {Array.from({ length: 2030 - 2024 + 1 }, (_, i) => 2024 + i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        {/* Body Content */}
                        <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col items-center justify-center min-h-[300px]">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 self-start">
                                        Volume Ratio
                                    </h4>
                                    {currentAnalytics.length > 0 ? (
                                        <div className="w-full h-56">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={currentAnalytics}
                                                        innerRadius={55}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {currentAnalytics.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                                    />
                                                    <Legend 
                                                        verticalAlign="bottom"
                                                        formatter={(value) => <span className="text-slate-700 text-xs font-bold uppercase">{value}</span>}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="text-center text-xs text-slate-400">
                                            No travel records for this period.
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Period Breakdown
                                    </h4>
                                    {currentAnalytics.length > 0 ? (
                                        currentAnalytics.map((item, idx) => {
                                            const total = currentAnalytics.reduce((s, c) => s + c.value, 0);
                                            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                                            return (
                                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-900">{item.name}</p>
                                                            <p className="text-[10px] text-slate-400">{item.value} {item.value === 1 ? 'request' : 'requests'}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                                                        {pct}%
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="bg-white p-6 rounded-xl border border-slate-200/80 text-center text-xs text-slate-400">
                                            Zero activity for this date window.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ManagerDashboard;
