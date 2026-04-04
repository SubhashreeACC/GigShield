import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { claimsAPI, policiesAPI } from '../services/api';

const CreateClaim = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    policyId: '',
    eventType: '',
    description: '',
    amount: '',
  });
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [policiesLoading, setPoliciesLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await policiesAPI.getPolicies();
      setPolicies(response.data || []);
    } catch (_error) {
      toast.error('Failed to load policies. Create a policy first.');
      setPolicies([]);
    } finally {
      setPoliciesLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (
      !formData.amount ||
      !formData.policyId ||
      !formData.eventType ||
      !formData.description.trim()
    ) {
      toast.error('Please fill all fields');
      return;
    }

    const amount = parseFloat(formData.amount);

    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      await claimsAPI.createClaim({
        amount,
        policyId: formData.policyId,
        eventType: formData.eventType,
        description: formData.description,
      });

      toast.success('Claim created successfully!');

      setTimeout(() => {
        navigate('/claims');
      }, 1000);
    } catch (submitError) {
      if (submitError.response) {
        setError(submitError.response.data?.error || 'Server error');
        toast.error(submitError.response.data?.error || 'Failed to create claim');
      } else if (submitError.request) {
        toast.error('Unable to complete the request right now.');
      } else {
        toast.error(submitError.message || 'Failed to create claim');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Claim</h2>
          <p className="text-gray-600 mt-1">
            File an insurance claim for a verified work disruption.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="font-medium">Error: {error}</p>
              <p className="text-sm mt-1">Please check your input and try again.</p>
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Policy <span className="text-red-500">*</span>
            </label>
            {policiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                <span className="ml-2 text-sm text-gray-500">Loading policies...</span>
              </div>
            ) : policies.length === 0 ? (
              <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
                No policies found.
                <button
                  type="button"
                  onClick={() => navigate('/policies')}
                  className="ml-1 font-medium underline"
                >
                  Open Insurance Policy
                </button>
              </div>
            ) : (
              <select
                name="policyId"
                required
                value={formData.policyId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a policy...</option>
                {policies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.city} - {policy.vehicleType} - coverage {policy.coverageCap}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Select from your active insurance policies.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type <span className="text-red-500">*</span>
            </label>
            <select
              name="eventType"
              required
              value={formData.eventType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an event...</option>
              <option value="rain">Heavy rain</option>
              <option value="flood">Flooding</option>
              <option value="accident">Road accident</option>
              <option value="medical">Medical emergency</option>
              <option value="other">Other disruption</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe what happened and how it affected your work"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Claim Amount (Rs.) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              required
              min="1"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter income loss amount"
            />
            <p className="mt-1 text-sm text-gray-500">
              Amount of income lost due to the reported disruption.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Quick Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>- Claims are verified against your backend-linked rider account.</li>
              <li>- Keep the event type and description clear for faster review.</li>
              <li>- Maximum claim amount depends on your policy coverage.</li>
              <li>- Create a policy first if the list above is empty.</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/claims')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating...' : 'Create Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClaim;
