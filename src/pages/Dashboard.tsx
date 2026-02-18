import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  UserCheck, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';
import StatCard from '../components/Dashboard/StatCard';
import RevenueChart from '../components/Dashboard/RevenueChart';
import { DashboardStats, Order, Agent, RevenueData } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topAgents, setTopAgents] = useState<Agent[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
          setTopAgents(data.topAgents);
          setRevenueTrend(data.revenueTrend);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to IT Fixer @199 Master Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          change={`${stats?.todayOrders || 0} today`}
          changeType="increase"
          icon={ShoppingCart}
          iconColor="bg-blue-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          change={`₹${stats?.todayRevenue || 0} today`}
          changeType="increase"
          icon={DollarSign}
          iconColor="bg-green-500"
        />
        <StatCard
          title="Active Agents"
          value={stats?.activeAgents || 0}
          icon={UserCheck}
          iconColor="bg-orange-500"
        />
        <StatCard
          title="Pending Tickets"
          value={stats?.pendingTickets || 0}
          icon={AlertCircle}
          iconColor="bg-red-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Completed Today"
          value={stats?.completedToday || 0}
          icon={Calendar}
          iconColor="bg-purple-500"
        />
        <StatCard
          title="Average Rating"
          value={`${stats?.avgRating?.toFixed(1) || 0}/5`}
          icon={Star}
          iconColor="bg-yellow-500"
        />
        <StatCard
          title="Revenue Growth"
          value="+12.5%"
          changeType="increase"
          icon={TrendingUp}
          iconColor="bg-indigo-500"
        />
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueTrend} />
        
        {/* Recent Orders */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">#{order.order_number}</div>
                  <div className="text-sm text-gray-600">
                    {order.customer_first_name} {order.customer_last_name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">₹{order.total_amount}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Agents */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Agents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {topAgents.map((agent, index) => (
            <div key={agent.id} className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {(agent as any).first_name} {(agent as any).last_name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {(agent as any).total_orders || 0} orders
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Rating</span>
                <span className="text-sm font-medium text-orange-600">
                  {((agent as any).avg_rating || 0).toFixed(1)}/5
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;