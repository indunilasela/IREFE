import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Droplets, 
  MapPin, 
  Calendar,
  BarChart3,
  Settings,
  UserPlus,
  Navigation,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: user?.role === 'Admin' ? '/admin/dashboard' : '/',
      icon: Home,
      roles: ['Admin', 'DIA', 'DA', 'EA', 'FA', 'Irrigator', 'Farmer', 'User', 'PublicUser']
    },
    {
      name: 'Register User',
      href: '/admin/register-user',
      icon: UserPlus,
      roles: ['Admin']
    },
    {
      name: 'Manage Users',
      href: '/admin/users',
      icon: Users,
      roles: ['Admin']
    },
  /*  {
      name: 'Water Management',
      href: '/water-management',
      icon: Droplets,
      roles: ['Admin', 'DIA', 'DA', 'EA', 'FA', 'Irrigator', 'Farmer', 'User', 'PublicUser']
    },*/
    {
      name: 'Tanks',
      href: '/tanks',
      icon: MapPin,
      roles: ['Admin', 'DIA', 'DA', 'EA', 'FA', 'Irrigator', 'Farmer', 'User', 'PublicUser']
    },
    {
      name: 'Canals',
      href: '/canals',
      icon: Navigation,
      roles: ['Admin', 'DIA', 'DA', 'EA', 'FA', 'Irrigator', 'Farmer', 'User', 'PublicUser']
    },
    {
      name: 'Schedules',
      href: '/schedules',
      icon: Calendar,
      roles: ['Admin', 'DIA', 'DA', 'EA', 'FA', 'Irrigator', 'Farmer', 'User', 'PublicUser']
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      roles: ['Admin', 'DIA', 'DA', 'EA', 'FA', 'Irrigator', 'Farmer']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="w-64 h-full bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
      <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
              }`
            }
          >
            <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;