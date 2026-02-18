export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'zonal_manager' | 'agent' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  agent_id?: string;
  service_type: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  base_amount: number;
  addon_amount: number;
  parts_amount: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  customer_address: string;
  rating?: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
  customer_first_name?: string;
  customer_last_name?: string;
  phone?: string;
  agent_first_name?: string;
  agent_last_name?: string;
}

export interface Customer {
  id: string;
  user_id: string;
  address: string;
  pincode: string;
  zone_id: string;
  loyalty_tier: 'basic' | 'silver' | 'gold' | 'platinum';
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  zone_id: string;
  agent_code: string;
  skills: string[];
  rating: number;
  total_reviews: number;
  is_available: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  customer_id: string;
  order_id?: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to?: string;
  escalated_to?: string;
  resolution?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  activeAgents: number;
  pendingTickets: number;
  completedToday: number;
  avgRating: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}