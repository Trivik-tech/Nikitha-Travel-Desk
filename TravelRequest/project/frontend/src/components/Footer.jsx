import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    PlaneTakeoff, 
    User, 
    FileBarChart, 
    ArrowUp 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Footer = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [timeString, setTimeString] = useState('');
    const [currentEmployeeTab, setCurrentEmployeeTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') || 'book';
    });

    // Sync tab with custom event dispatched by EmployeeDashboard
    useEffect(() => {
        const handler = (e) => {
            if (e.detail) setCurrentEmployeeTab(e.detail);
        };
        window.addEventListener('employee-tab-change', handler);
        return () => window.removeEventListener('employee-tab-change', handler);
    }, []);

    // Sync tab with URL search params if present
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setCurrentEmployeeTab(tab);
    }, [location.search]);

    // Live IST Clock (matches "09:50 am IST" in reference design)
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options = { 
                timeZone: 'Asia/Kolkata', 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
            };
            const formatter = new Intl.DateTimeFormat('en-US', options);
            const formatted = formatter.format(now).toLowerCase() + ' IST';
            setTimeString(formatted);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Custom High-Precision Smooth Scroll to Top Animation (requestAnimationFrame)
    const smoothScrollToTop = (duration = 650, callback) => {
        const start = window.pageYOffset || document.documentElement.scrollTop;
        if (start <= 0) {
            if (callback) callback();
            return;
        }
        const startTime = performance.now();

        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = easeInOutCubic(progress);

            window.scrollTo(0, start * (1 - ease));

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                window.scrollTo(0, 0);
                if (callback) callback();
            }
        };

        requestAnimationFrame(step);
    };

    const scrollToTop = () => {
        smoothScrollToTop(650);
    };

    // Determine target routes for navigation tabs matching the Navbar
    const dashboardTarget = user?.role === 'ROLE_ADMIN' 
        ? '/admin' 
        : user?.role === 'ROLE_MANAGER' 
            ? '/manager' 
            : '/employee?tab=manage';

    const newTripTarget = '/employee?tab=book';
    const rosterTarget = '/admin/users';
    const insightsTarget = '/reports';

    // Route and tab checks for mutually-exclusive active indicator styling
    const isOnEmployeePage = location.pathname.startsWith('/employee');
    const isNewTripActive = isOnEmployeePage && (currentEmployeeTab === 'book' || location.search.includes('tab=book'));
    const isDashboardActive = (location.pathname === '/admin' && !location.pathname.startsWith('/admin/users')) ||
                              location.pathname === '/manager' ||
                              (isOnEmployeePage && !isNewTripActive);
    const isRosterActive = location.pathname.startsWith('/admin/users');
    const isInsightsActive = location.pathname.startsWith('/reports');

    // Universal tab click handler: instant navigation & active tab change, or smooth scroll to top if already active
    const handleTabClick = (tabKey, targetPath) => {
        if (tabKey === 'roster' && user?.role !== 'ROLE_ADMIN') {
            toast.error('Team Roster is available for Admin only.', { id: 'roster-admin-only' });
            return;
        }

        const isCurrentlyActive = 
            (tabKey === 'dashboard' && isDashboardActive) ||
            (tabKey === 'newTrip' && isNewTripActive) ||
            (tabKey === 'roster' && isRosterActive) ||
            (tabKey === 'insights' && isInsightsActive);

        if (isCurrentlyActive) {
            smoothScrollToTop(650);
            return;
        }

        // If on employee dashboard and toggling between Dashboard (manage) and New Trip (book)
        if (isOnEmployeePage && (tabKey === 'dashboard' || tabKey === 'newTrip')) {
            const nextTab = tabKey === 'newTrip' ? 'book' : 'manage';
            setCurrentEmployeeTab(nextTab);
            window.dispatchEvent(new CustomEvent('employee-tab-change', { detail: nextTab }));
            navigate(targetPath, { replace: true });
            smoothScrollToTop(400);
            return;
        }

        // Navigate immediately so the active highlight switch is instantaneous
        navigate(targetPath);
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    return (
        <footer className="mt-14 pb-8 max-w-5xl mx-auto px-4 sm:px-6 w-full select-none">
            {/* ── 11 · ICON TAB BAR (FLOATING TRANSLUCENT CAPSULE BAR) ── */}
            <div className="relative rounded-[2rem] sm:rounded-full p-2 sm:p-2.5 shadow-[0_20px_50px_rgba(20,10,60,0.45)] border border-white/20 bg-gradient-to-r from-[#3e248f]/85 via-[#542ebc]/75 to-[#7c3aa8]/85 backdrop-blur-2xl overflow-hidden">
                
                {/* Internal Track Container */}
                <div className="border border-white/20 rounded-[1.75rem] sm:rounded-full px-5 sm:px-7 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6 bg-white/[0.04]">
                    
                    {/* Left balance spacer (hidden on mobile, keeps the center tabs perfectly centered) */}
                    <div className="hidden sm:block w-24 shrink-0 pointer-events-none" aria-hidden="true" />

                    {/* ── CENTER: NAVIGATION TABS MATCHING NAVBAR ── */}
                    <div className="flex items-center justify-center gap-6 sm:gap-10 flex-1">
                        {/* 1. Dashboard Tab (All Roles) */}
                        <button
                            onClick={() => handleTabClick('dashboard', dashboardTarget)}
                            className="flex flex-col items-center justify-center gap-1 group cursor-pointer transition-all"
                            title="Dashboard"
                        >
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                                isDashboardActive 
                                    ? 'bg-gradient-to-tr from-[#d91456] via-[#cb0f41] to-[#e11d48] text-white shadow-md shadow-rose-950/40 scale-105' 
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}>
                                <LayoutDashboard className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                            </div>
                            <span className={`text-[10px] sm:text-[11px] font-semibold tracking-wide transition-colors ${
                                isDashboardActive ? 'text-white font-bold' : 'text-white/75 group-hover:text-white'
                            }`}>
                                Dashboard
                            </span>
                        </button>

                        {/* 2. New Trip Tab (All Roles) */}
                        <button
                            onClick={() => handleTabClick('newTrip', newTripTarget)}
                            className="flex flex-col items-center justify-center gap-1 group cursor-pointer transition-all"
                            title="New Trip"
                        >
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                                isNewTripActive 
                                    ? 'bg-gradient-to-tr from-[#d91456] via-[#cb0f41] to-[#e11d48] text-white shadow-md shadow-rose-950/40 scale-105' 
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}>
                                <PlaneTakeoff className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                            </div>
                            <span className={`text-[10px] sm:text-[11px] font-semibold tracking-wide transition-colors ${
                                isNewTripActive ? 'text-white font-bold' : 'text-white/75 group-hover:text-white'
                            }`}>
                                New Trip
                            </span>
                        </button>

                        {/* 3. Team Roster Tab (Admin Only - Matches Navbar) */}
                        {user?.role === 'ROLE_ADMIN' && (
                            <button
                                onClick={() => handleTabClick('roster', rosterTarget)}
                                className="flex flex-col items-center justify-center gap-1 group cursor-pointer transition-all"
                                title="Team Roster"
                            >
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                                    isRosterActive 
                                        ? 'bg-gradient-to-tr from-[#d91456] via-[#cb0f41] to-[#e11d48] text-white shadow-md shadow-rose-950/40 scale-105' 
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}>
                                    <User className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <span className={`text-[10px] sm:text-[11px] font-semibold tracking-wide transition-colors ${
                                    isRosterActive ? 'text-white font-bold' : 'text-white/75 group-hover:text-white'
                                }`}>
                                    Team Roster
                                </span>
                            </button>
                        )}

                        {/* 4. Insights Tab (Admin & Manager Only - Matches Navbar) */}
                        {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER') && (
                            <button
                                onClick={() => handleTabClick('insights', insightsTarget)}
                                className="flex flex-col items-center justify-center gap-1 group cursor-pointer transition-all"
                                title="Insights"
                            >
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                                    isInsightsActive 
                                        ? 'bg-gradient-to-tr from-[#d91456] via-[#cb0f41] to-[#e11d48] text-white shadow-md shadow-rose-950/40 scale-105' 
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}>
                                    <FileBarChart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <span className={`text-[10px] sm:text-[11px] font-semibold tracking-wide transition-colors ${
                                    isInsightsActive ? 'text-white font-bold' : 'text-white/75 group-hover:text-white'
                                }`}>
                                    Insights
                                </span>
                            </button>
                        )}
                    </div>

                    {/* ── RIGHT: LIVE IST CLOCK, SCROLL TO TOP ── */}
                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        {/* Live Clock Display */}
                        <span className="text-xs sm:text-[13px] font-medium text-white/90 tracking-normal whitespace-nowrap hidden sm:inline-block">
                            {timeString}
                        </span>

                        {/* Scroll to Top Button */}
                        <motion.button
                            onClick={scrollToTop}
                            whileHover={{ scale: 1.08, y: -2 }}
                            whileTap={{ scale: 0.92 }}
                            className="w-8 h-8 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm backdrop-blur-md select-none"
                            title="Scroll to top"
                        >
                            <ArrowUp className="w-4 h-4 text-white" />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* ── BOTTOM COPYRIGHT SIGN-OFF (CLICK TO SMOOTH SCROLL TO TOP) ── */}
            <div 
                onClick={() => smoothScrollToTop(650)}
                className="mt-3 px-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/80 font-medium cursor-pointer hover:text-white transition-colors"
                title="Click to scroll to top"
            >
                <p>© 2026 Trivik Technologies Private Limited. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
