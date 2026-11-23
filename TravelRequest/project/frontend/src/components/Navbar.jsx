import { useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LogOut, 
    Plane, 
    FileBarChart, 
    Zap, 
    User, 
    Menu, 
    X, 
    Bell, 
    CheckCircle, 
    CheckCircle2, 
    XCircle, 
    Ticket, 
    BarChart2, 
    Download, 
    Clock, 
    Sparkles, 
    ShieldCheck, 
    Calendar, 
    MapPin, 
    Train, 
    Bus, 
    Car, 
    IndianRupee, 
    ArrowRight,
    LayoutDashboard,
    PlaneTakeoff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import * as XLSX from 'xlsx';

// ── Modal Header Star Sparkles & Twinkles ──────────────────────────────────────
const POPUP_SPARKLES = [
    { top: '22%', left: '12%', size: 14, duration: 5.5, delay: 0 },
    { top: '35%', left: '76%', size: 16, duration: 6.5, delay: 1.5 },
    { top: '68%', left: '90%', size: 13, duration: 5.8, delay: 2.2 },
    { top: '72%', left: '26%', size: 15, duration: 6.0, delay: 0.8 },
];

const POPUP_TWINKLES = [
    { top: '18%', left: '46%', size: 3, duration: 4.5, delay: 0.5 },
    { top: '52%', left: '8%', size: 4, duration: 5.5, delay: 1.8 },
    { top: '28%', left: '86%', size: 3, duration: 4.8, delay: 2.4 },
    { top: '75%', left: '62%', size: 3, duration: 5.2, delay: 1.2 },
];

const roleColors = {
    ROLE_ADMIN: { bg: 'from-violet-500 to-purple-600', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    ROLE_MANAGER: { bg: 'from-blue-500 to-indigo-600', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    ROLE_EMPLOYEE: { bg: 'from-amber-400 to-orange-500', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
};

const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// ── Manager Stats Panel (manager only) ────────────────────────────────────────
const ManagerStats = () => {
    const [open, setOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState(false);        // full-screen popup visible
    const [activeTab, setActiveTab] = useState(null); // 'PENDING' | 'APPROVED' | 'REJECTED'
    const ref = useRef(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/requests');
            const data = res.data || [];
            setRequests(data);
            return data;
        } catch (err) {
            console.error('Failed to fetch requests for ManagerStats:', err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchRequests();
    }, [open]);

    // Close dropdown on outside click (skip when popup is open)
    useEffect(() => {
        const handler = (e) => {
            if (!popup && ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [popup]);

    const pending = requests.filter(r => r.status === 'PENDING' || r.status === 'SUBMITTED');
    const approved = requests.filter(r => r.status === 'APPROVED' || r.status === 'BOOKED');
    const rejected = requests.filter(r => r.status === 'REJECTED');

    const listForTab = (tab) => {
        if (tab === 'PENDING') return pending;
        if (tab === 'APPROVED') return approved;
        if (tab === 'REJECTED') return rejected;
        return [];
    };

    const downloadExcel = async () => {
        let data = requests;
        if (!data || data.length === 0) {
            const loadingToast = toast.loading('Preparing travel requests for Excel export...');
            data = await fetchRequests();
            toast.dismiss(loadingToast);
        }

        if (!data || data.length === 0) {
            toast.error('No travel requests found to export.');
            return;
        }

        try {
            // Header title banner
            const titleRow = ['NIKITHA TRAVEL REQUEST - TEAM OVERVIEW REPORT', '', '', '', '', '', '', '', '', ''];
            const subtitleRow = [`Generated On: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, '', '', '', '', '', '', '', '', ''];
            
            // Column headers
            const headers = [
                'Request ID',
                'Employee Name',
                'From Location',
                'To Location',
                'Travel Mode',
                'Departure Date',
                'Return Date',
                'Status',
                'Manager Comments',
                'Purpose'
            ];

            // Rows data mapping
            const rows = data.map(r => [
                r.id ?? 'N/A',
                r.employee?.name || r.employee?.username || 'N/A',
                r.fromLocation ?? 'N/A',
                r.toLocation ?? 'N/A',
                r.travelMode ?? 'N/A',
                r.departureDate ? new Date(r.departureDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
                r.returnDate ? new Date(r.returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
                r.status ?? 'PENDING',
                r.managerComments || '-',
                r.purpose || '-'
            ]);

            const wsData = [titleRow, subtitleRow, [], headers, ...rows];
            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Column width formatting
            ws['!cols'] = [
                { wch: 12 }, // Request ID
                { wch: 22 }, // Employee Name
                { wch: 26 }, // From
                { wch: 26 }, // To
                { wch: 14 }, // Travel Mode
                { wch: 18 }, // Departure
                { wch: 18 }, // Return
                { wch: 14 }, // Status
                { wch: 30 }, // Manager Comments
                { wch: 30 }, // Purpose
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Team Requests');

            const fileName = `Team_Travel_Requests_${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(wb, fileName);
            toast.success(`Successfully downloaded ${data.length} travel record${data.length === 1 ? '' : 's'} as Excel!`);
        } catch (err) {
            console.error('Failed to generate Excel download:', err);
            toast.error('Unable to export Excel file. Please try again.');
        }
    };

    const stats = [
        { key: 'PENDING', label: 'Pending', count: pending.length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400', Icon: Clock, headerBg: 'bg-amber-500' },
        { key: 'APPROVED', label: 'Approved', count: approved.length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', Icon: CheckCircle, headerBg: 'bg-emerald-500' },
        { key: 'REJECTED', label: 'Rejected', count: rejected.length, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500', Icon: XCircle, headerBg: 'bg-rose-500' },
    ];

    const openPopup = (key) => {
        setActiveTab(key);
        setPopup(true);
        setOpen(false);
    };
    const closePopup = () => { setPopup(false); setActiveTab(null); };

    const popupList = listForTab(activeTab);
    const currentStat = stats.find(s => s.key === activeTab);

    return (
        <>
            <div ref={ref} className="relative z-50">
                <button
                    onClick={() => setOpen(o => !o)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-300
                    ${open
                            ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/20'
                            : 'border-slate-100 bg-white text-slate-500 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-md'}`}
                >
                    <BarChart2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Team Stats</span>
                </button>

                {/* Dropdown */}
                <div className={`absolute right-0 top-[calc(100%+0.75rem)] w-[360px] transition-all duration-300 origin-top-right
                ${open ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'}`}
                >
                    <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] border border-slate-100/60 overflow-hidden">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">Team Overview</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {loading ? 'Loading...' : `${requests.length} total requests \u2022 Click a card to view`}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    downloadExcel();
                                }}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 cursor-pointer active:scale-95"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Export Excel
                            </button>
                        </div>

                        {/* Clickable Stat Cards */}
                        <div className="p-4 grid grid-cols-3 gap-3">
                            {stats.map(({ key, label, count, color, bg, border, dot, Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => openPopup(key)}
                                    className={`${bg} ${border} border rounded-2xl p-4 flex flex-col items-center gap-2 w-full transition-all duration-200 hover:scale-[1.05] hover:shadow-lg active:scale-95 cursor-pointer select-none`}
                                >
                                    <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${color}`} />
                                    </div>
                                    <p className={`text-3xl font-black ${color} leading-none`}>
                                        {loading ? '\u2013' : count}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${dot}`}></div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Legend / Hint */}
                        <div className="px-5 pb-4">
                            <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-around text-[9px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-amber-200"></span>Pending</span>
                                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-emerald-200"></span>Approved</span>
                                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-rose-200"></span>Rejected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-Screen Popup */}
            {popup && createPortal(
                <div
                    className="fixed inset-0 z-[10000000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
                    onClick={closePopup}
                >
                    {/* Dark frosted backdrop */}
                    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md" />

                    {/* Modal card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_25px_80px_-15px_rgba(20,10,60,0.45)] border border-white/60 overflow-hidden z-10 flex flex-col"
                            style={{ maxHeight: '88vh' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* ── HEADER WITH TWILIGHT GRADIENT & ANIMATED STARS ── */}
                            <div
                                className="relative px-8 sm:px-10 py-7 sm:py-8 overflow-hidden select-none shrink-0"
                                style={{
                                    background: 'linear-gradient(135deg, #2a1e80 0%, #462ebc 28%, #6742db 50%, #9e59be 75%, #df8785 100%)',
                                }}
                            >
                                {/* Drifting subtle bokeh blur orb */}
                                <motion.div
                                    className="absolute -top-10 right-16 w-80 h-64 rounded-full pointer-events-none"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(200, 180, 255, 0.1) 60%, transparent 80%)',
                                        filter: 'blur(45px)',
                                    }}
                                    animate={{
                                        x: [0, 20, -15, 0],
                                        y: [0, -10, 8, 0],
                                    }}
                                    transition={{
                                        duration: 12,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />

                                {/* Sparkling 4-point Stars in Header */}
                                {POPUP_SPARKLES.map((star, idx) => (
                                    <motion.div
                                        key={`mgr-popup-sparkle-${idx}`}
                                        className="absolute pointer-events-none select-none"
                                        style={{
                                            top: star.top,
                                            left: star.left,
                                            width: star.size,
                                            height: star.size,
                                        }}
                                        animate={{
                                            opacity: [0.2, 0.9, 0.2],
                                            scale: [0.7, 1.25, 0.7],
                                            rotate: [0, 15, 0],
                                        }}
                                        transition={{
                                            duration: star.duration,
                                            repeat: Infinity,
                                            delay: star.delay,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
                                            <path
                                                d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
                                                fill="#ffffff"
                                            />
                                            <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
                                        </svg>
                                    </motion.div>
                                ))}

                                {/* Twinkling Halo Stars */}
                                {POPUP_TWINKLES.map((star, idx) => (
                                    <motion.div
                                        key={`mgr-popup-twinkle-${idx}`}
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
                                            opacity: [0.2, 0.9, 0.2],
                                            scale: [0.8, 1.3, 0.8],
                                        }}
                                        transition={{
                                            duration: star.duration,
                                            repeat: Infinity,
                                            delay: star.delay,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                ))}

                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-white/95 mb-2 shadow-sm">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                                            <span>Managerial Authorization Desk</span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                                            {activeTab === 'PENDING' ? 'Pending Deployment Queue' :
                                                activeTab === 'APPROVED' ? 'Authorized Deployment Registry' : 'Revoked Authorization Log'}
                                        </h2>
                                        <p className="text-white/80 text-xs sm:text-sm font-medium mt-1">
                                            {popupList.length} associate travel {popupList.length === 1 ? 'record' : 'records'} intercepted
                                        </p>
                                    </div>

                                    {/* Close Button */}
                                    <button
                                        onClick={closePopup}
                                        className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-all shadow-md active:scale-95 group cursor-pointer"
                                        aria-label="Close dialog"
                                    >
                                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                    </button>
                                </div>
                            </div>

                            {/* ── TAB SWITCHER STRIP ── */}
                            <div className="px-8 sm:px-10 pt-5 pb-3 shrink-0 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center gap-3">
                                {[
                                    { key: 'PENDING', label: 'Pending Queue', count: pending.length, Icon: Clock },
                                    { key: 'APPROVED', label: 'Authorized', count: approved.length, Icon: CheckCircle2 },
                                    { key: 'REJECTED', label: 'Revoked', count: rejected.length, Icon: XCircle },
                                ].map(tab => {
                                    const isActive = activeTab === tab.key;
                                    const Icon = tab.Icon;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-[#6541e9] text-white shadow-lg shadow-[#6541e9]/25 scale-[1.02]'
                                                    : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200/80 hover:border-slate-300 shadow-sm'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            <span>{tab.label}</span>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {tab.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* ── POPUP BODY WITH SMOOTH SCROLL ── */}
                            <div className="overflow-y-auto p-6 sm:p-8 space-y-3.5 flex-grow" style={{ maxHeight: 'calc(88vh - 200px)' }}>
                                {popupList.length === 0 ? (
                                    <div className="py-24 flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 bg-indigo-50/80 rounded-3xl flex items-center justify-center border border-indigo-100 mb-4 shadow-inner">
                                            <BarChart2 className="w-10 h-10 text-indigo-400" />
                                        </div>
                                        <p className="text-base font-bold text-slate-800">No matching authorization records</p>
                                        <p className="text-xs text-slate-400 font-medium mt-1 max-w-sm">
                                            There are currently no records found under this tab category.
                                        </p>
                                    </div>
                                ) : (
                                    popupList.map(req => {
                                        const initials = req.employee?.name ? getInitials(req.employee.name) : 'E';
                                        const travelModeLower = (req.travelMode || '').toLowerCase();
                                        const ModeIcon = travelModeLower.includes('train') 
                                            ? Train 
                                            : travelModeLower.includes('bus') 
                                                ? Bus 
                                                : travelModeLower.includes('cab') || travelModeLower.includes('car')
                                                    ? Car
                                                    : Plane;

                                        return (
                                            <div
                                                key={req.id}
                                                className="group p-5 sm:p-6 rounded-2xl bg-white hover:bg-slate-50/90 border border-slate-100 hover:border-indigo-200 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                            >
                                                {/* Left: avatar + info */}
                                                <div className="flex items-start sm:items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md shrink-0 ${
                                                        activeTab === 'PENDING'
                                                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20'
                                                            : activeTab === 'APPROVED'
                                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/20'
                                                                : 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/20'
                                                    }`}>
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#6541e9] transition-colors leading-tight">
                                                                {req.employee?.name || 'Employee'}
                                                            </h4>
                                                            {req.id && (
                                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                                                    #{req.id}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Route & Mode */}
                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100/90 px-3 py-1 rounded-xl">
                                                                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                                                <span>{req.fromLocation}</span>
                                                                <span className="text-slate-400 font-normal">→</span>
                                                                <span>{req.toLocation}</span>
                                                            </span>

                                                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-500 uppercase tracking-wider bg-slate-100/70 px-2.5 py-1 rounded-xl">
                                                                <ModeIcon className="w-3.5 h-3.5 text-indigo-500" />
                                                                <span>{req.travelMode || 'TRAVEL'}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: date + status badge */}
                                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>
                                                            {new Date(req.departureDate).toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>

                                                    {req.returnDate && (
                                                        <span className="text-[11px] font-bold text-emerald-600">
                                                            Return: {new Date(req.returnDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border mt-1 ${
                                                            activeTab === 'PENDING'
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : activeTab === 'APPROVED'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            activeTab === 'PENDING' ? 'bg-amber-500' : activeTab === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'
                                                        } animate-pulse`} />
                                                        <span>{req.status === 'SUBMITTED' ? 'Awaiting Review' : req.status}</span>
                                                    </span>

                                                    {activeTab === 'REJECTED' && req.managerComments && (
                                                        <p className="text-[10px] font-bold text-rose-500 max-w-[240px] italic mt-1">
                                                            "{req.managerComments}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )}
        </>
    );
};

// ── Employee Trip Report Panel (employee only) ─────────────────────────────────
// Clicking a stat card navigates to /employee?filter=KEY and filters the
// "My Travel Registry" section on the dashboard page itself (no inline list).
const EmployeeTripReport = ({ userId }) => {
    const [open, setOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchRequests = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await api.get(`/requests/employee/${userId}`);
            setRequests(res.data || []);
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchRequests();
    }, [open]);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const pendingList = requests.filter(r => r.status === 'SUBMITTED' || r.status === 'PENDING');
    const approvedList = requests.filter(r => r.status === 'APPROVED' || r.status === 'BOOKED');
    const rejectedList = requests.filter(r => r.status === 'REJECTED');
    const currentFilter = new URLSearchParams(location.search).get('filter');
    const total = requests.length;

    const stats = [
        { key: 'ALL', label: 'Total Applied', count: total, color: 'text-indigo-600', activeBg: 'bg-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500', Icon: BarChart2 },
        { key: 'PENDING', label: 'Pending', count: pendingList.length, color: 'text-amber-600', activeBg: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400', Icon: Clock },
        { key: 'APPROVED', label: 'Approved', count: approvedList.length, color: 'text-emerald-600', activeBg: 'bg-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', Icon: CheckCircle },
        { key: 'REJECTED', label: 'Rejected', count: rejectedList.length, color: 'text-rose-600', activeBg: 'bg-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500', Icon: XCircle },
    ];

    const handleCardClick = (key) => {
        const target = `/employee?filter=${key}`;
        navigate(target);
        window.dispatchEvent(new CustomEvent('filter-travel-registry', { detail: key }));
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative z-50">
            <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-300
                    ${open
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-500/20'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 hover:shadow-md'}`}
            >
                <BarChart2 className="w-4 h-4" />
                <span className="hidden sm:inline">My Report</span>
            </button>

            <div className={`absolute right-0 top-[calc(100%+0.75rem)] w-[360px] transition-all duration-300 origin-top-right
                ${open ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'}`}
            >
                <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] border border-slate-100/60 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight">My Trip Report</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {loading ? 'Loading...' : `${total} trip${total !== 1 ? 's' : ''} \u2022 Tap a card to filter`}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <BarChart2 className="w-4 h-4 text-indigo-600" />
                        </div>
                    </div>

                    <div className="p-4 grid grid-cols-2 gap-3">
                        {stats.map(({ key, label, count, color, bg, activeBg, border, dot, Icon }) => {
                            const isActive = currentFilter === key || ((!currentFilter || currentFilter === 'ALL') && key === 'ALL' && location.pathname === '/employee');
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleCardClick(key)}
                                    className={`border-2 rounded-2xl p-4 flex flex-col items-center gap-2 w-full transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-95
                                        ${isActive ? `${activeBg} border-transparent shadow-lg` : `${bg} ${border} hover:shadow-sm`}`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20' : bg}`}>
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : color}`} />
                                    </div>
                                    <p className={`text-3xl font-black leading-none ${isActive ? 'text-white' : color}`}>
                                        {loading ? '\u2013' : count}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/60' : dot}`}></div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight ${isActive ? 'text-white/90' : color}`}>{label}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="px-5 pb-4">
                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Tap a card to filter My Travel Registry &darr;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Admin Stats Panel (admin only) ───────────────────────────────────────────
const AdminStats = () => {
    const [open, setOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState(false);
    const [activeTab, setActiveTab] = useState(null); // 'SENT' (Booked) | 'QUEUE' (Approved)
    const ref = useRef(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/requests');
            setRequests(res.data || []);
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchRequests();
    }, [open]);

    useEffect(() => {
        const handler = (e) => {
            if (!popup && ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [popup]);

    const sent = requests.filter(r => r.status === 'BOOKED');
    const queue = requests.filter(r => r.status === 'APPROVED');

    const openPopup = (key) => {
        setActiveTab(key);
        setPopup(true);
        setOpen(false);
    };
    const closePopup = () => { setPopup(false); setActiveTab(null); };

    const getList = (tab) => {
        const list = tab === 'SENT' ? sent : queue;
        // Date-wise sort (chronological)
        return [...list].sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate));
    };

    const stats = [
        { key: 'SENT', label: 'Tickets Sent', count: sent.length, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500', Icon: CheckCircle, headerBg: 'bg-indigo-600' },
        { key: 'QUEUE', label: 'Pending for Ticket', count: queue.length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', Icon: Clock, headerBg: 'bg-amber-500' },
    ];

    const popupList = getList(activeTab);
    const currentStat = stats.find(s => s.key === activeTab);

    return (
        <>
            <div ref={ref} className="relative z-50">
                <button
                    onClick={() => setOpen(o => !o)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-300
                    ${open
                            ? 'border-purple-400 bg-purple-50 text-purple-700 shadow-lg shadow-purple-500/20'
                            : 'border-slate-100 bg-white text-slate-500 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-600 hover:shadow-md'}`}
                >
                    <FileBarChart className="w-4 h-4" />
                    <span className="hidden sm:inline">Report</span>
                </button>

                <div className={`absolute right-0 top-[calc(100%+0.75rem)] w-[360px] transition-all duration-300 origin-top-right
                ${open ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'}`}
                >
                    <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] border border-slate-100/60 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">Admin Report</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {loading ? 'Loading...' : `${requests.length} itineraries intercepted`}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 grid grid-cols-2 gap-3">
                            {stats.map(({ key, label, count, color, bg, border, dot, Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => openPopup(key)}
                                    className={`${bg} ${border} border rounded-2xl p-4 flex flex-col items-center gap-2 w-full transition-all duration-200 hover:scale-[1.05] hover:shadow-lg active:scale-95 cursor-pointer select-none`}
                                >
                                    <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${color}`} />
                                    </div>
                                    <p className={`text-3xl font-black ${color} leading-none`}>
                                        {loading ? '–' : count}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${dot}`}></div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {popup && createPortal(
                <div
                    className="fixed inset-0 z-[10000000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
                    onClick={closePopup}
                >
                    {/* Dark frosted backdrop */}
                    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md" />

                    {/* Modal card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_25px_80px_-15px_rgba(20,10,60,0.45)] border border-white/60 overflow-hidden z-10 flex flex-col"
                            style={{ maxHeight: '88vh' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* ── HEADER WITH TWILIGHT GRADIENT & ANIMATED STARS ── */}
                            <div
                                className="relative px-8 sm:px-10 py-7 sm:py-8 overflow-hidden select-none shrink-0"
                                style={{
                                    background: 'linear-gradient(135deg, #2a1e80 0%, #462ebc 28%, #6742db 50%, #9e59be 75%, #df8785 100%)',
                                }}
                            >
                                {/* Drifting subtle bokeh blur orb */}
                                <motion.div
                                    className="absolute -top-10 right-16 w-80 h-64 rounded-full pointer-events-none"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(200, 180, 255, 0.1) 60%, transparent 80%)',
                                        filter: 'blur(45px)',
                                    }}
                                    animate={{
                                        x: [0, 20, -15, 0],
                                        y: [0, -10, 8, 0],
                                    }}
                                    transition={{
                                        duration: 12,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />

                                {/* Sparkling 4-point Stars in Header */}
                                {POPUP_SPARKLES.map((star, idx) => (
                                    <motion.div
                                        key={`admin-popup-sparkle-${idx}`}
                                        className="absolute pointer-events-none select-none"
                                        style={{
                                            top: star.top,
                                            left: star.left,
                                            width: star.size,
                                            height: star.size,
                                        }}
                                        animate={{
                                            opacity: [0.2, 0.9, 0.2],
                                            scale: [0.7, 1.25, 0.7],
                                            rotate: [0, 15, 0],
                                        }}
                                        transition={{
                                            duration: star.duration,
                                            repeat: Infinity,
                                            delay: star.delay,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
                                            <path
                                                d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
                                                fill="#ffffff"
                                            />
                                            <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
                                        </svg>
                                    </motion.div>
                                ))}

                                {/* Twinkling Halo Stars */}
                                {POPUP_TWINKLES.map((star, idx) => (
                                    <motion.div
                                        key={`admin-popup-twinkle-${idx}`}
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
                                            opacity: [0.2, 0.9, 0.2],
                                            scale: [0.8, 1.3, 0.8],
                                        }}
                                        transition={{
                                            duration: star.duration,
                                            repeat: Infinity,
                                            delay: star.delay,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                ))}

                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-white/95 mb-2 shadow-sm">
                                            <Sparkles className="w-3 h-3 text-amber-300" />
                                            <span>Executive Audit Registry</span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                                            {activeTab === 'SENT' ? 'Success Registry' : 'Fulfillment Backlog'}
                                        </h2>
                                        <p className="text-white/80 text-xs sm:text-sm font-medium mt-1">
                                            {popupList.length} verified travel {popupList.length === 1 ? 'itinerary' : 'itineraries'} intercepted
                                        </p>
                                    </div>

                                    {/* Close Button */}
                                    <button
                                        onClick={closePopup}
                                        className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-all shadow-md active:scale-95 group cursor-pointer"
                                        aria-label="Close dialog"
                                    >
                                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                    </button>
                                </div>
                            </div>

                            {/* ── TAB SWITCHER STRIP ── */}
                            <div className="px-8 sm:px-10 pt-5 pb-3 shrink-0 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center gap-3">
                                {stats.map(s => {
                                    const isActive = activeTab === s.key;
                                    const Icon = s.Icon;
                                    return (
                                        <button
                                            key={s.key}
                                            onClick={() => setActiveTab(s.key)}
                                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-[#6541e9] text-white shadow-lg shadow-[#6541e9]/25 scale-[1.02]'
                                                    : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200/80 hover:border-slate-300 shadow-sm'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            <span>{s.label}</span>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {s.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* ── POPUP BODY WITH SMOOTH SCROLL ── */}
                            <div className="overflow-y-auto p-6 sm:p-8 space-y-3.5 flex-grow" style={{ maxHeight: 'calc(88vh - 200px)' }}>
                                {popupList.length === 0 ? (
                                    <div className="py-24 flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 bg-indigo-50/80 rounded-3xl flex items-center justify-center border border-indigo-100 mb-4 shadow-inner">
                                            <CheckCircle2 className="w-10 h-10 text-indigo-400" />
                                        </div>
                                        <p className="text-base font-bold text-slate-800">
                                            {activeTab === 'SENT' ? 'No Dispatched Tickets Yet' : 'Zero Pending Requests In Backlog'}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium mt-1 max-w-sm">
                                            {activeTab === 'SENT' 
                                                ? 'Tickets will appear here as soon as approved requests are booked and dispatched.' 
                                                : 'All approved travel requests have been fulfilled and booked.'}
                                        </p>
                                    </div>
                                ) : (
                                    popupList.map(req => {
                                        const initials = req.employee?.name ? getInitials(req.employee.name) : 'E';
                                        const travelModeLower = (req.travelMode || '').toLowerCase();
                                        const ModeIcon = travelModeLower.includes('train') 
                                            ? Train 
                                            : travelModeLower.includes('bus') 
                                                ? Bus 
                                                : travelModeLower.includes('cab') || travelModeLower.includes('car')
                                                    ? Car
                                                    : Plane;
                                        
                                        return (
                                            <div
                                                key={req.id}
                                                className="group p-5 sm:p-6 rounded-2xl bg-white hover:bg-slate-50/90 border border-slate-100 hover:border-indigo-200 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                            >
                                                {/* Left: Avatar & Details */}
                                                <div className="flex items-start sm:items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6541e9] to-[#8c52ff] text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-500/20 shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#6541e9] transition-colors leading-tight">
                                                                {req.employee?.name || 'Employee'}
                                                            </h4>
                                                            {req.id && (
                                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                                                    #{req.id}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Route & Mode */}
                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100/90 px-3 py-1 rounded-xl">
                                                                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                                                <span>{req.fromLocation}</span>
                                                                <span className="text-slate-400 font-normal">→</span>
                                                                <span>{req.toLocation}</span>
                                                            </span>

                                                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-500 uppercase tracking-wider bg-slate-100/70 px-2.5 py-1 rounded-xl">
                                                                <ModeIcon className="w-3.5 h-3.5 text-indigo-500" />
                                                                <span>{req.travelMode || 'TRAVEL'}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Date, Spend, Status */}
                                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>
                                                            {new Date(req.departureDate).toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>

                                                    {req.cost ? (
                                                        <span className="text-xs font-black text-emerald-600">
                                                            ₹{Number(req.cost).toLocaleString('en-IN')}
                                                        </span>
                                                    ) : null}

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border mt-1 ${
                                                            req.status === 'BOOKED'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                        }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${req.status === 'BOOKED' ? 'bg-emerald-500' : 'bg-indigo-500'} animate-pulse`} />
                                                        <span>{req.status}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )}
        </>
    );
};

// ── Notification Bell (employee only) ──────────────────────────────────────────
const NotificationBell = ({ userId }) => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [readIds, setReadIds] = useState(() => {
        try { return JSON.parse(localStorage.getItem('notif_read') || '[]'); } catch { return []; }
    });
    const [toastedIds, setToastedIds] = useState(() => {
        try { return JSON.parse(localStorage.getItem('notif_toasted') || '[]'); } catch { return []; }
    });

    const markOneRead = (id) => {
        setReadIds(prev => {
            if (prev.includes(id)) return prev;
            const updated = [...prev, id];
            localStorage.setItem('notif_read', JSON.stringify(updated));
            return updated;
        });
    };

    const buildNotifications = (requests = []) => {
        if (!Array.isArray(requests)) return [];
        const notifs = [];
        requests.forEach(req => {
            if (req.status === 'APPROVED') {
                notifs.push({
                    id: `approved-${req.id}`,
                    reqId: req.id,
                    type: 'approved',
                    icon: CheckCircle2,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-200',
                    badge: 'Approved',
                    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    title: 'Trip Approved by Manager',
                    fromLocation: req.fromLocation,
                    toLocation: req.toLocation,
                    tripType: req.tripType,
                    body: `${req.fromLocation} → ${req.toLocation}`,
                });
            } else if (req.status === 'REJECTED') {
                notifs.push({
                    id: `rejected-${req.id}`,
                    reqId: req.id,
                    type: 'rejected',
                    icon: XCircle,
                    color: 'text-rose-600',
                    bg: 'bg-rose-50',
                    border: 'border-rose-200',
                    badge: 'Declined',
                    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
                    title: 'Trip Rejected by Manager',
                    fromLocation: req.fromLocation,
                    toLocation: req.toLocation,
                    tripType: req.tripType,
                    body: `${req.fromLocation} → ${req.toLocation}`,
                    reason: req.managerComments || null,
                });
            } else if (req.status === 'BOOKED') {
                notifs.push({
                    id: `booked-${req.id}`,
                    reqId: req.id,
                    type: 'booked',
                    icon: Ticket,
                    color: 'text-[#6541e9]',
                    bg: 'bg-indigo-50',
                    border: 'border-indigo-200',
                    badge: 'Ticket Ready',
                    badgeBg: 'bg-indigo-50 text-[#6541e9] border-indigo-200',
                    title: 'Ticket Uploaded by Admin',
                    fromLocation: req.fromLocation,
                    toLocation: req.toLocation,
                    tripType: req.tripType,
                    body: `${req.fromLocation} → ${req.toLocation}`,
                });
            }
        });
        return notifs;
    };

    useEffect(() => {
        if (!userId) return;
        const fetch = async () => {
            try {
                const res = await api.get(`/requests/employee/${userId}`);
                const notifs = buildNotifications(res.data);
                setNotifications(notifs);

                const currentToasted = JSON.parse(localStorage.getItem('notif_toasted') || '[]');
                const currentRead = JSON.parse(localStorage.getItem('notif_read') || '[]');
                const newToasted = [...currentToasted];
                let hasNew = false;

                notifs.forEach(n => {
                    if (!currentToasted.includes(n.id) && !currentRead.includes(n.id)) {
                        const Icon = n.icon || Bell;
                        toast.custom((t) => (
                            <div 
                               onClick={() => { toast.dismiss(t.id); markOneRead(n.id); }}
                               className={`${t.visible ? 'animate-in slide-in-from-top-2' : 'animate-out slide-out-to-top-2'} cursor-pointer max-w-sm w-full bg-white shadow-2xl rounded-[1.5rem] pointer-events-auto flex items-start gap-4 p-5 border border-slate-100 hover:scale-[1.02] active:scale-95 transition-all outline outline-4 outline-indigo-50/50`}
                            >
                                <div className={`shrink-0 w-12 h-12 rounded-[1.2rem] ${n.bg} ${n.border} border-2 flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 ${n.color}`} />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-sm font-black text-slate-800 leading-tight mb-1">{n.title}</p>
                                    <p className="text-[11px] font-bold text-slate-500">{n.body}</p>
                                    {n.reason && (
                                         <p className="text-[10px] font-bold text-rose-500 mt-2 bg-rose-50/50 px-3 py-2 rounded-xl border border-rose-100/50 italic">
                                             “{n.reason}”
                                         </p>
                                    )}
                                </div>
                            </div>
                        ), { id: n.id, duration: 6000 });
                        
                        newToasted.push(n.id);
                        hasNew = true;
                    }
                });

                if (hasNew) {
                    setToastedIds(newToasted);
                    localStorage.setItem('notif_toasted', JSON.stringify(newToasted));
                }
            } catch { /* silent */ }
        };
        fetch();
        const interval = setInterval(fetch, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    const unread = notifications.filter(n => !readIds.includes(n.id));

    const markAllRead = () => {
        const allIds = notifications.map(n => n.id);
        setReadIds(allIds);
        localStorage.setItem('notif_read', JSON.stringify(allIds));
    };

    return (
        <div className="relative z-50">
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(prev => !prev);
                }}
                className={`relative flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all duration-300 cursor-pointer select-none ${
                    open ? 'border-[#6541e9] bg-indigo-50 shadow-lg shadow-indigo-500/20 scale-105' : 'border-slate-100 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-md'
                }`}
                aria-label="Open notifications"
            >
                <Bell className={`w-5 h-5 ${open ? 'text-[#6541e9]' : 'text-slate-600'} transition-colors`} />
                {unread.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm animate-bounce pointer-events-none">
                        {unread.length > 9 ? '9+' : unread.length}
                    </span>
                )}
            </button>

            {/* Redesigned Notification Modal (Dashboard UI Aesthetic) */}
            {open && createPortal(
                <div
                    className="fixed inset-0 z-[10000000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-md"
                    onClick={() => setOpen(false)}
                >
                    {/* Modal card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 12 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] sm:rounded-[2.8rem] shadow-[0_25px_80px_-15px_rgba(20,10,60,0.45)] border border-white/60 overflow-hidden z-10 flex flex-col"
                        style={{ maxHeight: '88vh' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* ── HEADER WITH DASHBOARD TWILIGHT GRADIENT & ANIMATED STARS ── */}
                        <div
                            className="relative px-7 sm:px-9 py-6 sm:py-7 overflow-hidden select-none shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, #2a1e80 0%, #462ebc 28%, #6742db 50%, #9e59be 75%, #df8785 100%)',
                            }}
                        >
                            {/* Drifting subtle bokeh blur orb */}
                            <motion.div
                                className="absolute -top-10 right-16 w-80 h-64 rounded-full pointer-events-none"
                                style={{
                                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(200, 180, 255, 0.1) 60%, transparent 80%)',
                                    filter: 'blur(45px)',
                                }}
                                animate={{
                                    x: [0, 20, -15, 0],
                                    y: [0, -10, 8, 0],
                                }}
                                transition={{
                                    duration: 12,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />

                            {/* Sparkling 4-point Stars in Header */}
                            {POPUP_SPARKLES.map((star, idx) => (
                                <motion.div
                                    key={`notif-sparkle-${idx}`}
                                    className="absolute pointer-events-none select-none"
                                    style={{
                                        top: star.top,
                                        left: star.left,
                                        width: star.size,
                                        height: star.size,
                                    }}
                                    animate={{
                                        opacity: [0.2, 0.9, 0.2],
                                        scale: [0.7, 1.25, 0.7],
                                        rotate: [0, 15, 0],
                                    }}
                                    transition={{
                                        duration: star.duration,
                                        repeat: Infinity,
                                        delay: star.delay,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
                                        <path
                                            d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
                                            fill="#ffffff"
                                        />
                                        <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
                                    </svg>
                                </motion.div>
                            ))}

                            {/* Twinkling Halo Stars */}
                            {POPUP_TWINKLES.map((star, idx) => (
                                <motion.div
                                    key={`notif-twinkle-${idx}`}
                                    className="absolute rounded-full pointer-events-none"
                                    style={{
                                        top: star.top,
                                        left: star.left,
                                        width: star.size,
                                        height: star.size,
                                        background: '#ffffff',
                                        boxShadow: '0 0 6px 1px rgba(255, 255, 255, 0.85)',
                                    }}
                                    animate={{
                                        opacity: [0.3, 1, 0.3],
                                        scale: [0.8, 1.3, 0.8],
                                    }}
                                    transition={{
                                        duration: star.duration,
                                        repeat: Infinity,
                                        delay: star.delay,
                                        ease: 'easeInOut',
                                    }}
                                />
                            ))}

                            {/* Header Content */}
                            <div className="relative z-10 flex items-center justify-between gap-4">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-white/95 mb-2 shadow-sm">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                        <span>Travel Notifications Desk</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                                        Travel Notifications
                                    </h2>
                                    <p className="text-white/80 text-xs sm:text-sm font-medium mt-1">
                                        {unread.length} {unread.length === 1 ? 'alert' : 'alerts'} pending review
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2.5">
                                    {unread.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAllRead();
                                            }}
                                            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all backdrop-blur-md border border-white/25 shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                            <span>Clear All</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpen(false);
                                        }}
                                        className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-all shadow-md active:scale-95 group cursor-pointer"
                                        aria-label="Close dialog"
                                    >
                                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── POPUP BODY WITH SMOOTH SCROLL ── */}
                        <div className="overflow-y-auto p-5 sm:p-7 space-y-3.5 flex-grow" style={{ maxHeight: 'calc(88vh - 180px)' }}>
                            {unread.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                                    <div className="w-20 h-20 bg-indigo-50/80 rounded-3xl flex items-center justify-center border border-indigo-100 mb-4 shadow-inner">
                                        <Bell className="w-10 h-10 text-indigo-400" />
                                    </div>
                                    <p className="text-base font-black text-slate-800 tracking-tight">All Caught Up!</p>
                                    <p className="text-xs text-slate-400 font-bold mt-1 max-w-sm">
                                        Zero pending travel notifications. We will notify you here when your manager reviews or admin issues tickets.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {unread.map(notif => {
                                        const Icon = notif.icon || Bell;
                                        return (
                                            <div
                                                key={notif.id}
                                                onClick={() => markOneRead(notif.id)}
                                                className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-200 transition-all duration-200 shadow-2xs hover:shadow-md group flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer relative overflow-hidden"
                                            >
                                                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${notif.bg} ${notif.color} ${notif.border}`}>
                                                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                            <p className="font-black text-slate-900 text-sm sm:text-base leading-tight tracking-tight group-hover:text-[#6541e9] transition-colors">
                                                                {notif.title}
                                                            </p>
                                                            <span className="w-2 h-2 rounded-full bg-[#6541e9] animate-pulse"></span>
                                                            {notif.badge && (
                                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${notif.badgeBg}`}>
                                                                    {notif.badge}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Route Visualizer Pill */}
                                                        {notif.fromLocation && notif.toLocation ? (
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white/95 px-3 py-1.5 rounded-xl border border-slate-200/80 w-fit shadow-2xs">
                                                                <MapPin className="w-3.5 h-3.5 text-[#6541e9] shrink-0" />
                                                                <span className="truncate max-w-[140px] sm:max-w-[200px]">{notif.fromLocation}</span>
                                                                <div className="flex items-center gap-1 text-[#6541e9] px-0.5">
                                                                    <span className="w-2.5 h-[1.5px] bg-indigo-300"></span>
                                                                    <Plane className="w-3 h-3 transform rotate-45" />
                                                                    <span className="w-2.5 h-[1.5px] bg-indigo-300"></span>
                                                                </div>
                                                                <MapPin className="w-3.5 h-3.5 text-[#cb0f41] shrink-0" />
                                                                <span className="truncate max-w-[140px] sm:max-w-[200px]">{notif.toLocation}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white/90 px-3 py-1.5 rounded-xl border border-slate-200/80 w-fit shadow-2xs">
                                                                <MapPin className="w-3.5 h-3.5 text-[#6541e9] shrink-0" />
                                                                <span className="truncate">{notif.body}</span>
                                                            </div>
                                                        )}

                                                        {/* Reason note if present */}
                                                        {notif.reason && (
                                                            <div className="mt-2 text-xs font-bold text-rose-600 bg-rose-50/90 px-3 py-1.5 rounded-xl border border-rose-100 italic flex items-center gap-1.5">
                                                                <span>“{notif.reason}”</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end sm:justify-center shrink-0">
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 group-hover:bg-[#6541e9] group-hover:text-white group-hover:border-[#6541e9] transition-all shadow-2xs">
                                                        Mark Read
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </div>
    );
};

// ── Profile Dropdown ────────────────────────────────────────────────────────────
const ProfileDropdown = ({ user, onLogout }) => {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef(null);

    const colors = roleColors[user.role] || roleColors.ROLE_EMPLOYEE;
    const roleName = user.role?.replace('ROLE_', '') || 'USER';

    const handleMouseEnter = () => {
        clearTimeout(timeoutRef.current);
        setOpen(true);
    };
    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setOpen(false), 150);
    };

    return (
        <div
            className="relative z-50 ml-2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className={`flex items-center justify-center w-12 h-12 rounded-full border-[3px] transition-all duration-500
                    ${open
                        ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105'
                        : 'border-slate-100 hover:border-indigo-300 hover:shadow-xl hover:scale-105 bg-white'
                    }`}
            >
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center shrink-0 shadow-inner`}>
                    <span className="text-white font-black text-sm tracking-wider">{getInitials(user.name)}</span>
                </div>
                <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </button>

            <div className={`absolute right-0 top-[calc(100%+0.75rem)] w-[340px] transition-all duration-400 origin-top-right
                ${open ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}
            >
                <div className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.6)] border border-slate-100/50 overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-slate-50 to-transparent"></div>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute top-10 -left-10 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative px-8 pt-10 pb-6 flex flex-col items-center text-center">
                        <div className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-5 shadow-2xl shadow-indigo-900/20 ring-4 ring-white relative group overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="text-white font-black text-3xl group-hover:scale-110 transition-transform duration-500">{getInitials(user.name)}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight">{user.name}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1.5 mb-4">{user.email || 'Valid Authentication Token'}</p>
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${colors.badge} border-current/20 bg-opacity-10`}>
                            <Zap className="w-3 h-3 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{roleName}</span>
                        </div>
                    </div>

                    <div className="px-6 pb-6 relative z-10">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-5"></div>
                        <motion.button
                            onClick={onLogout}
                            whileHover={{ scale: 1.025, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                            className="w-full relative group overflow-hidden rounded-2xl p-[1.5px] cursor-pointer select-none shadow-[0_12px_28px_rgba(225,29,72,0.25)] hover:shadow-[0_16px_36px_rgba(225,29,72,0.45)] transition-shadow duration-300"
                        >
                            {/* 1. Continuous Flowing Conic Gradient Glowing Border */}
                            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,#f43f5e_0%,#fb923c_30%,#e11d48_60%,#be123c_85%,#f43f5e_100%)] animate-[spin_4s_linear_infinite] opacity-90 group-hover:opacity-100 transition-opacity" />

                            {/* 2. Inner Button Surface (Deep High-Tech Dark Crimson / Obsidian Glass) */}
                            <div className="relative flex items-center justify-between w-full bg-gradient-to-r from-[#120716] via-[#1a0c24] to-[#120716] px-5 py-3.5 rounded-[15px] border border-white/10 overflow-hidden">
                                
                                {/* Subtle Ambient Red Glow Pulsing Behind */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-rose-600/20 via-orange-500/15 to-rose-600/20 blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                {/* Diagonal Shimmer Glint Sweep on Hover */}
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

                                {/* Left Side: Animated LogOut Icon inside Crimson Neon Badge */}
                                <div className="relative flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-600/40 border border-rose-300/30 group-hover:rotate-[-6deg] transition-transform duration-300 shrink-0">
                                        <LogOut className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-[13px] font-black tracking-widest text-white uppercase group-hover:text-rose-100 transition-colors drop-shadow-sm flex items-center gap-1.5">
                                            End Session
                                            <Sparkles className="w-3 h-3 text-amber-300 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                                        </span>
                                        <span className="text-[9px] font-bold text-rose-300/80 uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
                                            Secure Sign Out
                                        </span>
                                    </div>
                                </div>

                                {/* Right Side: Interactive Animated Arrow Indicator */}
                                <div className="relative w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-rose-300 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-400 group-hover:translate-x-1 transition-all duration-300 shadow-xs shrink-0">
                                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Navbar ─────────────────────────────────────────────────────────────────
const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin' || location.pathname === '/admin/';
        if (path === '/manager') return location.pathname === '/manager' || location.pathname === '/manager/';
        if (path === '/employee?tab=book') return location.pathname.startsWith('/employee') && location.search.includes('tab=book');
        if (path === '/employee' || path === '/employee?tab=manage') return location.pathname.startsWith('/employee') && !location.search.includes('tab=book');
        return location.pathname === path;
    };

    const getNavLinkClass = (path) => `flex flex-col items-center gap-1.5 font-black tracking-wider transition-all px-5 py-3 rounded-2xl select-none ${
        isActive(path)
            ? 'text-[#6366f1] bg-indigo-50 shadow-inner'
            : 'text-slate-500 hover:text-[#6366f1] hover:bg-indigo-50/50'
    }`;

    return (
        <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-white/40 shadow-sm h-20">
            <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
                <Link to={user?.role === 'ROLE_ADMIN' ? '/admin' : user?.role === 'ROLE_MANAGER' ? '/manager' : user?.role === 'ROLE_EMPLOYEE' ? '/employee' : '/'} className="flex items-center gap-4 group">
                    <div className="mmt-gradient p-3 rounded-2xl group-hover:rotate-[15deg] transition-all duration-500 shadow-xl shadow-indigo-500/30">
                        <Plane className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
                            Nikitha <span className="text-[#6366f1]">Travel Request</span>
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">

                        </div>
                    </div>
                </Link>

                <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
                    {user ? (
                        <>
                            <div className="hidden md:flex items-center gap-2 md:gap-4 lg:gap-6">
                                {user.role === 'ROLE_ADMIN' && (
                                    <>
                                        <Link
                                            to="/admin"
                                            className={getNavLinkClass('/admin')}
                                        >
                                            <LayoutDashboard className="h-5 w-5" />
                                            <span>Dashboard</span>
                                        </Link>
                                        <Link
                                            to="/admin/users"
                                            className={getNavLinkClass('/admin/users')}
                                        >
                                            <User className="h-5 w-5" />
                                            <span>Team Roster</span>
                                        </Link>
                                    </>
                                )}

                                {user.role === 'ROLE_MANAGER' && (
                                    <Link
                                        to="/manager"
                                        className={getNavLinkClass('/manager')}
                                    >
                                        <LayoutDashboard className="h-5 w-5" />
                                        <span>Dashboard</span>
                                    </Link>
                                )}

                                {user.role === 'ROLE_EMPLOYEE' && (
                                    <>
                                        <Link
                                            to="/employee?tab=manage"
                                            className={getNavLinkClass('/employee?tab=manage')}
                                        >
                                            <LayoutDashboard className="h-5 w-5" />
                                            <span>Dashboard</span>
                                        </Link>
                                        <Link
                                            to="/employee?tab=book"
                                            className={getNavLinkClass('/employee?tab=book')}
                                        >
                                            <PlaneTakeoff className="h-5 w-5" />
                                            <span>New Trip</span>
                                        </Link>
                                    </>
                                )}

                                {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MANAGER') && (
                                    <Link
                                        to="/reports"
                                        className={getNavLinkClass('/reports')}
                                    >
                                        <FileBarChart className="h-5 w-5" />
                                        <span>Insights</span>
                                    </Link>
                                )}

                                <div className="h-10 w-px bg-slate-100 hidden sm:block" />
                            </div>

                            <button
                                className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>

                            {user.role === 'ROLE_MANAGER' && <ManagerStats />}

                            {user.role === 'ROLE_ADMIN' && <AdminStats />}

                            {user.role === 'ROLE_EMPLOYEE' && <EmployeeTripReport userId={user.id} />}

                            {user.role === 'ROLE_EMPLOYEE' && <NotificationBell userId={user.id} />}

                            <ProfileDropdown user={user} onLogout={handleLogout} />
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="px-6 py-3 text-slate-600 hover:text-[#6366f1] font-black transition-all text-sm uppercase tracking-widest">
                                Sign In
                            </Link>
                            <Link to="/register" className="mmt-gradient px-8 py-3.5 text-white font-black rounded-2xl text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {user && (
                <div className={`md:hidden fixed top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-lg z-40 transition-all duration-300 text-slate-700 ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                    <div className="px-4 py-6 space-y-4">
                        {user.role === 'ROLE_ADMIN' && (
                            <>
                                <Link
                                    to="/admin"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black tracking-wider transition-all ${
                                        isActive('/admin') 
                                            ? 'text-[#6366f1] bg-indigo-50 shadow-inner' 
                                            : 'text-slate-500 hover:text-[#6366f1] hover:bg-indigo-50/50'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    to="/admin/users"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black tracking-wider transition-all ${
                                        isActive('/admin/users') 
                                            ? 'text-[#6366f1] bg-indigo-50 shadow-inner' 
                                            : 'text-slate-500 hover:text-[#6366f1] hover:bg-indigo-50/50'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <User className="h-5 w-5" />
                                    <span>Team Roster</span>
                                </Link>
                            </>
                        )}
                        {user.role === 'ROLE_MANAGER' && (
                            <Link
                                to="/manager"
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black tracking-wider transition-all ${
                                    isActive('/manager') 
                                        ? 'text-[#6366f1] bg-indigo-50 shadow-inner' 
                                        : 'text-slate-500 hover:text-[#6366f1] hover:bg-indigo-50/50'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <LayoutDashboard className="h-5 w-5" />
                                <span>Dashboard</span>
                            </Link>
                        )}
                        {user.role === 'ROLE_EMPLOYEE' && (
                            <>
                                <Link
                                    to="/employee?tab=manage"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black tracking-wider transition-all ${
                                        isActive('/employee?tab=manage') 
                                            ? 'text-[#6366f1] bg-indigo-50 shadow-inner' 
                                            : 'text-slate-500 hover:text-[#6366f1] hover:bg-indigo-50/50'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    to="/employee?tab=book"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black tracking-wider transition-all ${
                                        isActive('/employee?tab=book') 
                                            ? 'text-[#6366f1] bg-indigo-50 shadow-inner' 
                                            : 'text-slate-500 hover:text-[#6366f1] hover:bg-indigo-50/50'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <PlaneTakeoff className="h-5 w-5" />
                                    <span>New Trip</span>
                                </Link>
                            </>
                        )}
                        {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MANAGER') && (
                            <Link
                                to="/reports"
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black tracking-wider transition-all ${
                                    isActive('/reports') 
                                        ? 'text-[#6366f1] bg-indigo-50 shadow-inner' 
                                        : 'text-slate-500 hover:text-[#6366f1] hover:bg-indigo-50/50'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <FileBarChart className="h-5 w-5" />
                                <span>Insights</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
