import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { policiesAPI, premiumAPI } from '../services/api';

const initialFormState = {
  city: '',
  vehicleType: '',
  hoursPerWeek: '',
  coverageCap: '',
};

const vehicleOptions = [
  { value: 'bike', label: 'Bike' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'car', label: 'Car' },
];

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const PolicyManagement = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [calculatingPremium, setCalculatingPremium] = useState(false);
  const [premiumPreview, setPremiumPreview] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await policiesAPI.getPolicies();
      setPolicies(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load policies');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  };

  const handlePremiumPreview = async () => {
    if (
      !formData.vehicleType ||
      !formData.hoursPerWeek ||
      !formData.coverageCap
    ) {
      toast.error('Select a vehicle and enter hours plus coverage first.');
      return;
    }

    try {
      setCalculatingPremium(true);
      const response = await premiumAPI.calculatePremium(formData);
      setPremiumPreview(response.data?.premium ?? null);
      toast.success('Premium preview updated.');
    } catch (error) {
      setPremiumPreview(null);
      toast.error(error.response?.data?.error || 'Unable to calculate premium');
    } finally {
      setCalculatingPremium(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await policiesAPI.createPolicy(formData);
      toast.success('Insurance policy created.');
      setPolicies((currentValue) => [response.data, ...currentValue]);
      setFormData(initialFormState);
      setPremiumPreview(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create policy');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Insurance Policy Management
          </h1>
          <p className="mt-2 text-gray-600">
            Create a policy, preview the premium, then return to Claim
            Management whenever you are ready to file a claim.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/claims')}
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Back To Claim Management
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-2xl bg-white shadow">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold text-gray-900">
              Create New Insurance Policy
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              This form is linked directly to your backend policy and premium
              APIs.
            </p>
          </div>

          <form className="space-y-6 px-6 py-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  City
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  name="city"
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                  value={formData.city}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Vehicle Type
                </span>
                <select
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  name="vehicleType"
                  onChange={handleChange}
                  required
                  value={formData.vehicleType}
                >
                  <option value="">Select vehicle type</option>
                  {vehicleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Hours Per Week
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  min="1"
                  name="hoursPerWeek"
                  onChange={handleChange}
                  placeholder="40"
                  required
                  type="number"
                  value={formData.hoursPerWeek}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Coverage Cap
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  min="1"
                  name="coverageCap"
                  onChange={handleChange}
                  placeholder="50000"
                  required
                  type="number"
                  value={formData.coverageCap}
                />
              </label>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                    Premium Preview
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {premiumPreview === null
                      ? 'Calculate before creating'
                      : formatCurrency(premiumPreview)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePremiumPreview}
                  disabled={calculatingPremium}
                  className="rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {calculatingPremium ? 'Calculating...' : 'Calculate Premium'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating Policy...' : 'Create Insurance Policy'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-white shadow">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold text-gray-900">
              Existing Policies ({policies.length})
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Policies created here are the ones available while filing a claim.
            </p>
          </div>

          <div className="px-6 py-6">
            {loading ? (
              <div className="py-10 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
              </div>
            ) : policies.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500">
                No policies yet. Create your first insurance policy here.
              </div>
            ) : (
              <div className="space-y-4">
                {policies.map((policy) => (
                  <article
                    key={policy.id}
                    className="rounded-2xl border border-slate-200 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                          {policy.city}
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">
                          {policy.vehicleType}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Policy ID: {policy.id}
                        </p>
                      </div>

                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                        {policy.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Hours Per Week
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {policy.hoursPerWeek}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Coverage Cap
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {formatCurrency(policy.coverageCap)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Premium
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {formatCurrency(policy.premium)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PolicyManagement;
