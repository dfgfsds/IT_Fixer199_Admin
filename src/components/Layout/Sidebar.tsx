// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   ShoppingCart,
//   Users,
//   UserCheck,
//   Calendar,
//   Headphones,
//   RotateCcw,
//   Ticket,
//   Package,
//   CreditCard,
//   MapPin,
//   BarChart3,
//   Settings,
//   LogOut,
//   PenToolIcon
// } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';

// const menuItems = [
//   { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
//   { name: 'Orders Management', icon: ShoppingCart, path: '/orders' },
//   { name: 'Customer Management', icon: Users, path: '/customers' },
//   { name: 'Users', icon: Users, path: '/users' },
//   { name: 'Hubs', icon: Users, path: '/hubs' },  // 
//   { name: 'Categories', icon: Users, path: '/categories' },
//   { name: 'Brands', icon: Users, path: '/brands' },
//   { name: 'Attribute', icon: Users, path: '/attribute' },
//   { name: 'Tools', icon: PenToolIcon, path: '/tools' }, // 
//   { name: 'Agent & Delivery', icon: UserCheck, path: '/agents' },
//   { name: 'Attendance & Incentives', icon: Calendar, path: '/attendance' }, //
//   { name: 'Tickets & Escalations', icon: Headphones, path: '/tickets' }, // 
//   { name: 'Refunds & Reorders', icon: RotateCcw, path: '/refunds' },
//   { name: 'Coupons & Promotions', icon: Ticket, path: '/coupons' }, // 
//   { name: 'Products', icon: Users, path: '/products' }, 
//   { name: 'Services', icon: Package, path: '/services' }, // 
//   { name: 'Inventory & Products', icon: Package, path: '/inventory' },
//   { name: 'Payments & Settlements', icon: CreditCard, path: '/payments' }, // 
//   { name: 'Zonal Manager Panel', icon: MapPin, path: '/zones' }, // 
//   { name: 'Slots', icon: Users, path: '/slots' }, // 
//   { name: 'Reports & Analytics', icon: BarChart3, path: '/reports' },
//   { name: 'Settings & Roles', icon: Settings, path: '/settings' },
// ];

// const Sidebar: React.FC = () => {
//   const { logout } = useAuth();

//   return (
//     <div className="bg-gray-900 text-white w-64 h-full flex flex-col">

//       {/* 🔒 Fixed Top Header */}
//       <div className="p-6 border-b border-gray-800 shrink-0">
//         <h1 className="text-xl font-bold text-orange-400">IT Fixer @199</h1>
//         <p className="text-sm text-gray-400 mt-1">Master Admin Panel</p>
//       </div>

//       {/* 🔥 Scrollable Menu Only */}
//       <nav className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
//         <ul className="space-y-1">
//           {menuItems?.map((item) => {
//             const Icon = item?.icon;
//             return (
//               <li key={item?.name}>
//                 <NavLink
//                   to={item?.path}
//                   className={({ isActive }) =>
//                     `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200 ${isActive
//                       ? 'bg-orange-600 text-white'
//                       : 'text-gray-300 hover:bg-gray-800 hover:text-white'
//                     }`
//                   }
//                 >
//                   <Icon className="w-5 h-5 mr-3" />
//                   {item?.name}
//                 </NavLink>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>

//       {/* 🔒 Fixed Bottom Logout */}
//       <div className="p-4 border-t border-gray-800 shrink-0">
//         <button
//           onClick={logout}
//           className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200"
//         >
//           <LogOut className="w-5 h-5 mr-3" />
//           Logout
//         </button>
//       </div>

//     </div>
//   );
// };

// export default Sidebar;

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  PenToolIcon,
  MapPin,
  Store,
  Wrench,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },

    {
      name: 'Users & Agents',
      icon: Users,
      children: [
        { name: 'Customers', path: '/customers' },
        { name: 'Users', path: '/users' },
        { name: 'Agents', path: '/agents' },
        { name: 'Attendance', path: '/attendance' },
      ],
    },

    {
      name: 'Product Management',
      icon: Package,
      children: [
        { name: 'Categories', path: '/categories' },
        { name: 'Brands', path: '/brands' },
        { name: 'Attribute', path: '/attribute' },
        { name: 'Products', path: '/products' },
        { name: 'Inventory', path: '/inventory' },
      ],
    },
    { name: 'Hubs', icon: Store, path: '/hubs' },
    { name: 'Tools', icon: Wrench, path: '/tools' },
    { name: 'Services', icon: UserCog, path: '/services' },
    { name: 'Zonal Manager Panel', icon: MapPin, path: '/zones' },
    { name: 'Slots', icon: Users, path: '/slots' },
    {
      name: 'Orders Management',
      icon: ShoppingCart,
      children: [
        { name: 'All Orders', path: '/orders' },
        { name: 'Refund Orders', path: '/refunds' },
        { name: 'Tickets & Escalations', path: '/tickets' },
        { name: 'Coupons & Promotions', path: '/coupons' },
        { name: 'Payments & Settlements', path: '/payments' },

      ],
    },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  return (
    <div className="bg-gray-900 text-white w-64 h-full flex flex-col">

      {/* Header */}
      <div className="p-6 border-b border-gray-800 shrink-0">
        <h1 className="text-xl font-bold text-orange-400">IT Fixer @199</h1>
        <p className="text-sm text-gray-400 mt-1">Master Admin Panel</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            // 🔹 If submenu exists
            if (item.children) {
              return (
                <li key={item.name}>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition"
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                    {openMenu === item.name ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {openMenu === item.name && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.children.map((sub) => (
                        <li key={sub.name}>
                          <NavLink
                            to={sub.path}
                            className={({ isActive }) =>
                              `block px-4 py-2 text-sm rounded-lg transition ${isActive
                                ? 'bg-orange-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              }`
                            }
                          >
                            {sub.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            // 🔹 Normal Menu
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm rounded-lg transition ${isActive
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800 shrink-0">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>

    </div>
  );
};

export default Sidebar;