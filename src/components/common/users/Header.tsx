import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { logoutUser } from "../../../redux/actions/auth/logoutUserAction";
import { fetchUserData } from "../../../redux/actions/auth/fetchUserdataAction";
import { userClearError } from "../../../redux/reducers/userReducer";
import { getSubscriptionStatus } from "../../../redux/actions/subscriptionActions";
import Notifications from "./Notifications";
import { useSocket } from "@/components/context/socketContext";

interface NotificationEvent {
  success: boolean;
  data: unknown[];
  unreadCount: number;
}

interface NotificationReadEvent {
  notificationId: string;
  unreadCount: number;
}

interface AllNotificationsReadEvent {
  unreadCount: number;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useSocket();
  const { isAuthenticated, userData } = useSelector((state: RootState) => state.user);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch user data, subscription status, and notifications
  useEffect(() => {
    dispatch(userClearError());

    // Fetch user data if authenticated and userData is not yet available
    if (isAuthenticated && !userData) {
      setLoading(true);
      dispatch(fetchUserData())
        .unwrap()
        .then(() => {
          setLoading(false);
        })
        .catch((err) => {
          const error = err as { message?: string };
          console.error("Error fetching user data:", error.message ?? err);
          setLoading(false);
        });
    }

    // Fetch subscription status if authenticated and userData is available
    if (isAuthenticated && userData?._id) {
      dispatch(getSubscriptionStatus(userData._id))
        .unwrap()
        .then((result) => {
          setHasActiveSubscription(result.data?.hasActiveSubscription ?? false);
        })
        .catch((err) => {
          const error = err as { message?: string };
          console.error("Error fetching subscription status:", error.message ?? err);
          setHasActiveSubscription(false);
        });
    }

    // Fetch notifications if socket is connected
    if (socket && isAuthenticated) {
      socket.emit("getNotifications", { page: 1, limit: 10 });

      socket.on("notifications", (data: NotificationEvent) => {
        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      });

      socket.on("notificationRead", (data: NotificationReadEvent) => {
        setUnreadCount(data.unreadCount);
      });

      socket.on("allNotificationsRead", (data: AllNotificationsReadEvent) => {
        setUnreadCount(data.unreadCount);
      });

      return () => {
        socket.off("notifications");
        socket.off("notificationRead");
        socket.off("allNotificationsRead");
      };
    }
  }, [dispatch, isAuthenticated, userData, socket]);

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
    setIsNotificationsOpen(false); 
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsMenuOpen(false); 
  };

  const handleLogout = () => {
    toast.success("Logout successful");
    dispatch(logoutUser());
    setIsNotificationsOpen(false);
  };

  const navLinks = [
    { href: "/home", text: "Home" },
    { href: "/all-courses", text: "All Courses" },
    { href: "/teach", text: "Teach" },
    { href: "/contact", text: "Contact" },
  ];

  if (loading) {
    return (
      <header
        className={`bg-black/95 backdrop-blur-lg py-4 md:py-6 shadow-2xl fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50 transition-all duration-300`}
      >
        <div className="container mx-auto flex justify-center px-4 md:px-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-[#49bbbd] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading...</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`bg-black/95 backdrop-blur-lg shadow-2xl fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50 transition-all duration-300 ${
        scrolled ? "py-3 md:py-4" : "py-4 md:py-6"
      }`}
    >
      <div className="container mx-auto flex flex-wrap justify-between items-center px-4 md:px-6">
        {/* Logo with enhanced styling */}
        <div className="flex items-center group">
          <h1 className="text-white text-2xl md:text-3xl font-bold flex items-center cursor-pointer transition-all duration-300 hover:scale-105">
            <span className="relative">
              Edu
              <div className="absolute -inset-1 bg-gradient-to-r from-[#49bbbd]/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </span>
            <span className="text-[#49bbbd] relative">
              Zest
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#49bbbd] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </span>
          </h1>
        </div>

        {/* Enhanced hamburger menu */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white p-3 focus:outline-none relative group rounded-lg hover:bg-white/10 transition-all duration-300"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span
              className={`w-full h-0.5 bg-white transform transition-all duration-300 origin-center ${
                isMenuOpen ? "rotate-45 translate-y-2" : "group-hover:w-5"
              }`}
            />
            <span
              className={`w-full h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "opacity-0 translate-x-3" : "group-hover:w-4"
              }`}
            />
            <span
              className={`w-full h-0.5 bg-white transform transition-all duration-300 origin-center ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : "group-hover:w-5"
              }`}
            />
          </div>
        </button>

        {/* Enhanced Navigation */}
        <nav
          className={`${
            isMenuOpen ? "flex opacity-100 translate-y-0" : "hidden opacity-0 -translate-y-4"
          } md:flex md:opacity-100 md:translate-y-0 w-full md:w-auto mt-4 md:mt-0 transition-all duration-300`}
        >
          <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-1 w-full md:w-auto">
            {navLinks.map((link, index) => (
              <li key={index} className="text-center">
                <a
                  href={link.href}
                  className="text-white text-lg hover:text-[#49bbbd] transition-all duration-300 block md:inline px-4 py-2 rounded-lg relative group hover:bg-white/5"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">{link.text}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#49bbbd]/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#49bbbd] group-hover:w-3/4 group-hover:left-1/8 transition-all duration-300"></div>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Enhanced Auth Section */}
        <div
          className={`${
            isMenuOpen ? "flex opacity-100 translate-y-0" : "hidden opacity-0 -translate-y-4"
          } md:flex md:opacity-100 md:translate-y-0 items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto mt-4 md:mt-0 flex-col md:flex-row transition-all duration-300 relative`}
        >
          {isAuthenticated ? (
            <>
              {/* Notifications Bell Icon */}
              <button
                onClick={toggleNotifications}
                className="text-white p-2 rounded-lg relative group hover:bg-white/10 transition-all duration-300"
                aria-label="Notifications"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#49bbbd]/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              {isNotificationsOpen && <Notifications onClose={() => setIsNotificationsOpen(false)} />}

              {/* Enhanced Profile Button */}
              <a
                href="/profile"
                className="text-white text-lg hover:text-[#49bbbd] transition-all duration-300 text-center w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg relative group hover:bg-white/5"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsNotificationsOpen(false);
                }}
              >
                <span className="relative z-10">Welcome, {userData?.name || "User"}</span>
                {hasActiveSubscription && (
                  <div className="relative">
                    <svg
                      className="w-5 h-5 text-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <div className="absolute -inset-1 bg-yellow-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#49bbbd]/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>

              {/* Enhanced Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-[#49bbbd] text-black px-6 py-2.5 rounded-full text-lg font-semibold hover:bg-white hover:text-[#49bbbd] transition-all duration-300 text-center w-full md:w-auto relative overflow-hidden group hover:shadow-lg hover:shadow-[#49bbbd]/25 hover:scale-105"
              >
                <span className="relative z-10">Logout</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </button>
            </>
          ) : (
            <>
              {/* Enhanced Login Button */}
              <a
                href="/login"
                className="text-white text-lg hover:text-[#49bbbd] transition-all duration-300 text-center w-full md:w-auto px-4 py-2 rounded-lg relative group hover:bg-white/5"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsNotificationsOpen(false);
                }}
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#49bbbd]/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#49bbbd] group-hover:w-3/4 group-hover:left-1/8 transition-all duration-300"></div>
              </a>

              {/* Enhanced Get Started Button */}
              <a
                href="/signup"
                className="bg-[#49bbbd] text-black px-6 py-2.5 rounded-full text-lg font-semibold hover:bg-white hover:text-[#49bbbd] transition-all duration-300 text-center w-full md:w-auto relative overflow-hidden group hover:shadow-lg hover:shadow-[#49bbbd]/25 hover:scale-105"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsNotificationsOpen(false);
                }}
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;