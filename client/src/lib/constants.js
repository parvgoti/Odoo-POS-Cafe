// Order statuses
export const ORDER_STATUS = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Payment statuses
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
};

// Table statuses
export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
};

// Kitchen ticket statuses
export const KITCHEN_STATUS = {
  TO_COOK: 'to_cook',
  PREPARING: 'preparing',
  COMPLETED: 'completed',
};

// Payment method types
export const PAYMENT_TYPES = {
  CASH: 'cash',
  DIGITAL: 'digital',
  UPI_QR: 'upi_qr',
};

// Session statuses
export const SESSION_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

// Product units
export const PRODUCT_UNITS = [
  { value: 'piece', label: 'Piece' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'cup', label: 'Cup' },
  { value: 'plate', label: 'Plate' },
  { value: 'glass', label: 'Glass' },
];

// Navigation items for sidebar
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/products', label: 'Products', icon: 'Package' },
  { path: '/payment-methods', label: 'Payment Methods', icon: 'CreditCard' },
  { path: '/floor-plans', label: 'Floor Plans', icon: 'Building2' },
  { path: '/sessions', label: 'POS Sessions', icon: 'Monitor' },
  { path: '/self-ordering', label: 'Self Ordering', icon: 'Smartphone' },
  { path: '/kitchen', label: 'Kitchen Display', icon: 'ChefHat' },
  { path: '/reports', label: 'Reports', icon: 'BarChart3' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];

// Default categories for seed data
export const DEFAULT_CATEGORIES = [
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Pasta', emoji: '🍝' },
  { name: 'Burger', emoji: '🍔' },
  { name: 'Coffee & Tea', emoji: '☕' },
  { name: 'Drinks', emoji: '🥤' },
  { name: 'Desserts', emoji: '🍰' },
  { name: 'Vino', emoji: '🍷' },
  { name: 'Signature Pizza', emoji: '🍕' },
];
