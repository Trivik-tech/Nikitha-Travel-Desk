import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
    IndianRupee, 
    Users, 
    PlaneTakeoff, 
    TrendingUp, 
    Calendar as CalIcon, 
    FileText, 
    Download, 
    Filter, 
    ChevronRight, 
    MapPin,
    ArrowRight,
    ArrowLeft,
    Zap,
    History,
    Sparkles,
    ShieldCheck,
    Maximize2,
    CalendarDays,
    Clock,
    X
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

const Reports = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('month');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [filterQuarter, setFilterQuarter] = useState('Q1');
    const [fromMonth, setFromMonth] = useState('');
    const [toMonth, setToMonth] = useState('');
    const [expandedChart, setExpandedChart] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const res = await api.get('/requests');
                setRequests(res.data || []);
            } catch (error) {
                console.error('Failed to fetch requests', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const bookedRequests = requests.filter(r => r.status === 'BOOKED');

    const filteredRequests = bookedRequests.filter(req => {
        if (!req.departureDate) return false;
        const reqMonth = req.departureDate.substring(0, 7);
        const reqYearStr = req.departureDate.substring(0, 4);
        const monthNum = parseInt(req.departureDate.substring(5, 7), 10);

        if (filterType === 'month') {
            if (!filterMonth) return true;
            return reqMonth === filterMonth;
        } else if (filterType === 'quarter') {
            if (!filterYear || !filterQuarter) return true;
            if (reqYearStr !== filterYear) return false;
            if (filterQuarter === 'Q1') return monthNum >= 1 && monthNum <= 3;
            if (filterQuarter === 'Q2') return monthNum >= 4 && monthNum <= 6;
            if (filterQuarter === 'Q3') return monthNum >= 7 && monthNum <= 9;
            if (filterQuarter === 'Q4') return monthNum >= 10 && monthNum <= 12;
            return true;
        } else if (filterType === 'range') {
            if (!fromMonth || !toMonth) return true;
            return reqMonth >= fromMonth && reqMonth <= toMonth;
        } else {
            if (!filterYear) return true;
            return reqYearStr === filterYear;
        }
    });

    const totalCost = filteredRequests.reduce((sum, req) => sum + (req.cost || 0), 0);
    const totalEmployeesTraveled = new Set(filteredRequests.map(r => r.employee?.id).filter(Boolean)).size;
    const totalTrips = filteredRequests.length;

    const handleExport = () => {
        if (filteredRequests.length === 0) return;
        
        const periodLabel = filterType === 'month'
            ? (filterMonth ? new Date(filterMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'All Months')
            : (filterType === 'range'
                ? `${new Date(fromMonth + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} to ${new Date(toMonth + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`
                : (filterType === 'quarter' ? `${filterQuarter} ${filterYear}` : `Full Year ${filterYear}`));

        // Title row
        const titleRow = [`NIKITHA TRAVEL REQUEST - FINANCIAL LEDGER REPORT (${periodLabel})`, '', '', '', '', '', '', '', ''];

        // Headers
        const headers = [
            'Employee ID',
            'Employee Name',
            'From (City)',
            'To (City)',
            'Departure Date',
            'Return Date',
            'Travel Mode',
            'Trip Type',
            'Amount (INR)'
        ];

        // Data rows
        const rows = filteredRequests.map(req => [
            req.employee?.id ?? 'N/A',
            req.employee?.name ?? 'N/A',
            req.fromLocation ?? 'N/A',
            req.toLocation ?? 'N/A',
            req.departureDate ? new Date(req.departureDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
            req.returnDate ? new Date(req.returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
            req.travelMode ?? 'N/A',
            req.tripType === 'round-trip' ? 'Round Trip' : 'One Way',
            req.cost ?? 0
        ]);

        // Total row
        const totalRow = ['', '', '', '', '', '', '', 'TOTAL', totalCost];

        // Assemble worksheet data
        const wsData = [titleRow, headers, ...rows, [], totalRow];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        ws['!cols'] = [
            { wch: 14 },  // Employee ID
            { wch: 22 },  // Employee Name
            { wch: 30 },  // From
            { wch: 30 },  // To
            { wch: 18 },  // Departure Date
            { wch: 18 },  // Return Date
            { wch: 14 },  // Travel Mode
            { wch: 13 },  // Trip Type
            { wch: 18 },  // Amount
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Financial Ledger');

        const filename = `Financial_Ledger_${filterType === 'month' ? (filterMonth || 'all') : (filterType === 'range' ? `${fromMonth}_to_${toMonth}` : filterYear)}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    // Curated Executive Color Palettes
    const MODE_COLORS = {
        FLIGHT: '#6366f1',  // Indigo
        TRAIN: '#f59e0b',   // Warm Amber
        BUS: '#10b981',     // Fresh Emerald
        CAB: '#06b6d4',     // Cyan
        CAR: '#0ea5e9',     // Sky
    };

    const TRAVELER_PALETTE = ['#cb0f41', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

    const OPERATION_COLORS = {
        'One Way': '#10b981',     // Emerald
        'Round Trip': '#6366f1',  // Indigo
        'Multi City': '#f59e0b',  // Amber
    };

    const getModeColor = (mode = '', idx = 0) => {
        const key = String(mode).toUpperCase();
        return MODE_COLORS[key] || TRAVELER_PALETTE[idx % TRAVELER_PALETTE.length];
    };

    const getTravelerColor = (idx = 0) => {
        return TRAVELER_PALETTE[idx % TRAVELER_PALETTE.length];
    };

    const getOperationColor = (op = '', idx = 0) => {
        return OPERATION_COLORS[op] || TRAVELER_PALETTE[(idx + 2) % TRAVELER_PALETTE.length];
    };

    const COLORS = TRAVELER_PALETTE;

    const expenditureByMode = {};
    filteredRequests.forEach(req => {
        const mode = req.travelMode || 'Unknown';
        expenditureByMode[mode] = (expenditureByMode[mode] || 0) + (req.cost || 0);
    });
    const pieDataExpenditure = Object.keys(expenditureByMode).map(key => ({ name: key, value: expenditureByMode[key] })).filter(x => x.value > 0);

    const tripsByTraveler = {};
    filteredRequests.forEach(req => {
        const name = req.employee?.name || 'Unknown User';
        tripsByTraveler[name] = (tripsByTraveler[name] || 0) + 1;
    });
    const sortedTravelers = Object.entries(tripsByTraveler).sort((a,b) => b[1] - a[1]);
    const topTravelers = sortedTravelers.slice(0, 4);
    const others = sortedTravelers.slice(4).reduce((sum, curr) => sum + curr[1], 0);
    const pieDataTravelers = topTravelers.map(([name, value]) => ({ name, value }));
    if (others > 0) pieDataTravelers.push({ name: 'Others', value: others });

    const operationsByType = {};
    filteredRequests.forEach(req => {
        const type = req.tripType === 'round-trip' ? 'Round Trip' : 'One Way';
        operationsByType[type] = (operationsByType[type] || 0) + 1;
    });
    const pieDataOperations = Object.keys(operationsByType).map(key => ({ name: key, value: operationsByType[key] })).filter(x => x.value > 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const item = payload[0];
            const isCurrency = typeof item.value === 'number' && item.value >= 100;
            const sliceColor = item.payload?.fill || item.color || '#6366f1';
            return (
                <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-white/10 text-white min-w-[130px] z-50">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: sliceColor }} />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <p className="text-white font-black text-base tracking-tight leading-tight">
                        {isCurrency ? `₹ ${item.value.toLocaleString('en-IN')}` : `${item.value.toLocaleString('en-IN')}`}
                    </p>
                </div>
            );
        }
        return null;
    };

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
                    <radialGradient id="starGleamReports" cx="50%" cy="50%" r="50%">
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
                    key={`reports-sparkle-${idx}`}
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
                            fill="url(#starGleamReports)"
                        />
                        <circle cx="12" cy="12" r="3" fill="#ffffff" />
                    </svg>
                </motion.div>
            ))}

            {/* 2. Twinkling Night Sky Stars */}
            {TWINKLE_STARS.map((star, idx) => (
                <motion.div
                    key={`reports-twinkle-${idx}`}
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
                {/* ── 1. CORPORATE FINANCIAL HERO HEADER ───────────────────── */}
                <div className="relative">
                    {/* Soaring passenger jet with smooth gliding contrail */}
                    <div className="absolute top-2 right-4 pointer-events-none opacity-90 hidden lg:block">
                        <div className="relative">
                            <svg className="w-64 h-16 overflow-visible" viewBox="0 0 260 60" fill="none">
                                <motion.path
                                    d="M 10 50 Q 120 40, 240 15"
                                    stroke="url(#heroPlaneContrailReports)"
                                    strokeWidth="2"
                                    strokeDasharray="5 5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 0.85 }}
                                    transition={{ duration: 1.6, ease: 'easeOut' }}
                                />
                                <defs>
                                    <linearGradient id="heroPlaneContrailReports" x1="0%" y1="100%" x2="100%" y2="0%">
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
                            onClick={() => navigate(user?.role === 'ROLE_ADMIN' ? '/admin' : '/manager')}
                            whileHover={{ x: -3 }}
                            whileTap={{ scale: 0.96 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/25 shadow-md cursor-pointer group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                            <span>Return to {user?.role === 'ROLE_ADMIN' ? 'Admin Console' : 'Manager Console'}</span>
                        </motion.button>
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        {/* Left Column: Heading & Subtitle */}
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-white shadow-sm mb-4"
                            >
                                <TrendingUp className="w-4 h-4 text-emerald-300" />
                                <span>Nikitha Travel Request • Corporate Financial Intelligence</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-3 drop-shadow-md"
                            >
                                Financial &amp; Mobility
                                <br />
                                <span className="text-white">Analytics.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-sm sm:text-base text-white/90 font-medium leading-relaxed max-w-xl"
                            >
                                Strategic expenditure tracking and company-wide mobility trends. Maintain total visibility of corporate budgets and settlement records.
                            </motion.p>
                        </div>

                        {/* Right Column: Reporting Node Period Selection Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white/15 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/25 shadow-2xl w-full lg:max-w-md"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-white/15 rounded-xl border border-white/20">
                                        <CalIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-white/80">Reporting Node</p>
                                        <p className="text-white font-bold text-xs tracking-tight">Active Period Selection</p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/25 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-400/40">
                                    Live Filter
                                </span>
                            </div>

                            {/* Period Filter Tabs */}
                            <div className="grid grid-cols-4 gap-1 p-1 bg-black/25 rounded-2xl mb-4 border border-white/10">
                                {[
                                    { id: 'month', label: 'Month' },
                                    { id: 'quarter', label: 'Quarter' },
                                    { id: 'range', label: 'Range' },
                                    { id: 'year', label: 'Year' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setFilterType(tab.id)}
                                        className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            filterType === tab.id
                                                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                                                : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Dynamic Period Inputs */}
                            {filterType === 'month' && (
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-white/80 pl-1">
                                        Select Month
                                    </label>
                                    <input
                                        type="month"
                                        value={filterMonth}
                                        onChange={(e) => setFilterMonth(e.target.value)}
                                        className="w-full bg-white/15 text-white border border-white/25 px-4 py-2.5 rounded-2xl outline-none font-bold text-sm cursor-pointer focus:bg-white/25 focus:border-white transition-all"
                                    />
                                </div>
                            )}

                            {filterType === 'quarter' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                        className="bg-white/15 text-white border border-white/25 px-3 py-2 rounded-2xl outline-none font-bold text-sm cursor-pointer focus:bg-white/25 transition-all"
                                    >
                                        {[2024, 2025, 2026, 2027].map(y => (
                                            <option key={y} value={y} className="text-slate-900">{y}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filterQuarter}
                                        onChange={(e) => setFilterQuarter(e.target.value)}
                                        className="bg-white/15 text-white border border-white/25 px-3 py-2 rounded-2xl outline-none font-bold text-sm cursor-pointer focus:bg-white/25 transition-all"
                                    >
                                        <option value="Q1" className="text-slate-900">Q1 (Jan - Mar)</option>
                                        <option value="Q2" className="text-slate-900">Q2 (Apr - Jun)</option>
                                        <option value="Q3" className="text-slate-900">Q3 (Jul - Sep)</option>
                                        <option value="Q4" className="text-slate-900">Q4 (Oct - Dec)</option>
                                    </select>
                                </div>
                            )}

                            {filterType === 'range' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="block text-[10px] font-black uppercase tracking-wider text-white/80 pl-1 mb-1">From</span>
                                        <input
                                            type="month"
                                            value={fromMonth}
                                            onChange={(e) => setFromMonth(e.target.value)}
                                            className="w-full bg-white/15 text-white border border-white/25 px-3 py-2 rounded-2xl outline-none font-bold text-xs cursor-pointer focus:bg-white/25 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black uppercase tracking-wider text-white/80 pl-1 mb-1">To</span>
                                        <input
                                            type="month"
                                            value={toMonth}
                                            onChange={(e) => setToMonth(e.target.value)}
                                            className="w-full bg-white/15 text-white border border-white/25 px-3 py-2 rounded-2xl outline-none font-bold text-xs cursor-pointer focus:bg-white/25 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {filterType === 'year' && (
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-white/80 pl-1">
                                        Fiscal Year
                                    </label>
                                    <select
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                        className="w-full bg-white/15 text-white border border-white/25 px-4 py-2.5 rounded-2xl outline-none font-bold text-sm cursor-pointer focus:bg-white/25 transition-all"
                                    >
                                        {[2024, 2025, 2026, 2027].map(y => (
                                            <option key={y} value={y} className="text-slate-900">{y}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* ── 2. STATS ROW (4 COMPACT CARDS) ─────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
                    {/* Card 1: Gross Spend */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="p-4 sm:p-4.5 rounded-2xl bg-white transition-all duration-300 relative overflow-hidden shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] border border-white/80 group select-none"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                                <IndianRupee className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100/80 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Budget
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Gross Spend
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    ₹ {totalCost.toLocaleString('en-IN', { notation: "compact", maximumFractionDigits: 1 })}
                                </p>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block truncate">
                                Fulfillment value
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 2: Active Travelers */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="p-4 sm:p-4.5 rounded-2xl bg-white transition-all duration-300 relative overflow-hidden shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] border border-white/80 group select-none"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#6541e9] text-white flex items-center justify-center shadow-md shadow-[#6541e9]/25 group-hover:scale-105 transition-transform">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-[#6541e9] border border-indigo-100/80 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#6541e9]" />
                                Travelers
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Active Travelers
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {totalEmployeesTraveled}
                                </p>
                                <span className="text-[11px] font-bold text-indigo-600">
                                    pax
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block truncate">
                                Unique personnel
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 3: Total Operations */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="p-4 sm:p-4.5 rounded-2xl bg-white transition-all duration-300 relative overflow-hidden shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] border border-white/80 group select-none"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform">
                                <PlaneTakeoff className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-100/80 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                Itineraries
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Total Operations
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {totalTrips}
                                </p>
                                <span className="text-[11px] font-bold text-teal-600">
                                    trips
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block truncate">
                                Executed itineraries
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 4: Export Report Action */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={handleExport}
                        className="p-4 sm:p-4.5 rounded-2xl text-white shadow-lg shadow-rose-950/20 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between group border border-white/20 select-none"
                        style={{
                            background: 'linear-gradient(135deg, #d91456 0%, #cb0f41 45%, #8c1d7e 100%)',
                        }}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-md group-hover:scale-105 transition-transform">
                                <Download className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 border border-white/30 text-white backdrop-blur-md shadow-2xs flex items-center gap-1">
                                Excel
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block">
                                Financial Ledger
                            </span>
                            <p className="text-xl sm:text-2xl font-black text-white mt-0.5 leading-tight tracking-tight">
                                Export Report
                            </p>
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-white/95 group-hover:underline">
                                <span>Download Excel (.xlsx) →</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-[#0069a3] rounded-full animate-spin" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Financial Analytics...</p>
                </div>
            ) : (
                <>
                    {/* ── 2. VISUAL INTELLIGENCE KPI CARDS (3 INTERACTIVE CHARTS) ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1: Gross Expenditure by Travel Mode */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            onClick={() => pieDataExpenditure.length > 0 && setExpandedChart('expenditure')} 
                            className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/90 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                        >
                            {/* Subtle Ambient Glow */}
                            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                            <div className="flex items-center justify-between mb-2 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-[#6366f1] group-hover:scale-105 transition-transform shadow-xs">
                                        <IndianRupee className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gross Expenditure</p>
                                        <p className="font-bold text-xs text-slate-800">by Travel Mode</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                                        ₹ {totalCost.toLocaleString('en-IN', { notation: "compact", maximumFractionDigits: 1 })}
                                    </h2>
                                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 group-hover:text-[#6366f1] font-bold transition-colors">
                                        <Maximize2 className="w-2.5 h-2.5" /> Expand
                                    </span>
                                </div>
                            </div>

                            {/* Chart Area with Central Stat */}
                            <div className="relative flex-1 flex items-center justify-center min-h-[190px] my-1">
                                {pieDataExpenditure.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={190}>
                                            <PieChart>
                                                <Pie 
                                                    data={pieDataExpenditure} 
                                                    innerRadius={54} 
                                                    outerRadius={76} 
                                                    paddingAngle={pieDataExpenditure.length > 1 ? 4 : 0} 
                                                    cornerRadius={pieDataExpenditure.length > 1 ? 6 : 0}
                                                    dataKey="value" 
                                                    stroke="#ffffff"
                                                    strokeWidth={2}
                                                >
                                                    {pieDataExpenditure.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getModeColor(entry.name, index)} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>

                                        {/* Center Stat Badge */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                            <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 text-[#6366f1] flex items-center justify-center mb-0.5 shadow-2xs">
                                                <IndianRupee className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-base font-black text-slate-900 tracking-tight leading-none">
                                                ₹{totalCost.toLocaleString('en-IN', { notation: "compact", maximumFractionDigits: 1 })}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
                                                Total Spend
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-8">
                                        <IndianRupee className="w-8 h-8 text-slate-200" />
                                        <p className="font-bold uppercase tracking-wider text-xs text-slate-300">No Expenditure Data</p>
                                    </div>
                                )}
                            </div>

                            {/* Modern Interactive Legend Chips */}
                            {pieDataExpenditure.length > 0 && (
                                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5 relative z-10">
                                    {pieDataExpenditure.map((item, idx) => {
                                        const pct = totalCost > 0 ? Math.round((item.value / totalCost) * 100) : 100;
                                        const color = getModeColor(item.name, idx);
                                        return (
                                            <div 
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors text-[11px] font-bold text-slate-700"
                                            >
                                                <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }} />
                                                <span className="capitalize">{item.name}</span>
                                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-white text-slate-600 shadow-2xs border border-slate-100">
                                                    {pct}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>

                        {/* Card 2: Unique Travelers Pie Chart */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.1 }} 
                            onClick={() => pieDataTravelers.length > 0 && setExpandedChart('travelers')} 
                            className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/90 hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                        >
                            {/* Subtle Ambient Glow */}
                            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                            <div className="flex items-center justify-between mb-2 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 text-[#cb0f41] group-hover:scale-105 transition-transform shadow-xs">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Unique Travelers</p>
                                        <p className="font-bold text-xs text-slate-800">Top 5 by Volume</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                                        {totalEmployeesTraveled} <span className="text-xs text-slate-400 font-bold">Pax</span>
                                    </h2>
                                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 group-hover:text-[#cb0f41] font-bold transition-colors">
                                        <Maximize2 className="w-2.5 h-2.5" /> Expand
                                    </span>
                                </div>
                            </div>

                            {/* Chart Area with Central Stat */}
                            <div className="relative flex-1 flex items-center justify-center min-h-[190px] my-1">
                                {pieDataTravelers.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={190}>
                                            <PieChart>
                                                <Pie 
                                                    data={pieDataTravelers} 
                                                    innerRadius={54} 
                                                    outerRadius={76} 
                                                    paddingAngle={pieDataTravelers.length > 1 ? 4 : 0} 
                                                    cornerRadius={pieDataTravelers.length > 1 ? 6 : 0}
                                                    dataKey="value" 
                                                    stroke="#ffffff"
                                                    strokeWidth={2}
                                                >
                                                    {pieDataTravelers.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getTravelerColor(index)} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>

                                        {/* Center Stat Badge */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                            <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-100 text-[#cb0f41] flex items-center justify-center mb-0.5 shadow-2xs">
                                                <Users className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-base font-black text-slate-900 tracking-tight leading-none">
                                                {totalEmployeesTraveled}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
                                                {totalEmployeesTraveled === 1 ? 'Traveler' : 'Travelers'}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-8">
                                        <Users className="w-8 h-8 text-slate-200" />
                                        <p className="font-bold uppercase tracking-wider text-xs text-slate-300">No Traveler Data</p>
                                    </div>
                                )}
                            </div>

                            {/* Modern Interactive Legend Chips */}
                            {pieDataTravelers.length > 0 && (
                                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5 relative z-10">
                                    {pieDataTravelers.map((item, idx) => {
                                        const totalTravelerTrips = pieDataTravelers.reduce((s, x) => s + x.value, 0);
                                        const pct = totalTravelerTrips > 0 ? Math.round((item.value / totalTravelerTrips) * 100) : 100;
                                        const color = getTravelerColor(idx);
                                        return (
                                            <div 
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors text-[11px] font-bold text-slate-700"
                                            >
                                                <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }} />
                                                <span className="truncate max-w-[110px]">{item.name}</span>
                                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-white text-slate-600 shadow-2xs border border-slate-100">
                                                    {item.value} {item.value === 1 ? 'trip' : 'trips'} ({pct}%)
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>

                        {/* Card 3: Total Operations Pie Chart */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.2 }} 
                            onClick={() => pieDataOperations.length > 0 && setExpandedChart('operations')} 
                            className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/90 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                        >
                            {/* Subtle Ambient Glow */}
                            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                            <div className="flex items-center justify-between mb-2 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform shadow-xs">
                                        <PlaneTakeoff className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Operations</p>
                                        <p className="font-bold text-xs text-slate-800">by Trip Iteration</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                                        {totalTrips} <span className="text-xs text-slate-400 font-bold">Trips</span>
                                    </h2>
                                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">
                                        <Maximize2 className="w-2.5 h-2.5" /> Expand
                                    </span>
                                </div>
                            </div>

                            {/* Chart Area with Central Stat */}
                            <div className="relative flex-1 flex items-center justify-center min-h-[190px] my-1">
                                {pieDataOperations.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={190}>
                                            <PieChart>
                                                <Pie 
                                                    data={pieDataOperations} 
                                                    innerRadius={54} 
                                                    outerRadius={76} 
                                                    paddingAngle={pieDataOperations.length > 1 ? 4 : 0} 
                                                    cornerRadius={pieDataOperations.length > 1 ? 6 : 0}
                                                    dataKey="value" 
                                                    stroke="#ffffff"
                                                    strokeWidth={2}
                                                >
                                                    {pieDataOperations.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getOperationColor(entry.name, index)} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>

                                        {/* Center Stat Badge */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                            <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-0.5 shadow-2xs">
                                                <PlaneTakeoff className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-base font-black text-slate-900 tracking-tight leading-none">
                                                {totalTrips}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
                                                {totalTrips === 1 ? 'Trip' : 'Trips'}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-8">
                                        <PlaneTakeoff className="w-8 h-8 text-slate-200" />
                                        <p className="font-bold uppercase tracking-wider text-xs text-slate-300">No Operations Data</p>
                                    </div>
                                )}
                            </div>

                            {/* Modern Interactive Legend Chips */}
                            {pieDataOperations.length > 0 && (
                                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5 relative z-10">
                                    {pieDataOperations.map((item, idx) => {
                                        const pct = totalTrips > 0 ? Math.round((item.value / totalTrips) * 100) : 100;
                                        const color = getOperationColor(item.name, idx);
                                        return (
                                            <div 
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors text-[11px] font-bold text-slate-700"
                                            >
                                                <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }} />
                                                <span>{item.name}</span>
                                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-white text-slate-600 shadow-2xs border border-slate-100">
                                                    {item.value} ({pct}%)
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* ── 3. FINANCIAL LEDGER & AUDIT TRAIL TABLE ───────────────── */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/90 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Financial Ledger & Audit Trail</h2>
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200">
                                        {filteredRequests.length} {filteredRequests.length === 1 ? 'record' : 'records'}
                                    </span>
                                </div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                                    Enterprise Fulfillment Breakdown with Verified Booking Costs
                                </p>
                            </div>

                            {/* Export Intelligence Action Button */}
                            <motion.button 
                                onClick={handleExport}
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
                                style={{
                                    background: 'linear-gradient(120deg, #cb0f41 0%, #d8164b 25%, #852278 55%, #0069a3 85%, #0284c7 100%)',
                                    boxShadow: '0 8px 20px -4px rgba(203, 15, 65, 0.35), 0 6px 15px -4px rgba(0, 105, 163, 0.3)',
                                }}
                            >
                                <Download className="w-4 h-4" />
                                <span>Export Intelligence</span>
                            </motion.button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                        <th className="px-8 py-4">Traveler & Associate</th>
                                        <th className="px-6 py-4 text-center">Itinerary Route</th>
                                        <th className="px-6 py-4 text-center">Travel Mode & Type</th>
                                        <th className="px-8 py-4 text-right">Settlement Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-24 text-center">
                                                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-800 mb-1">Zero Records Found</h4>
                                                <p className="text-xs text-slate-500 font-medium">Verify your selected reporting period or clear the filter.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((req) => (
                                            <motion.tr 
                                                key={req.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-slate-50/70 transition-colors group"
                                            >
                                                {/* Column 1: Traveler */}
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0069a3] to-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm group-hover:scale-105 transition-transform">
                                                            {req.employee?.name?.[0] || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm tracking-tight leading-snug">
                                                                {req.employee?.name || 'Unknown'}
                                                            </p>
                                                            <p className="text-xs text-slate-400 font-medium">
                                                                ID: {req.employee?.id ?? req.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Column 2: Route */}
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <div className="inline-flex items-center gap-3 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-200/80">
                                                            <span className="font-bold text-slate-800 text-xs">{req.fromLocation}</span>
                                                            <ArrowRight className="w-3.5 h-3.5 text-[#0069a3]" />
                                                            <span className="font-bold text-[#0069a3] text-xs">{req.toLocation}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                                                            <CalIcon className="w-3 h-3" />
                                                            <span>
                                                                {new Date(req.departureDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Column 3: Mode / Type */}
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[11px] font-bold text-[#0069a3] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                                                            {req.travelMode || 'Flight'}
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-slate-400 capitalize">
                                                            {req.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Column 4: Settlement */}
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <p className="text-lg font-black text-slate-900 tracking-tight">
                                                            ₹ {req.cost?.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                                        </p>
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-0.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            Liquidated
                                                        </span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="bg-slate-900 text-white">
                                    <tr className="font-black">
                                        <td colSpan="3" className="px-8 py-5 text-sm uppercase tracking-wider">
                                            Total Fiscal Corporate Expenditure
                                        </td>
                                        <td className="px-8 py-5 text-right text-2xl tracking-tight text-white font-black">
                                            ₹ {totalCost.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </>
            )}
            </div>

            {/* ── 4. EXPANDED CHART MODAL ─────────────────────────────────── */}
            {expandedChart && createPortal(
                <div 
                    className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4" 
                    onClick={() => setExpandedChart(null)}
                >
                    <div 
                        className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10 transition-all flex flex-col md:flex-row gap-8 items-center border border-slate-100" 
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setExpandedChart(null)}
                            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600 font-bold z-50 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex-1 w-full">
                            <div className="mb-6 text-center">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
                                    {expandedChart === 'expenditure' && 'Gross Expenditure Breakdown'}
                                    {expandedChart === 'travelers' && 'Unique Traveler Density'}
                                    {expandedChart === 'operations' && 'Operations by Trip Iteration'}
                                </h2>
                                <p className="text-[#0069a3] font-bold uppercase tracking-wider text-xs">Detailed Visual Analysis</p>
                            </div>
                            
                            <div className="h-[360px] w-full relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={
                                                expandedChart === 'expenditure' ? pieDataExpenditure : 
                                                expandedChart === 'travelers' ? pieDataTravelers : 
                                                pieDataOperations
                                            } 
                                            innerRadius={85} 
                                            outerRadius={130} 
                                            paddingAngle={(expandedChart === 'expenditure' ? pieDataExpenditure : expandedChart === 'travelers' ? pieDataTravelers : pieDataOperations).length > 1 ? 4 : 0} 
                                            cornerRadius={(expandedChart === 'expenditure' ? pieDataExpenditure : expandedChart === 'travelers' ? pieDataTravelers : pieDataOperations).length > 1 ? 6 : 0}
                                            dataKey="value" 
                                            stroke="#ffffff"
                                            strokeWidth={2.5}
                                        >
                                            {(expandedChart === 'expenditure' ? pieDataExpenditure : expandedChart === 'travelers' ? pieDataTravelers : pieDataOperations).map((entry, index) => {
                                                const sliceColor = 
                                                    expandedChart === 'expenditure' ? getModeColor(entry.name, index) : 
                                                    expandedChart === 'travelers' ? getTravelerColor(index) : 
                                                    getOperationColor(entry.name, index);
                                                return <Cell key={`cell-${index}`} fill={sliceColor} />;
                                            })}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Expanded Donut Center Badge */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                    <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                                        {expandedChart === 'expenditure' && `₹${totalCost.toLocaleString('en-IN', { notation: "compact", maximumFractionDigits: 1 })}`}
                                        {expandedChart === 'travelers' && totalEmployeesTraveled}
                                        {expandedChart === 'operations' && totalTrips}
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 mt-1">
                                        {expandedChart === 'expenditure' && 'Total Spend'}
                                        {expandedChart === 'travelers' && (totalEmployeesTraveled === 1 ? 'Traveler' : 'Travelers')}
                                        {expandedChart === 'operations' && (totalTrips === 1 ? 'Trip' : 'Trips')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-[360px] flex flex-col h-[420px]">
                            <div className="bg-slate-50 rounded-3xl p-6 h-full flex flex-col border border-slate-100">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 text-center bg-white py-2 rounded-xl shadow-xs border border-slate-100">
                                    Itemized Breakdown
                                </h3>
                                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
                                    {(expandedChart === 'expenditure' ? pieDataExpenditure : expandedChart === 'travelers' ? pieDataTravelers : pieDataOperations).map((item, idx) => {
                                        const totalVal = 
                                            expandedChart === 'expenditure' ? totalCost :
                                            expandedChart === 'travelers' ? pieDataTravelers.reduce((s, x) => s + x.value, 0) :
                                            totalTrips;
                                        const pct = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 100;
                                        const itemColor = 
                                            expandedChart === 'expenditure' ? getModeColor(item.name, idx) : 
                                            expandedChart === 'travelers' ? getTravelerColor(idx) : 
                                            getOperationColor(item.name, idx);

                                        return (
                                            <div key={idx} className="flex items-center justify-between p-3.5 bg-white rounded-xl shadow-xs border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: itemColor }} />
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-xs truncate max-w-[130px]">{item.name}</p>
                                                        <span className="text-[10px] font-bold text-slate-400">{pct}% share</span>
                                                    </div>
                                                </div>
                                                <p className="font-black text-slate-900 tracking-tight text-sm whitespace-nowrap">
                                                    {expandedChart === 'expenditure' ? `₹ ${item.value.toLocaleString('en-IN')}` : `${item.value.toLocaleString('en-IN')} trips`}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Reports;
