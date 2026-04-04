import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { claimsAPI } from '../services/api';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClaims: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalPayout: 0,
  });
  const [recentClaims, setRecentClaims] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await claimsAPI.getAllClaims();
      const claims = response.data || [];

      const totalPayout = claims
        .filter((claim) => claim.status === 'approved')
        .reduce((sum, claim) => sum + (claim.amount || 0), 0);

      setStats({
        totalClaims: claims.length,
        pending: claims.filter((claim) => claim.status === 'pending').length,
        approved: claims.filter((claim) => claim.status === 'approved').length,
        rejected: claims.filter((claim) => claim.status === 'rejected').length,
        totalPayout,
      });

      setRecentClaims(claims.slice(0, 5));
    } catch (error) {
      console.error('Dashboard error:', error.response?.status, error.message);
      toast.error('Claims load failed. Create your first claim to populate the dashboard.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Real-time insurance analytics and monitoring
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600">Total Claims</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalClaims}</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600">Total Payout</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.totalPayout)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Claims Activity
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentClaims.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              No claims found
            </div>
          ) : (
            recentClaims.map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Claim #{claim.id}
                  </p>
                  <p className="text-xs text-gray-500">Policy: {claim.policyId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(claim.amount)}
                  </p>
                  <p
                    className={`text-xs ${
                      claim.status === 'approved'
                        ? 'text-green-600'
                        : claim.status === 'rejected'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {claim.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Parametric Triggers Monitor
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-yellow-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-yellow-800">
                Rain
              </span>
              <span className="text-sm font-semibold text-yellow-700">Active</span>
            </div>
            <p className="mt-2 font-medium">Heavy Rain Alert</p>
            <p className="text-sm text-gray-600">Mumbai region</p>
          </div>

          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-red-800">
                Heat
              </span>
              <span className="text-sm font-semibold text-red-700">Warning</span>
            </div>
            <p className="mt-2 font-medium">Extreme Heat</p>
            <p className="text-sm text-gray-600">Delhi NCR</p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-blue-800">
                AQI
              </span>
              <span className="text-sm font-semibold text-blue-700">
                Monitoring
              </span>
            </div>
            <p className="mt-2 font-medium">Air Quality Index</p>
            <p className="text-sm text-gray-600">Poor in 3 zones</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
