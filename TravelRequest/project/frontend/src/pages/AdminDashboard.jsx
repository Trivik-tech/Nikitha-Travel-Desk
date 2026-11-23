import { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import {
    Plane,
    Receipt,
    CreditCard,
    Ticket,
    Search,
    CheckCircle,
    CheckCircle2,
    XCircle,
    IndianRupee,
    ArrowRight,
    Clock,
    BarChart2,
    Users,
    User,
    Calendar,
    MapPin,
    ShieldCheck,
    RefreshCw,
    X,
    FileText,
    Download,
    TrendingUp,
    Sparkles,
    PlaneTakeoff,
    ExternalLink,
    ChevronRight,
    ChevronLeft,
    Briefcase,
    Train,
    Bus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

// ── Shining Animated Stars Configurations (Slow & Gentle Ambient Twinkle) ────
const HERO_SPARKLES = [
    { top: '15%', left: '8%', size: 20, duration: 6.5, delay: 0 },
    { top: '22%', left: '48%', size: 16, duration: 7.8, delay: 2.2 },
    { top: '18%', left: '82%', size: 22, duration: 8.5, delay: 1.2 },
    { top: '45%', left: '92%', size: 18, duration: 7.0, delay: 3.5 },
    { top: '70%', left: '68%', size: 16, duration: 6.8, delay: 1.8 },
];

const HERO_TWINKLE = [
    { top: '8%', left: '22%', size: 4, duration: 5.2, delay: 0.5 },
    { top: '28%', left: '35%', size: 3, duration: 6.8, delay: 2.4 },
    { top: '12%', left: '65%', size: 4, duration: 6.0, delay: 1.2 },
    { top: '38%', left: '76%', size: 3, duration: 7.5, delay: 3.8 },
    { top: '55%', left: '88%', size: 4, duration: 5.8, delay: 1.5 },
    { top: '65%', left: '42%', size: 3, duration: 6.4, delay: 2.8 },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useContext(AuthContext);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReq, setSelectedReq] = useState(null);

    // Filter & Tab states
    const [activeTab, setActiveTab] = useState('QUEUE'); // 'QUEUE' | 'DISPATCHED' | 'ALL'
    const [searchTerm, setSearchTerm] = useState('');
    const [modeFilter, setModeFilter] = useState('ALL');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const [bookingData, setBookingData] = useState({
        cost: ''
    });

    const [ticketFile, setTicketFile] = useState(null);
    const [returnTicketFile, setReturnTicketFile] = useState(null);
    const [isBooking, setIsBooking] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/requests');
            setRequests(res.data || []);
        } catch (error) {
            console.error('Failed to fetch requests', error);
            toast.error('Failed to load system inventory');
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

    // Sync selectedReq with URL search params (?ticket=...)
    useEffect(() => {
        const ticketId = searchParams.get('ticket');
        if (ticketId && requests.length > 0) {
            const found = requests.find(r => String(r.id) === ticketId);
            if (found) {
                setSelectedReq(found);
            }
        } else if (!ticketId) {
            setSelectedReq(null);
        }
    }, [searchParams, requests]);

    // Reset pagination to page 1 when tab, search, or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm, modeFilter]);

    useEffect(() => {
        if (!selectedReq) {
            setBookingData({ cost: '' });
            setTicketFile(null);
            setReturnTicketFile(null);
            return;
        }

        setBookingData({
            cost: selectedReq.cost ? String(selectedReq.cost) : '',
        });
    }, [selectedReq]);

    const handleSelectTicket = (req) => {
        setSelectedReq(req);
        setSearchParams({ ticket: String(req.id) });
        const el = document.getElementById('admin-workspace-card');
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
        setSearchParams({});
        const el = document.getElementById('admin-workspace-card');
        if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < 70) {
                const navbarHeight = 85;
                const targetY = window.pageYOffset + rect.top - navbarHeight;
                window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
            }
        }
    };

    const getMakeMyTripUrl = (req) => {
        if (!req) return 'https://www.makemytrip.com/flights/';
        
        const extractCode = (str) => {
            if (!str) return '';
            const match = str.match(/\b([A-Z]{3})\b/);
            if (match) return match[1];
            
            const lower = str.toLowerCase();
            if (lower.includes('delhi')) return 'DEL';
            if (lower.includes('mumbai') || lower.includes('bombay')) return 'BOM';
            if (lower.includes('bangalore') || lower.includes('bengaluru')) return 'BLR';
            if (lower.includes('chennai') || lower.includes('madras')) return 'MAA';
            if (lower.includes('kolkata') || lower.includes('calcutta')) return 'CCU';
            if (lower.includes('hyderabad')) return 'HYD';
            if (lower.includes('pune')) return 'PNQ';
            if (lower.includes('ahmedabad')) return 'AMD';
            if (lower.includes('goa')) return 'GOI';
            if (lower.includes('jaipur')) return 'JAI';
            if (lower.includes('kochi') || lower.includes('cochin')) return 'COK';
            if (lower.includes('dubai')) return 'DXB';
            if (lower.includes('singapore')) return 'SIN';
            if (lower.includes('london')) return 'LHR';
            if (lower.includes('paris')) return 'CDG';
            return '';
        };

        const fromCode = extractCode(req.fromLocation);
        const toCode = extractCode(req.toLocation);

        if (req.departureDate && fromCode && toCode) {
            try {
                const d = new Date(req.departureDate);
                if (!Number.isNaN(d.getTime())) {
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    const formattedDate = `${day}/${month}/${year}`;
                    
                    if (req.tripType === 'round-trip' && req.returnDate) {
                        const rd = new Date(req.returnDate);
                        const rDay = String(rd.getDate()).padStart(2, '0');
                        const rMonth = String(rd.getMonth() + 1).padStart(2, '0');
                        const rYear = rd.getFullYear();
                        const formattedReturnDate = `${rDay}/${rMonth}/${rYear}`;
                        return `https://www.makemytrip.com/flight/search?itinerary=${fromCode}-${toCode}-${formattedDate}_${toCode}-${fromCode}-${formattedReturnDate}&tripType=R&paxType=A-1_C-0_I-0&intl=false&cabinClass=E`;
                    }
                    return `https://www.makemytrip.com/flight/search?itinerary=${fromCode}-${toCode}-${formattedDate}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=E`;
                }
            } catch (e) {
                console.error('Error generating MakeMyTrip deep link', e);
            }
        }

        return 'https://www.makemytrip.com/flights/';
    };

    const getBookingPortalConfig = (req) => {
        const mode = (req?.travelMode || 'Flight').toLowerCase();

        if (mode === 'bus') {
            const toSlug = (s) => {
                if (!s) return '';
                const city = s.split(',')[0].replace(/\(.*?\)/g, '').trim().toLowerCase();
                return city.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            };
            const fromSlug = toSlug(req?.fromLocation);
            const toSlugCity = toSlug(req?.toLocation);
            const url = fromSlug && toSlugCity
                ? `https://www.redbus.in/bus-tickets/${fromSlug}-to-${toSlugCity}`
                : 'https://www.redbus.in/';
            return {
                name: 'redBus',
                tag: 'redBus',
                title: 'Book on redBus',
                subtitle: 'Search intercity buses & download confirmed ticket',
                description: 'Click below to search & book this bus journey directly on redBus. Once booked, download the e-ticket PDF and upload it in Step 2 below.',
                buttonText: 'Open redBus to Book Ticket',
                url: url,
                icon: Bus,
                gradient: 'from-[#d84e55] via-[#d81b24] to-[#a3121b]',
                badgeBg: 'bg-rose-100 text-[#d84e55]',
                cardBg: 'from-rose-50 via-white to-amber-50 border-rose-200/80',
                uploadLabel: 'Upload redBus E-Ticket'
            };
        }

        if (mode === 'train') {
            return {
                name: 'IRCTC',
                tag: 'IRCTC',
                title: 'Book on IRCTC Official Portal',
                subtitle: 'Search Indian Railways trains & download confirmed ticket',
                description: 'Click below to search & book this train journey directly on the official IRCTC portal. Once booked, download the e-ticket PDF and upload it in Step 2 below.',
                buttonText: 'Open IRCTC to Book Ticket',
                url: 'https://www.irctc.co.in/nget/train-search',
                icon: Train,
                gradient: 'from-[#0f3b7a] via-[#1a56db] to-[#0284c7]',
                badgeBg: 'bg-blue-100 text-[#0f3b7a]',
                cardBg: 'from-blue-50 via-white to-sky-50 border-blue-200/80',
                uploadLabel: 'Upload IRCTC E-Ticket'
            };
        }

        // Default: Flight -> MakeMyTrip
        return {
            name: 'MakeMyTrip',
            tag: 'MMT',
            title: 'Book on MakeMyTrip',
            subtitle: 'Search flights & download confirmed ticket',
            description: 'Click below to search & book this flight directly on MakeMyTrip. Once booked, download the e-ticket PDF and upload it in Step 2 below.',
            buttonText: 'Open MakeMyTrip to Book Ticket',
            url: getMakeMyTripUrl(req),
            icon: Plane,
            gradient: 'from-[#e41b23] via-[#d8164b] to-[#0084ff]',
            badgeBg: 'bg-rose-100 text-[#e41b23]',
            cardBg: 'from-rose-50 via-white to-sky-50 border-rose-200/80',
            uploadLabel: 'Upload MakeMyTrip E-Ticket'
        };
    };

    const handleBookTicket = async (e) => {
        e.preventDefault();
        if (!selectedReq) return;

        const costNumber = parseFloat(bookingData.cost);
        if (isNaN(costNumber) || costNumber < 0) {
            toast.error('Enter a valid numeric cost');
            return;
        }

        const loadToast = toast.loading('Finalizing corporate booking...');
        setIsBooking(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                toast.error('Session expired. Please log in.', { id: loadToast });
                navigate('/login');
                return;
            }
            const storedUser = JSON.parse(userStr);
            const token = storedUser.accessToken;

            const formData = new FormData();
            formData.append('cost', costNumber);

            if (ticketFile) formData.append('file', ticketFile);
            if (returnTicketFile) formData.append('returnFile', returnTicketFile);

            await api.post(`/requests/${selectedReq.id}/fulfillment`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            toast.success('Itinerary successfully booked and ticket dispatched!', { id: loadToast });
            handleBackToList();
            fetchRequests();
        } catch (error) {
            console.error('CRITICAL: Fulfillment failed:', error);
            const status = error.response?.status;
            const errorMsg = error.response?.data?.message || error.response?.data || error.message;

            if (status === 401) {
                toast.error(`Unauthorized: ${errorMsg}`, { id: loadToast });
                return;
            }
            toast.error(`Fulfillment failed: ${errorMsg}`, { id: loadToast });
        } finally {
            setIsBooking(false);
        }
    };

    const approvedRequests = useMemo(() => requests.filter(r => r.status === 'APPROVED'), [requests]);
    const bookedRequests = useMemo(() => requests.filter(r => r.status === 'BOOKED'), [requests]);
    const allBookedRequests = useMemo(() => requests.filter(r => r.status === 'BOOKED'), [requests]);

    const insights = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        let monthlyCost = 0;
        let yearlyCost = 0;
        let monthlyTrips = 0;
        let yearlyTrips = 0;

        const userStats = {};

        bookedRequests.forEach(req => {
            const date = new Date(req.departureDate);
            if (Number.isNaN(date.getTime())) return;
            const cost = Number(req.cost) || 0;

            if (date.getFullYear() === currentYear) {
                yearlyCost += cost;
                yearlyTrips += 1;
                if (date.getMonth() === currentMonth) {
                    monthlyCost += cost;
                    monthlyTrips += 1;
                }
            }

            const userId = req.employee?.id;
            if (!userId) return;
            if (!userStats[userId]) {
                userStats[userId] = {
                    id: userId,
                    name: req.employee?.name || 'Unknown',
                    email: req.employee?.email || '',
                    trips: 0,
                    cost: 0,
                    lastTravel: date,
                };
            }
            const entry = userStats[userId];
            entry.trips += 1;
            entry.cost += cost;
            if (date > entry.lastTravel) {
                entry.lastTravel = date;
            }
        });

        const userStatsList = Object.values(userStats).sort((a, b) => (b.trips || 0) - (a.trips || 0));
        const topTraveler = userStatsList[0] || null;

        return {
            monthlyCost,
            yearlyCost,
            monthlyTrips,
            yearlyTrips,
            topTraveler,
            userStats: userStatsList,
        };
    }, [bookedRequests]);

    // Filtered list based on active tab, search, and mode
    const displayedRequests = useMemo(() => {
        let baseList = [];
        if (activeTab === 'QUEUE') baseList = approvedRequests;
        else if (activeTab === 'DISPATCHED') baseList = bookedRequests;
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
    }, [requests, approvedRequests, bookedRequests, activeTab, searchTerm, modeFilter]);

    const totalAnnualSpend = useMemo(() => {
        return allBookedRequests.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
    }, [allBookedRequests]);

    const totalPages = Math.max(1, Math.ceil(displayedRequests.length / pageSize));
    const paginatedRequests = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return displayedRequests.slice(start, start + pageSize);
    }, [displayedRequests, currentPage, pageSize]);

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
                {/* Soft glowing cloud-like bokeh orbs drifting across sky */}
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

            {/* Sparkling 4-Point Stars */}
            {HERO_SPARKLES.map((star, idx) => (
                <motion.div
                    key={`hero-sparkle-${idx}`}
                    className="absolute pointer-events-none select-none"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                    }}
                    initial={{ opacity: 0.2, scale: 0.7 }}
                    animate={{
                        opacity: [0.2, 0.9, 0.2],
                        scale: [0.7, 1.25, 0.7],
                        rotate: [0, 12, 0],
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
            {HERO_TWINKLE.map((star, idx) => (
                <motion.div
                    key={`hero-twinkle-${idx}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        backgroundColor: '#ffffff',
                        boxShadow: `0 0 ${star.size * 2.5}px ${star.size * 0.8}px rgba(255, 255, 255, 0.85)`,
                    }}
                    animate={{
                        opacity: [0.2, 0.85, 0.2],
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
            </div>

            <div className="w-full max-w-7xl mx-auto relative z-10 space-y-6">
                {/* ── 1. CORPORATE TICKETING DESK HEADER ─────────────────── */}
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-sm mb-4"
                    >
                        CORPORATE TICKETING DESK
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-3 drop-shadow-md"
                    >
                        Inventory &amp; Booking
                        <br />
                        <span className="text-white">Control.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-sm sm:text-base text-white/90 font-medium leading-relaxed max-w-xl"
                    >
                        Purchase corporate flights, finalize reservations and issue verified e-tickets to employees.
                    </motion.p>
                </div>

                {/* ── 2. STATS ROW (4 COMPACT WHITE CARDS) ─────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
                    {/* Card 1: Awaiting Booking */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => { setActiveTab('QUEUE'); setSelectedReq(null); }}
                        className={`p-4 sm:p-4.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden bg-white border border-white/80 shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] group select-none ${
                            activeTab === 'QUEUE'
                                ? 'border-amber-400 ring-2 ring-amber-100/70 shadow-amber-500/15'
                                : 'hover:border-amber-100 hover:shadow-lg'
                        }`}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                                <Clock className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100/80 flex items-center gap-1 shadow-2xs">
                                <span className={`w-1.5 h-1.5 rounded-full bg-amber-500 ${approvedRequests.length > 0 ? 'animate-ping' : ''}`} />
                                Queue
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Awaiting Booking
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <p className="text-2xl font-black tracking-tight text-slate-900">
                                    {approvedRequests.length}
                                </p>
                                <span className="text-[11px] font-bold text-amber-600">
                                    {approvedRequests.length > 0 ? 'Action needed' : 'Clear'}
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block truncate">
                                Ready for ticket issue
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 2: Dispatched Tickets */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => { setActiveTab('DISPATCHED'); setSelectedReq(null); }}
                        className={`p-4 sm:p-4.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden bg-white border border-white/80 shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] group select-none ${
                            activeTab === 'DISPATCHED'
                                ? 'border-emerald-500 ring-2 ring-emerald-100/70 shadow-emerald-500/15'
                                : 'hover:border-emerald-100 hover:shadow-lg'
                        }`}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                                <Ticket className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100/80 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Dispatched
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Dispatched Tickets
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <p className="text-2xl font-black tracking-tight text-slate-900">
                                    {bookedRequests.length}
                                </p>
                                <span className="text-[11px] font-bold text-emerald-600">
                                    {bookedRequests.length > 0 ? 'Verified' : 'None'}
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block truncate">
                                Tickets issued
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 3: This Month Spend */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="p-4 sm:p-4.5 rounded-2xl transition-all duration-300 relative overflow-hidden bg-white border border-white/80 shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] group select-none hover:shadow-lg"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#6541e9] to-[#818cf8] text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                                <IndianRupee className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-[#6541e9] border border-indigo-100/80 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#6541e9]" />
                                Spend
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                This Month Spend
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <p className="text-2xl font-black tracking-tight truncate text-slate-900">
                                    ₹{(insights?.monthlyCost || 0).toLocaleString('en-IN')}
                                </p>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block truncate">
                                {insights?.monthlyTrips || 0} trips this month
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 4: Team Roster / User Management */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => navigate('/admin/users')}
                        className="p-4 sm:p-4.5 rounded-2xl text-white shadow-lg shadow-rose-950/20 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between group border border-white/20 select-none"
                        style={{
                            background: 'linear-gradient(135deg, #d91456 0%, #cb0f41 45%, #8c1d7e 100%)',
                        }}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-md group-hover:scale-105 transition-transform">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 border border-white/30 text-white backdrop-blur-md shadow-2xs flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                                <span>Roster</span>
                            </span>
                        </div>
                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block">
                                TEAM ROSTER
                            </span>
                            <p className="text-xl sm:text-2xl font-black text-white mt-0.5 leading-tight tracking-tight">
                                User Management
                            </p>
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-white/95 group-hover:underline">
                                <span>Manage roles →</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── 3. FLOATING WHITE WORKSPACE CARD ───────────────────── */}
                <div id="admin-workspace-card" className="bg-white backdrop-blur-2xl rounded-[2.8rem] p-7 sm:p-10 border border-white/80 shadow-[0_25px_70px_-15px_rgba(20,10,60,0.3)] space-y-8 relative overflow-hidden">
                    {/* Filter & Command Strip */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-100">
                        {/* Tabs */}
                        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-none">
                            <button
                                onClick={() => { setActiveTab('QUEUE'); setSelectedReq(null); }}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                                    activeTab === 'QUEUE'
                                        ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <span>Booking Queue</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    activeTab === 'QUEUE' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                                }`}>
                                    {approvedRequests.length}
                                </span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('DISPATCHED'); setSelectedReq(null); }}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                                    activeTab === 'DISPATCHED'
                                        ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <span>Dispatched Tickets</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    activeTab === 'DISPATCHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                                }`}>
                                    {bookedRequests.length}
                                </span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('ALL'); setSelectedReq(null); }}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                                    activeTab === 'ALL'
                                        ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <span>All Requests</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                                    {requests.length}
                                </span>
                            </button>
                        </div>

                        {/* Search & Mode Filters */}
                        <div className="flex items-center gap-2.5 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Filter employee, city, ref..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#6541e9] focus:ring-2 focus:ring-[#6541e9]/15 outline-none transition-all"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <select
                                value={modeFilter}
                                onChange={(e) => setModeFilter(e.target.value)}
                                className="px-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#6541e9] cursor-pointer"
                            >
                                <option value="ALL">All Modes</option>
                                <option value="Flight">Flights</option>
                                <option value="Train">Trains</option>
                                <option value="Cab">Cabs</option>
                            </select>

                            <button
                                onClick={fetchRequests}
                                title="Sync requests"
                                className="p-2.5 rounded-xl border border-slate-200/90 text-slate-500 hover:text-[#6541e9] hover:bg-slate-50 transition-all cursor-pointer"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* ── MAIN WORKSPACE: DEDICATED FULFILLMENT PAGE vs FULL-WIDTH INVENTORY CONSOLE ── */}
                    <AnimatePresence mode="wait">
                {selectedReq ? (
                    /* ══════════════════════════════════════════════════════════ */
                    /* ── VIEW 1: DEDICATED FULFILLMENT & E-TICKET ISSUANCE PAGE ─ */
                    /* ══════════════════════════════════════════════════════════ */
                    <motion.div
                        key={`fulfill-${selectedReq.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Navigation Bar / Breadcrumb Strip */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/90">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleBackToList}
                                    className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#163c8c] transition-all group flex items-center gap-2 font-bold text-xs"
                                >
                                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                    <span>Back to {activeTab === 'DISPATCHED' ? 'Dispatched Tickets' : 'Booking Queue'}</span>
                                </button>
                                <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />
                                <div className="hidden sm:block">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Navigation</p>
                                    <p className="text-xs font-extrabold text-slate-700">
                                        Admin Console / {activeTab === 'DISPATCHED' ? 'Dispatched Tickets' : 'Booking Queue'} / <span className="text-[#163c8c]">Ref #{selectedReq.id}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${
                                    selectedReq.status === 'BOOKED'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}>
                                    {selectedReq.status === 'BOOKED' ? '✓ E-Ticket Dispatched' : '⚡ Pending E-Ticket Fulfillment'}
                                </span>
                            </div>
                        </div>

                        {/* Dedicated Fulfillment 2-Column Spacious Workspace */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* ── LEFT COLUMN: TRAVELER DOSSIER & ROUTE SUMMARY (7 Cols) ── */}
                            <div className="lg:col-span-7 space-y-5">
                                {/* Passenger Profile Card */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#163c8c] to-blue-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-900/20 shrink-0">
                                                {(selectedReq.employee?.name || selectedReq.employee?.email || 'EP')
                                                    .split(' ')
                                                    .map(n => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                                                        {selectedReq.employee?.name || 'Corporate Traveler'}
                                                    </h3>
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                                        Ref: #{selectedReq.id}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                    {selectedReq.employee?.email}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="px-3 py-1 rounded-xl bg-indigo-50 text-[#163c8c] font-black text-[11px] uppercase tracking-wider border border-indigo-100">
                                            {selectedReq.travelMode || 'Flight'}
                                        </span>
                                    </div>

                                    {/* Route Visualization */}
                                    <div className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 rounded-2xl p-5 border border-slate-100">
                                        <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200/60 mb-4">
                                            <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">
                                                {selectedReq.travelMode || 'Flight'} Route & Timings
                                            </span>
                                            <span className="font-black text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-lg text-[10px] uppercase">
                                                {selectedReq.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            {/* Origin */}
                                            <div className="text-left flex-1 min-w-0">
                                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                                                    {selectedReq.travelMode === 'Train' ? 'Boarding Station' : selectedReq.travelMode === 'Bus' ? 'Boarding Point / City' : 'Departure Airport / City'}
                                                </p>
                                                <p className="font-black text-slate-900 text-base sm:text-lg mt-0.5 truncate">{selectedReq.fromLocation}</p>
                                                <p className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-[#163c8c]" />
                                                    <span>{new Date(selectedReq.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </p>
                                                {selectedReq.preferredTime && (
                                                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{selectedReq.preferredTime}</span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* Center Transit Contrail */}
                                            <div className="flex flex-col items-center px-2 shrink-0">
                                                <div className="flex items-center gap-1 text-[#163c8c]">
                                                    <div className="w-6 sm:w-10 h-[2px] bg-gradient-to-r from-blue-200 to-blue-400" />
                                                    <div className="p-2 rounded-full bg-white shadow-xs border border-blue-100">
                                                        {selectedReq.travelMode === 'Train' ? (
                                                            <Train className="w-4 h-4 text-[#163c8c]" />
                                                        ) : selectedReq.travelMode === 'Bus' ? (
                                                            <Bus className="w-4 h-4 text-[#163c8c]" />
                                                        ) : (
                                                            <Plane className="w-4 h-4 transform rotate-45 text-[#163c8c]" />
                                                        )}
                                                    </div>
                                                    <div className="w-6 sm:w-10 h-[2px] bg-gradient-to-r from-blue-400 to-blue-200" />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase mt-1 tracking-wider">
                                                    {selectedReq.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                                                </span>
                                            </div>

                                            {/* Destination */}
                                            <div className="text-right flex-1 min-w-0">
                                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Arrival Destination</p>
                                                <p className="font-black text-[#163c8c] text-base sm:text-lg mt-0.5 truncate">{selectedReq.toLocation}</p>
                                                {selectedReq.tripType === 'round-trip' && selectedReq.returnDate && (
                                                    <>
                                                        <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center justify-end gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>{new Date(selectedReq.returnDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </p>
                                                        {selectedReq.preferredReturnTime && (
                                                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-end gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{selectedReq.preferredReturnTime}</span>
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Purpose & Approvals */}
                                    {selectedReq.reasonForTravel && (
                                        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Purpose of Travel</p>
                                            <p className="text-xs text-slate-700 font-medium italic">
                                                "{selectedReq.reasonForTravel}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Manager Review Notes if any */}
                                    {selectedReq.managerComments && (
                                        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100/80 space-y-1">
                                            <p className="text-[10px] text-amber-800 uppercase font-black tracking-wider">Manager Review Notes</p>
                                            <p className="text-xs text-amber-900 font-medium">
                                                "{selectedReq.managerComments}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Existing Dispatched Passes if BOOKED */}
                                    {selectedReq.status === 'BOOKED' && (selectedReq.departureTicketPath || selectedReq.returnTicketPath) && (
                                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
                                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                                <Ticket className="w-4 h-4 text-emerald-600" />
                                                <span>Active Dispatched Passes:</span>
                                            </span>
                                            {selectedReq.departureTicketPath && (
                                                <a
                                                    href={`/api/requests/${selectedReq.id}/departure-ticket`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#163c8c] hover:bg-blue-100 text-xs font-bold transition-all flex items-center gap-1.5 border border-blue-100 shadow-xs"
                                                >
                                                    <span>Departure E-Ticket</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                            {selectedReq.returnTicketPath && (
                                                <a
                                                    href={`/api/requests/${selectedReq.id}/return-ticket`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-100 shadow-xs"
                                                >
                                                    <span>Return E-Ticket</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── RIGHT COLUMN: FULFILLMENT & COST DISPATCH FORM (5 Cols) ─ */}
                            <div className="lg:col-span-5 sticky top-24 space-y-6">
                                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90 relative overflow-hidden">
                                    <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                                        <div className="w-2.5 h-6 bg-gradient-to-b from-[#163c8c] to-blue-500 rounded-full" />
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                                Fulfillment & E-Ticket Desk
                                            </h3>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                Issue Digital Pass & Record Tariff
                                            </p>
                                        </div>
                                    </div>

                                    {/* ── Step 1: Mode-Aware Booking Gateway (MakeMyTrip / redBus / IRCTC) ── */}
                                    {(() => {
                                        const portal = getBookingPortalConfig(selectedReq);
                                        const PortalIcon = portal.icon;
                                        return (
                                            <div className={`mb-5 p-4 rounded-2xl bg-gradient-to-br ${portal.cardBg} shadow-xs`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-8 h-7 px-1.5 rounded-lg bg-gradient-to-tr ${portal.gradient} text-white flex items-center justify-center font-black text-[10px] tracking-tight shadow-xs`}>
                                                            {portal.tag}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-black text-slate-900 leading-tight">
                                                                {portal.title}
                                                            </h4>
                                                            <p className="text-[10px] text-slate-400 font-medium">
                                                                {portal.subtitle}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full ${portal.badgeBg} text-[9px] font-black uppercase tracking-wider`}>
                                                        Step 1 of 2
                                                    </span>
                                                </div>

                                                <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                                                    {portal.description}
                                                </p>

                                                <a
                                                    href={portal.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${portal.gradient} hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 select-none`}
                                                >
                                                    <div className="w-5 h-5 rounded-md bg-white/25 flex items-center justify-center">
                                                        <PortalIcon className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                    <span>{portal.buttonText}</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        );
                                    })()}

                                    <form onSubmit={handleBookTicket} className="space-y-5">
                                        <div className="flex items-center justify-between pt-1 pb-1 border-b border-slate-100">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                Step 2: Tariff & Ticket Upload
                                            </span>
                                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                                <span>✓ {getBookingPortalConfig(selectedReq).uploadLabel}</span>
                                            </span>
                                        </div>

                                        {/* Cost Input */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-extrabold text-slate-700 block">
                                                Final Ticket Cost (₹) <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                    value={bookingData.cost}
                                                    onChange={(e) => setBookingData({ ...bookingData, cost: e.target.value })}
                                                    placeholder="e.g. 70000"
                                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Ticket Uploads */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                                                    Upload Departure Ticket <span className="text-slate-400 font-normal">(PDF or Image)</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".pdf,image/*"
                                                    onChange={(e) => setTicketFile(e.target.files?.[0] || null)}
                                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#163c8c] hover:file:bg-blue-100 cursor-pointer border border-slate-200/80 rounded-xl p-1 bg-slate-50"
                                                />
                                                {selectedReq?.departureTicketPath && (
                                                    <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                                                        <span>✓ Departure ticket currently on file</span>
                                                    </p>
                                                )}
                                            </div>

                                            {selectedReq.tripType === 'round-trip' && (
                                                <div>
                                                    <label className="text-xs font-extrabold text-slate-700 block mb-1">
                                                        Upload Return Ticket <span className="text-slate-400 font-normal">(PDF or Image)</span>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,image/*"
                                                        onChange={(e) => setReturnTicketFile(e.target.files?.[0] || null)}
                                                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-slate-200/80 rounded-xl p-1 bg-slate-50"
                                                    />
                                                    {selectedReq?.returnTicketPath && (
                                                        <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                                                            <span>✓ Return ticket currently on file</span>
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Policy Info Box */}
                                        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-slate-600">
                                            <ShieldCheck className="w-4 h-4 text-[#163c8c] shrink-0 mt-0.5" />
                                            <span>Issued passes are instantly synced to the employee's dashboard and emailed directly.</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={handleBackToList}
                                                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all text-center"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={isBooking}
                                                className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#163c8c] via-blue-700 to-[#163c8c] hover:from-[#0f2d6b] hover:to-blue-800 text-white text-xs font-bold shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
                                            >
                                                <Ticket className="w-4 h-4 text-white" />
                                                <span>{isBooking ? 'Dispatching...' : 'Issue E-Ticket'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* ══════════════════════════════════════════════════════════ */
                    /* ── VIEW 2: FULL-WIDTH INVENTORY CONSOLE WITH PAGINATION ─ */
                    /* ══════════════════════════════════════════════════════════ */
                    <motion.div
                        key="list-page"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        {/* Requisitions Header Strip */}
                        <div id="inventory-queue-section" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 scroll-mt-24">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-[#163c8c] animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#163c8c]">
                                        Live Inventory Queue
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                                    <span>{activeTab === 'QUEUE' ? 'Fulfillment Queue' : activeTab === 'DISPATCHED' ? 'Dispatched E-Tickets' : 'All Travel Records'}</span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#163c8c] text-xs font-black border border-blue-100">
                                        {displayedRequests.length} {displayedRequests.length === 1 ? 'Record' : 'Records'}
                                    </span>
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={fetchRequests}
                                    title="Sync feed"
                                    className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-[#163c8c] hover:bg-slate-50 transition-all shadow-xs"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={() => navigate('/reports')}
                                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
                                >
                                    <span>Financial Reports</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-36 bg-white rounded-3xl border border-slate-200/80 animate-pulse p-6" />
                                ))}
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                {displayedRequests.length === 0 ? (
                                    /* Empty State Matching User Mockup */
                                    <motion.div
                                        key={`empty-${activeTab}`}
                                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                                        transition={{ duration: 0.35, ease: 'easeOut' }}
                                        className="p-8 sm:p-14 text-center relative overflow-hidden"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-[#f2ebff] text-[#7c3aed] flex items-center justify-center mx-auto mb-5 shadow-sm">
                                            <Plane className="w-6 h-6 transform rotate-45 text-[#7c3aed]" />
                                        </div>

                                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                                            {activeTab === 'QUEUE' ? 'All Clear — Booking Queue Empty!' : 'No Records Found'}
                                        </h3>
                                        <p className="text-sm text-slate-500 max-w-lg mx-auto mb-8 leading-relaxed font-medium">
                                            {activeTab === 'QUEUE' 
                                                ? 'Zero manager-approved trips are waiting for booking. All employee flight requests have been issued corporate e-tickets.'
                                                : 'There are no travel records matching your current filter criteria.'}
                                        </p>

                                        <div className="flex flex-wrap items-center justify-center gap-3.5">
                                            {activeTab === 'QUEUE' && bookedRequests.length > 0 && (
                                                <motion.button
                                                    whileHover={{ scale: 1.04, y: -2 }}
                                                    whileTap={{ scale: 0.94 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                    onClick={() => {
                                                        setActiveTab('DISPATCHED');
                                                        setSelectedReq(null);
                                                        const el = document.getElementById('inventory-queue-section');
                                                        if (el) {
                                                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                        }
                                                    }}
                                                    className="px-6 py-3.5 rounded-2xl text-white font-bold text-xs shadow-lg shadow-rose-900/25 hover:shadow-rose-900/40 transition-all select-none flex items-center gap-2 cursor-pointer active:shadow-md"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #d91456 0%, #cb0f41 50%, #8c1d7e 100%)',
                                                    }}
                                                >
                                                    <Ticket className="w-4 h-4" />
                                                    <span>View {bookedRequests.length} Dispatched Tickets</span>
                                                </motion.button>
                                            )}
                                            <motion.button
                                                whileHover={{ scale: 1.03, y: -2 }}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={() => navigate('/admin/users')}
                                                className="px-6 py-3.5 rounded-2xl bg-[#f0edff] hover:bg-[#e4ddff] text-[#6541e9] font-bold text-xs transition-all select-none flex items-center gap-2 cursor-pointer"
                                            >
                                                <Users className="w-4 h-4 text-[#6541e9]" />
                                                <span>Team User Roster</span>
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.03, y: -2 }}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={() => navigate('/reports')}
                                                className="px-6 py-3.5 rounded-2xl bg-[#f0edff] hover:bg-[#e4ddff] text-[#6541e9] font-bold text-xs transition-all select-none flex items-center gap-2 cursor-pointer"
                                            >
                                                <BarChart2 className="w-4 h-4 text-[#6541e9]" />
                                                <span>Reports & Spend</span>
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* Full-Width Luxury Boarding Pass Cards */
                                    <motion.div
                                        key={`list-${activeTab}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-4"
                                    >
                                        <AnimatePresence mode="popLayout">
                                            {paginatedRequests.map((req, idx) => {
                                        const isApproved = req.status === 'APPROVED';
                                        const isBooked = req.status === 'BOOKED';

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
                                                whileHover={{ y: -3 }}
                                                transition={{ duration: 0.25 }}
                                                onClick={() => handleSelectTicket(req)}
                                                className="group relative rounded-3xl bg-white p-5 sm:p-6 transition-all duration-300 cursor-pointer border border-slate-200/80 hover:border-[#6541e9]/50 hover:shadow-[0_20px_45px_-10px_rgba(101,65,233,0.18)]"
                                            >
                                                {/* Top Strip: Passenger, ID & Status */}
                                                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6541e9] via-[#852278] to-[#cb0f41] text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
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
                                                            <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate max-w-[180px] sm:max-w-md">
                                                                {req.employee?.email || 'employee@company.com'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2.5">
                                                        {isBooked && req.cost && (
                                                            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 shadow-xs">
                                                                ₹{Number(req.cost).toLocaleString('en-IN')}
                                                            </span>
                                                        )}
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${
                                                            isApproved
                                                                ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                                                                : isBooked
                                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                                                : 'bg-slate-100 text-slate-700 border-slate-200'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-amber-500 animate-ping' : 'bg-emerald-600'}`} />
                                                            <span>{isApproved ? 'Approved (Needs Booking)' : req.status}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Flight Route Visualizer with Airport Codes & Contrail */}
                                                <div className="bg-gradient-to-r from-slate-50 via-indigo-50/25 to-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
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
                                                                <div className="w-8 sm:w-16 h-[2px] bg-gradient-to-r from-indigo-200 to-indigo-400" />
                                                                <div className="p-1.5 rounded-full bg-white shadow-xs border border-indigo-100">
                                                                    {req.travelMode === 'Train' ? (
                                                                        <Train className="w-3.5 h-3.5 text-[#6541e9]" />
                                                                    ) : req.travelMode === 'Bus' ? (
                                                                        <Bus className="w-3.5 h-3.5 text-[#6541e9]" />
                                                                    ) : (
                                                                        <Plane className="w-3.5 h-3.5 transform rotate-45 text-[#6541e9]" />
                                                                    )}
                                                                </div>
                                                                <div className="w-8 sm:w-16 h-[2px] bg-gradient-to-r from-indigo-400 to-indigo-200" />
                                                            </div>
                                                            <span className="text-[9px] font-black text-[#6541e9] bg-indigo-50 px-2 py-0.5 rounded-full mt-1 uppercase tracking-wider border border-indigo-100">
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

                                                {/* Metadata Strip: Date, Mode, Downloads & CTA */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                                                    <div className="flex flex-wrap items-center gap-3 text-slate-600">
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

                                                        {/* Ticket Download Links if Booked */}
                                                        {isBooked && (req.departureTicketPath || req.returnTicketPath) && (
                                                            <div className="flex items-center gap-2">
                                                                {req.departureTicketPath && (
                                                                    <a
                                                                        href={`/api/requests/${req.id}/departure-ticket`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        onClick={e => e.stopPropagation()}
                                                                        className="text-[11px] font-bold text-[#6541e9] hover:underline flex items-center gap-1 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100"
                                                                    >
                                                                        <span>Pass</span>
                                                                        <ExternalLink className="w-3 h-3" />
                                                                    </a>
                                                                )}
                                                                {req.returnTicketPath && (
                                                                    <a
                                                                        href={`/api/requests/${req.id}/return-ticket`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        onClick={e => e.stopPropagation()}
                                                                        className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100"
                                                                    >
                                                                        <span>Return Pass</span>
                                                                        <ExternalLink className="w-3 h-3" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action CTA Button */}
                                                    <div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSelectTicket(req);
                                                            }}
                                                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                                                                isApproved
                                                                    ? 'text-white shadow-md shadow-rose-900/20 hover:scale-105 active:scale-95'
                                                                    : 'bg-slate-100 text-slate-700 hover:bg-[#6541e9] hover:text-white'
                                                            }`}
                                                            style={{
                                                                background: isApproved ? 'linear-gradient(135deg, #cb0f41 0%, #852278 100%)' : undefined,
                                                            }}
                                                        >
                                                            <span>{isApproved ? 'Issue E-Ticket ✈' : 'View Fulfillment'}</span>
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Purpose Snippet */}
                                                {req.reasonForTravel && (
                                                    <div className="mt-3 text-[11px] text-slate-500 font-medium truncate bg-slate-50/70 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-1.5">
                                                        <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="font-bold text-slate-700">Purpose:</span>
                                                        <span className="truncate">{req.reasonForTravel}</span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                        {/* ── PAGINATION CONTROLS (NAVIGATION OF PAGES) ─────────── */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
                                <div className="text-xs text-slate-500 font-bold">
                                    Showing <span className="text-slate-900 font-black">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-slate-900 font-black">{Math.min(currentPage * pageSize, displayedRequests.length)}</span> of <span className="text-slate-900 font-black">{displayedRequests.length}</span> requisitions
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                        <span>Previous</span>
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                                                currentPage === page
                                                    ? 'bg-[#163c8c] text-white shadow-sm shadow-blue-900/20'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                    >
                                        <span>Next</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
