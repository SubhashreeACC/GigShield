import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { claimsAPI, weatherAPI } from '../services/api';

const ClaimsManagement = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchClaims();
    fetchWeather();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await claimsAPI.getAllClaims();
      setClaims(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load claims');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      const response = await weatherAPI.getCurrentWeather();
      setWeatherData(response.data);
    } catch (_error) {
      setWeatherData(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredClaims = claims.filter((claim) => {
    if (filter === 'all') {
      return true;
    }

    return claim.status === filter;
  });

  const stats = {
    total: claims.length,
    pending: claims.filter((claim) => claim.status === 'pending').length,
    approved: claims.filter((claim) => claim.status === 'approved').length,
    rejected: claims.filter((claim) => claim.status === 'rejected').length,
    totalAmount: claims
      .filter((claim) => claim.status === 'approved')
      .reduce((sum, claim) => sum + (claim.amount || 0), 0),
  };

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
          <p className="text-gray-600 mt-2">
            Monitor your filed claims and move into Insurance Policy management
            whenever needed.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/create-claim"
            className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            File New Claim
          </Link>
          <Link
            to="/policies"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Open Insurance Policy
          </Link>
        </div>
      </div>

      {weatherData?.alert ? (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <p className="text-yellow-700">{weatherData.alert}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Claims</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Payout</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.totalAmount)}
          </p>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`${
                filter === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab} ({tab === 'all' ? stats.total : stats[tab]})
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No claims yet. Register your first policy, then file a claim.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Claim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Policy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {claim.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {claim.policyId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <p className="font-medium text-gray-900">{claim.eventType}</p>
                      <p className="text-xs text-gray-500">{claim.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(claim.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          claim.status
                        )}`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsManagement;
