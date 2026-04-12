import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import CompensatePage from '../pages/Compensate/CompensatePage';
import VouchersPage from '../pages/Vouchers/VouchersPage';
import BookingPage from '../pages/Booking/BookingPage';
import LoyaltyPage from '../pages/Loyalty/LoyaltyPage';
import MarketplacePage from '../pages/Marketplace/MarketplacePage';

/**
 * Application Routes Configuration
 * Defines all available routes and their corresponding components
 */
export const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginPage,
    protected: false
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    protected: false
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    protected: true
  },
  {
    path: '/compensate',
    name: 'compensate',
    component: CompensatePage,
    protected: true,
    label: 'File Compensation Claims'
  },
  {
    path: '/vouchers',
    name: 'vouchers',
    component: VouchersPage,
    protected: true,
    label: 'Redeem Vouchers'
  },
  {
    path: '/booking',
    name: 'booking',
    component: BookingPage,
    protected: true,
    label: 'Book Flights'
  },
  {
    path: '/loyalty',
    name: 'loyalty',
    component: LoyaltyPage,
    protected: true,
    label: 'Loyalty Program'
  },
  {
    path: '/marketplace',
    name: 'marketplace',
    component: MarketplacePage,
    protected: true,
    label: 'Buy/Sell Tickets'
  }
];

/**
 * Get route by path
 */
export const getRouteByPath = (path) => {
  return routes.find(route => route.path === path);
};

/**
 * Get protected routes (require authentication)
 */
export const getProtectedRoutes = () => {
  return routes.filter(route => route.protected);
};

/**
 * Get public routes (no authentication required)
 */
export const getPublicRoutes = () => {
  return routes.filter(route => !route.protected);
};
