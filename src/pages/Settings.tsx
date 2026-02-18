import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Users, Shield, DollarSign, Bell, Globe, Save } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
}

interface SystemSettings {
  base_service_fee: number;
  addon_rates: Record<string, number>;
  commission_rates: Record<string, number>;
  notification_settings: Record<string, boolean>;
  business_hours: {
    start: string;
    end: string;
    days: string[];
  };
  sla_timers: Record<string, number>;
}

const Settings: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'pricing' | 'notifications' | 'business'>('roles');
  const [showCreateRole, setShowCreateRole] = useState(false);

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    fetchRoles();
    fetchSettings();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRole)
      });

      if (response.ok) {
        fetchRoles();
        setShowCreateRole(false);
        setNewRole({ name: '', description: '', permissions: [] });
      }
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleUpdateSettings = async () => {
    if (!settings) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        // Show success message
        console.log('Settings updated successfully');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const availablePermissions = [
    'orders.view',
    'orders.create',
    'orders.edit',
    'orders.delete',
    'customers.view',
    'customers.create',
    'customers.edit',
    'agents.view',
    'agents.create',
    'agents.edit',
    'tickets.view',
    'tickets.create',
    'tickets.edit',
    'refunds.approve',
    'coupons.create',
    'coupons.edit',
    'inventory.view',
    'inventory.edit',
    'payments.view',
    'reports.view',
    'settings.edit'
  ];

  // Mock settings data
  const mockSettings: SystemSettings = {
    base_service_fee: 199,
    addon_rates: {
      'data_recovery': 500,
      'software_installation': 300,
      'hardware_upgrade': 800,
      'virus_removal': 400
    },
    commission_rates: {
      'agent': 15,
      'zonal_manager': 5,
      'admin': 80
    },
    notification_settings: {
      'email_notifications': true,
      'sms_notifications': true,
      'push_notifications': true,
      'order_updates': true,
      'payment_alerts': true
    },
    business_hours: {
      start: '09:00',
      end: '18:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    sla_timers: {
      'ticket_response': 2,
      'order_completion': 24,
      'refund_processing': 48
    }
  };

  const currentSettings = settings || mockSettings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings & Roles</h1>
          <p className="text-gray-600">Manage system settings and user permissions</p>
        </div>
        <button
          onClick={handleUpdateSettings}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Roles & Permissions
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pricing'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="w-5 h-5 inline mr-2" />
              Pricing & Commission
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="w-5 h-5 inline mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'business'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Globe className="w-5 h-5 inline mr-2" />
              Business Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">User Roles</h3>
                <button
                  onClick={() => setShowCreateRole(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                >
                  Create Role
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <div key={role.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {role.user_count} users
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-900">Permissions:</h5>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <span
                            key={permission}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800"
                          >
                            {permission}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pricing Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Base Service Fee</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Service Charge (₹)
                      </label>
                      <input
                        type="number"
                        value={currentSettings.base_service_fee}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          base_service_fee: parseFloat(e.target.value)
                        } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Commission Rates (%)</h4>
                  <div className="space-y-4">
                    {Object.entries(currentSettings.commission_rates).map(([role, rate]) => (
                      <div key={role}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {role.replace('_', ' ')} Commission (%)
                        </label>
                        <input
                          type="number"
                          value={rate}
                          onChange={(e) => setSettings(prev => prev ? {
                            ...prev,
                            commission_rates: {
                              ...prev.commission_rates,
                              [role]: parseFloat(e.target.value)
                            }
                          } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Add-on Service Rates (₹)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(currentSettings.addon_rates).map(([service, rate]) => (
                    <div key={service}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {service.replace('_', ' ')}
                      </label>
                      <input
                        type="number"
                        value={rate}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          addon_rates: {
                            ...prev.addon_rates,
                            [service]: parseFloat(e.target.value)
                          }
                        } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              
              <div className="space-y-4">
                {Object.entries(currentSettings.notification_settings).map(([setting, enabled]) => (
                  <div key={setting} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 capitalize">
                        {setting.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {setting === 'email_notifications' && 'Send email notifications to users'}
                        {setting === 'sms_notifications' && 'Send SMS notifications for important updates'}
                        {setting === 'push_notifications' && 'Send push notifications to mobile apps'}
                        {setting === 'order_updates' && 'Notify users about order status changes'}
                        {setting === 'payment_alerts' && 'Send alerts for payment confirmations'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          notification_settings: {
                            ...prev.notification_settings,
                            [setting]: e.target.checked
                          }
                        } : null)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Business Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Business Hours</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={currentSettings.business_hours.start}
                          onChange={(e) => setSettings(prev => prev ? {
                            ...prev,
                            business_hours: {
                              ...prev.business_hours,
                              start: e.target.value
                            }
                          } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={currentSettings.business_hours.end}
                          onChange={(e) => setSettings(prev => prev ? {
                            ...prev,
                            business_hours: {
                              ...prev.business_hours,
                              end: e.target.value
                            }
                          } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">SLA Timers (hours)</h4>
                  <div className="space-y-4">
                    {Object.entries(currentSettings.sla_timers).map(([timer, hours]) => (
                      <div key={timer}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {timer.replace('_', ' ')}
                        </label>
                        <input
                          type="number"
                          value={hours}
                          onChange={(e) => setSettings(prev => prev ? {
                            ...prev,
                            sla_timers: {
                              ...prev.sla_timers,
                              [timer]: parseFloat(e.target.value)
                            }
                          } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Role</h2>
              <button
                onClick={() => setShowCreateRole(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Customer Support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Role description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {availablePermissions.map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRole({
                              ...newRole,
                              permissions: [...newRole.permissions, permission]
                            });
                          } else {
                            setNewRole({
                              ...newRole,
                              permissions: newRole.permissions.filter(p => p !== permission)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateRole(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;