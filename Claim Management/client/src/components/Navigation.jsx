import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  HomeIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const Navigation = ({ user, onLogout }) => {
  const location = useLocation();
  const baseClasses =
    'flex items-center px-4 py-2 text-sm font-medium rounded-md transition duration-150 ease-in-out';

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;

    return (
      <Link
        to={to}
        className={`${baseClasses} ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Icon className="mr-3 h-5 w-5" />
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-2" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  GigShield
                </h1>
                <p className="text-xs text-gray-500">Rider Protection Portal</p>
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 sm:items-center">
              <NavLink to="/claims" icon={DocumentTextIcon}>
                Claim Management
              </NavLink>
              <NavLink to="/policies" icon={DocumentDuplicateIcon}>
                Insurance Policy
              </NavLink>
              <NavLink to="/create-claim" icon={PlusCircleIcon}>
                New Claim
              </NavLink>
              <NavLink to="/dashboard" icon={HomeIcon}>
                Dashboard
              </NavLink>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              {user?.name || 'Rider View'}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
