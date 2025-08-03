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
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      roles: ['Admin', 'DIA', 'DA', 'EA', 'FA', 'Irrigator', 'Farmer']
    },
    {
      name: 'Register User',
      href: '/register',
      icon: UserPlus,
      roles: ['Admin']
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: ['Admin']
    },
    {
      name: 'Water Management',
      href: '/water-management',
      icon: Droplets,
      roles: ['Admin', 'DIA', 'DA', 'EA', 'FA', 'Irrigator', 'Farmer']
    },
    {
      name: 'Tanks',
      href: '/tanks',
      icon: MapPin,
      roles: ['Admin', 'DIA', 'DA', 'EA', 'FA', 'Irrigator', 'Farmer']
    },
    {
      name: 'Schedules',
      href: '/schedules',
      icon: Calendar,
      roles: ['Admin', 'DIA', 'DA', 'EA', 'FA', 'Irrigator', 'Farmer']
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      roles: ['Admin', 'DIA', 'DA', 'EA']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['Admin']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;