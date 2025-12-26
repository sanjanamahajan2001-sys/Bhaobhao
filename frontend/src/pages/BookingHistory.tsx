import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Scissors,
  Ticket,
  ChevronRight,
  Filter,
  Search,
  SortAsc,
  Timer,
  CreditCard,
  Hash,
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useBooking } from '@/contexts/BookingContext';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '@/components/Layout';
import TransactionModal from '@/components/booking/TransactionModal';
import Pagination from '@/components/common/Pagination';
import { useBookingHistory } from '@/hooks/bookingHistory/useBookingHistory';
export interface Transaction {
  id: number;
  booking_id: number;
  transaction_id: string;
  amount: number;
  method: string;
  status: 'Completed' | 'Pending' | 'Failed'; // restrict if known statuses
  notes?: string | null;

  createdat: string; // ISO date string
  updatedat: string; // ISO date string

  delete: boolean;
  deletedat: string | null;

  sync: boolean;
  lastsync: string | null;
}

// Types remain the same as before
export interface BookingData {
  booking: {
    id: number;
    order_id: string;
    customer_id: number;
    pet_id: number;
    service_id: number;
    service_pricing_id: number;
    groomer_id: number | null;
    address_id: number;
    pet_size: string | null;
    appointment_time_slot: string;
    start_otp: string;
    end_otp: string;
    amount: number;
    tax: number;
    total: number;
    status: string;
    notes: string;
    payment_method: string;
    createdat: string;
    updatedat: string;
  };
  groomer: any | null;
  pet: {
    id: number;
    customer_id: number;
    pet_name: string;
    pet_gender: string;
    pet_type_id: number;
    breed_id: number;
    owner_name: string;
    pet_dob: string;
    photo_url: string[];
    status: string;
  };
  service: {
    id: number;
    service_name: string;
    category_id: number;
    sub_category_id: number;
    pet_type: string[];
    gender: string[];
    breed: string[];
    small_description: string;
    description: string;
    photos: string[];
    rating: number;
    total_ratings: number;
    duration_minutes: number;
    status: string;
  };
  service_pricing: {
    id: number;
    service_id: number;
    pet_size: string;
    groomer_level: string;
    mrp: number;
    discounted_price: number;
    status: string;
  };
  address: {
    id: number;
    customer_id: number;
    flat_no: string;
    floor: string | null;
    apartment_name: string;
    full_address: string;
    pincode: string;
    latitude: number | null;
    longitude: number | null;
    label: string;
    status: string;
    isDefault: boolean;
    special_instructions: string | null;
  };
  transactions: Transaction[] | null;
}

interface BookingApiResponse {
  data: BookingData[];
}

export async function fetchBookings(): Promise<BookingData[]> {
  const res = await axiosInstance.get<BookingApiResponse>('/bookings/list');
  return res.data.data;
}

export async function cancelBooking(id: number): Promise<void> {
  await axiosInstance.delete(`/bookings/delete/${id}`);
}

// Add this API function near your cancelBooking function
export async function rescheduleBooking(
  id: number,
  payload: BookingData
): Promise<void> {
  await axiosInstance.put(`/bookings/update/${id}`, {
    payload,
  });
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    // case 'confirmed':
    case 'scheduled':
      return CheckCircle;
    case 'completed':
      return CheckCircle;
    // case 'cancelled':
    //   return XCircle;
    case 'pending':
      return AlertCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'scheduled':
      return 'text-blue-600 bg-blue-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'cancelled':
      return 'text-red-600 bg-red-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const BookingHistory: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  // const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  // const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // Add this state in your BookingHistory component
  const [showTransactionModal, setShowTransactionModal] = useState<
    number | null
  >(null);

  // useBooking Hook
  const { setIsRescheduling, setOriginalBooking } = useBooking();
  const navigate = useNavigate();

  // ------------------------NEW --------------------

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    upcomingPast: 'upcoming' as 'upcoming' | 'past',
    search: '',
    statusFilter: 'all',
  });

  const {
    data: bookingsData,
    isLoading,
    error: queryError,
    isError,
  } = useBookingHistory(filters);

  const bookings = bookingsData?.data || [];
  const pagination = bookingsData?.pagination || {
    totalRecords: 0,
    currentPage: 1,
    perPage: 10,
    totalPages: 0,
  };

  // Handler for page changes
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handler for tab changes
  const handleTabChange = (tab: 'upcoming' | 'past') => {
    setFilters((prev) => ({ ...prev, upcomingPast: tab, page: 1 }));
  };

  // Handler for search
  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query, page: 1 }));
  };

  // Handler for status filter
  const handleStatusFilter = (status: string) => {
    // console.log('Status filter:', status);
    setFilters((prev) => ({ ...prev, statusFilter: status, page: 1 }));
  };

  // 🔹 Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelBooking(id),
    onSuccess: async (_) => {
      toast.success('Booking cancelled successfully.');
      // If we're on the last page and this was the only item, go back a page
      if (bookings.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      }

      // remove from cache or refetch
      // 👇 invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['slotsWithStatus'] }),
      ]);
    },
    onError: () => {
      toast.error('Failed to cancel booking.');
    },
  });

  const handleReschedule = (bookingData: BookingData) => {
    console.log('Reschedule booking:', bookingData);
    // Set rescheduling mode and store original booking data
    setIsRescheduling(true);
    setOriginalBooking(bookingData);
    navigate(`/booking`);
  };
  if (!user) return null;

  // Loading state
  // if (isLoading) {
  //   return (
  //     <div className="max-w-6xl mx-auto sm:px-4 sm:py-8">
  //       <div className="animate-pulse">
  //         <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
  //         <div className="flex gap-4 mb-6">
  //           <div className="h-10 bg-gray-200 rounded w-1/4"></div>
  //           <div className="h-10 bg-gray-200 rounded w-1/4"></div>
  //         </div>
  //         <div className="space-y-4">
  //           {[1, 2, 3].map((i) => (
  //             <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-6xl mx-auto sm:px-4 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Booking History
        </h1>
        <p className="text-gray-600">
          Manage your upcoming and past grooming appointments
        </p>
      </div>

      {/* Error handling */}
      {isError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {queryError instanceof Error
            ? queryError.message
            : 'Failed to load booking history'}
        </div>
      )}
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto mb-4">
        <button
          onClick={() => handleTabChange('upcoming')}
          className={`px-4 py-3 font-medium flex items-center whitespace-nowrap ${
            filters.upcomingPast === 'upcoming'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {/* Full label on md+, short on mobile */}
          <span className="hidden sm:inline">Upcoming Appointments</span>
          <span className="sm:hidden">Upcoming</span>
        </button>

        <button
          onClick={() => handleTabChange('past')}
          className={`px-4 py-3 font-medium flex items-center whitespace-nowrap ${
            filters.upcomingPast === 'past'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="hidden sm:inline">Past Appointments</span>
          <span className="sm:hidden">Past</span>
        </button>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      </div>
      {/* Empty state */}
      {bookings.length === 0 && !isLoading ? (
        <div className="space-y-6">
          {/* NO BOOKINGS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't made any appointments yet. Book your first grooming
              session!
            </p>
            <button
              onClick={() => (window.location.href = '/booking')}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Book Now
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Booking List */}
          <div className="space-y-4">
            {bookings.map((bookingData) => {
              const {
                booking,
                pet,
                service,
                service_pricing,
                address,
                transactions,
              } = bookingData;
              const StatusIcon = getStatusIcon(booking.status);
              const statusColor = getStatusColor(booking.status);
              const isUpcoming = filters.upcomingPast === 'upcoming';
              console.log('Booking:', transactions);
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* Mobile Layout */}
                  <div className="block md:hidden">
                    {/* Header */}
                    <div className="p-4 pb-3 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight">
                          {service?.service_name}
                        </h3>
                        <div
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          <span className="capitalize">{booking.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        For {pet?.pet_name} • {service_pricing?.pet_size}
                      </p>
                      <button
                        onClick={() => setShowTransactionModal(booking.id)}
                        className="text-xs text-gray-500 mt-1 flex items-center hover:bg-slate-100 cursor-pointer"
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {booking?.order_id}
                      </button>
                    </div>

                    {/* Date & Time Card */}
                    <div className="p-4 pb-3 bg-gradient-to-r from-teal-50 to-blue-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-white rounded-lg p-2 shadow-sm">
                            <Calendar className="h-4 w-4 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {formatDate(booking.appointment_time_slot)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatTime(booking.appointment_time_slot)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-teal-700 text-lg">
                            ₹{booking.total}
                          </p>

                          {/* Total / Paid / Balance */}
                          <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                            <p>
                              Paid:{' '}
                              <span className="font-medium text-green-600">
                                ₹
                                {transactions?.reduce(
                                  (s: number, t: Transaction) => s + t.amount,
                                  0
                                ) || 0}
                              </span>
                            </p>
                            <p>
                              Balance:{' '}
                              <span className="font-medium text-red-600">
                                ₹
                                {booking.total -
                                  (transactions?.reduce(
                                    (s: number, t: Transaction) => s + t.amount,
                                    0
                                  ) || 0)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 pt-3 space-y-2">
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="truncate">{address?.label}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <CreditCard className="h-3 w-3 mr-2 text-gray-400" />
                        <span>{booking.payment_method}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="px-4 pb-3">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-800">
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* OTP Section */}
                    <div className="px-4 pb-3">
                      <div className="flex justify-between text-xs">
                        <div className="bg-gray-50 px-2 py-1 rounded">
                          <span className="font-medium text-gray-600">
                            Start OTP:
                          </span>
                          <span className="ml-1 font-mono text-teal-700">
                            {booking.start_otp || 'N/A'}
                          </span>
                        </div>
                        <div className="bg-gray-50 px-2 py-1 rounded">
                          <span className="font-medium text-gray-600">
                            End OTP:
                          </span>
                          <span className="ml-1 font-mono text-teal-700">
                            {booking.end_otp || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Footer */}
                    <div className="p-4 pt-0 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3 mt-2">
                        <span>
                          Booked on {formatDateTime(booking.createdat)}
                        </span>
                      </div>

                      <div className="flex gap-2 flex-wrap ">
                        {/* Add this transaction button */}
                        <button
                          className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                          onClick={() => setShowTransactionModal(booking.id)}
                        >
                          {/* <CreditCard className="h-3 w-3" /> */}
                          Transactions
                        </button>

                        {isUpcoming && booking.status === 'Scheduled' && (
                          <button
                            className="flex-1 py-2 px-3 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
                            onClick={() => handleReschedule(bookingData)}
                          >
                            Reschedule
                          </button>
                        )}
                        {isUpcoming && booking.status === 'Scheduled' && (
                          <button
                            className="flex-1 py-2 px-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            onClick={async () => {
                              const result = await Swal.fire({
                                title: 'Are you sure?',
                                text: 'This Booking will be deleted permanently!',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Yes, delete it!',
                              });

                              if (!result.isConfirmed) return;

                              cancelMutation.mutate(booking.id);
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:block p-6">
                    <div className="flex gap-4">
                      {/* Date Box */}
                      <div className="flex-shrink-0 gap-4 flex flex-col">
                        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-4 text-center w-full border border-teal-100">
                          <div className="text-teal-800 font-bold text-xl">
                            {new Date(booking.appointment_time_slot).getDate()}
                          </div>
                          <div className="text-teal-600 text-xs uppercase font-medium">
                            {new Date(
                              booking.appointment_time_slot
                            ).toLocaleString('en-US', {
                              month: 'short',
                            })}
                          </div>
                          <div className="text-teal-500 text-xs">
                            {new Date(
                              booking.appointment_time_slot
                            ).getFullYear()}
                          </div>
                        </div>
                        <div
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium border ${statusColor}`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          <span className="capitalize">{booking.status}</span>
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                              {service?.service_name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">
                              For {pet?.pet_name} • {service_pricing?.pet_size}{' '}
                              • {service_pricing?.groomer_level} Groomer
                            </p>
                            <button
                              onClick={() =>
                                setShowTransactionModal(booking.id)
                              }
                              className="text-xs text-gray-500 mt-1 flex items-center hover:bg-slate-100 cursor-pointer"
                            >
                              <Hash className="h-3 w-3 mr-1" />
                              {booking?.order_id}
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-gray-900 text-lg">
                                ₹{booking.total}
                              </p>

                              {/* Total / Paid / Balance */}
                              <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                                <p>
                                  Paid:{' '}
                                  <span className="font-medium text-green-600">
                                    ₹
                                    {transactions?.reduce(
                                      (s, t) => s + t.amount,
                                      0
                                    ) || 0}
                                  </span>
                                </p>
                                <p>
                                  Balance:{' '}
                                  <span className="font-medium text-red-600">
                                    ₹
                                    {booking.total -
                                      (transactions?.reduce(
                                        (s, t) => s + t.amount,
                                        0
                                      ) || 0)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                              {formatTime(booking.appointment_time_slot)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{address?.label}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span>{booking.payment_method}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Timer className="h-4 w-4 text-gray-400" />
                            <span>{service?.duration_minutes} minutes</span>
                          </div>
                        </div>

                        {/* Notes */}
                        {booking.notes && (
                          <div className="mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-sm text-blue-800">
                                <strong>Notes:</strong> {booking.notes}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-4 w-full justify-between">
                          <div className="bg-gray-50 px-3 py-1 rounded-lg">
                            <span className="text-xs text-gray-600 font-medium">
                              Start OTP:
                            </span>
                            <span className="ml-2 font-mono text-teal-700 font-medium">
                              {booking.start_otp || 'N/A'}
                            </span>
                          </div>
                          <div className="bg-gray-50 px-3 py-1 rounded-lg">
                            <span className="text-xs text-gray-600 font-medium">
                              End OTP:
                            </span>
                            <span className="ml-2 font-mono text-teal-700 font-medium">
                              {booking.end_otp || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-500">
                          Booked on {formatDateTime(booking.createdat)}
                        </span>
                      </div>

                      <div className="flex gap-2 sm:gap-3">
                        {/* Add this transaction button */}
                        <button
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200 flex items-center gap-2"
                          onClick={() => setShowTransactionModal(booking.id)}
                        >
                          Transactions
                        </button>

                        {isUpcoming && booking.status === 'Scheduled' && (
                          <>
                            <button
                              className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors border border-teal-200"
                              onClick={() => handleReschedule(bookingData)}
                            >
                              Reschedule
                            </button>
                            <button
                              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
                              onClick={async () => {
                                const result = await Swal.fire({
                                  title: 'Are you sure?',
                                  text: 'This Booking will be deleted permanently!',
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor: '#d33',
                                  cancelButtonColor: '#3085d6',
                                  confirmButtonText: 'Yes, delete it!',
                                });

                                if (!result.isConfirmed) return;

                                cancelMutation.mutate(booking.id);
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalRecords}
            itemsPerPage={pagination.perPage}
            onPageChange={handlePageChange}
          />
          {/* Empty filtered state */}
          {filters.upcomingPast === 'upcoming' && bookings.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="bg-gray-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                <Calendar className="h-6 w-6 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No upcoming appointments
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try changing your search or filter criteria'
                  : "You don't have any upcoming appointments"}
              </p>
              {searchQuery || statusFilter !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  onClick={() => (window.location.href = '/booking')}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium"
                >
                  Book Now
                </button>
              )}
            </div>
          )}
          {filters.upcomingPast === 'past' && bookings.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="bg-gray-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                <Calendar className="h-6 w-6 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No past appointments
              </h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try changing your search or filter criteria'
                  : "You don't have any past appointments yet"}
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium mt-4"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {/* Add this right before the closing </div> of your main container */}
      {bookings.map((bookingData) => (
        <TransactionModal
          key={`modal-${bookingData.booking.id}`}
          showTransactionModal={showTransactionModal}
          setShowTransactionModal={setShowTransactionModal}
          booking={bookingData}
        />
      ))}
    </div>
  );
};

export default BookingHistory;
// import React, { useState } from 'react';
// import { useUrlState } from '@/hooks/bookingHistory/useUrlState';
// import { EmptyState } from '@/components/bookingHistory/EmptyState';
// import { BookingTabs } from '@/components/bookingHistory/BookingTabs';
// import { BookingFilters } from '@/components/bookingHistory/BookingFilters';
// import Pagination from '@/components/common/Pagination';
// import TransactionModal from '@/components/booking/TransactionModal';
// import { BookingList } from '@/components/bookingHistory/BookingList';
// import { BookingData } from '@/types/bookingHistory.type';
// import { useBookingHistory } from '@/hooks/bookingHistory/useBookingHistory';
// import { useBookingFilters } from '@/hooks/bookingHistory/useBookingFilters';
// import { useBookingActions } from '@/hooks/bookingHistory/useBookingAction';
// import { useDebounce } from '@/hooks/useDebounce';

// const BookingHistory: React.FC = () => {
//   const [showTransactionModal, setShowTransactionModal] = useState<
//     number | null
//   >(null);

//   const { currentPage, limit, upcomingPast, searchQuery, updateUrlParams } =
//     useUrlState();

//   const {
//     data: bookingResponse,
//     isLoading,
//     isError,
//     error,
//   } = useBookingHistory({
//     page: currentPage,
//     limit,
//     upcomingPast,
//     search: searchQuery,
//   });

//   const { sortBy, setSortBy, statusFilter, setStatusFilter, filteredBookings } =
//     useBookingFilters(bookingResponse?.data || [], upcomingPast);

//   const bookingActions = useBookingActions();

//   const handleTabChange = (tab: 'upcoming' | 'past') => {
//     updateUrlParams({ upcomingPast: tab, page: 1 });
//   };

//   const handleSearchChange = (search: string) => {
//     updateUrlParams({ search, page: 1 });
//   };

//   const handlePageChange = (page: number) => {
//     updateUrlParams({ page });
//   };

//   const handleClearFilters = () => {
//     updateUrlParams({ search: '', page: 1 });
//     setStatusFilter('all');
//   };

//   if (isLoading) {
//     return (
//       <div className="max-w-6xl mx-auto sm:px-4 sm:py-8">
//         <div className="animate-pulse">
//           <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
//           <div className="flex gap-4 mb-6">
//             <div className="h-10 bg-gray-200 rounded w-1/4"></div>
//             <div className="h-10 bg-gray-200 rounded w-1/4"></div>
//           </div>
//           <div className="space-y-4">
//             {[1, 2, 3].map((i) => (
//               <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const totalItems = bookingResponse?.pagination?.totalRecords || 0;
//   const totalPages = bookingResponse?.pagination?.totalPages || 0;
//   console.log('Booking History:', bookingResponse?.pagination);
//   return (
//     <div className="max-w-6xl mx-auto sm:px-4 sm:py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           Booking History
//         </h1>
//         <p className="text-gray-600">
//           Manage your upcoming and past grooming appointments
//         </p>
//       </div>

//       {isError && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
//           {error instanceof Error
//             ? error.message
//             : 'Failed to load booking history'}
//         </div>
//       )}

//       {totalItems === 0 && !isLoading ? (
//         <>
//           <BookingFilters
//             searchQuery={searchQuery}
//             onSearchChange={handleSearchChange}
//             sortBy={sortBy}
//             onSortChange={setSortBy}
//             statusFilter={statusFilter}
//             onStatusFilterChange={setStatusFilter}
//           />
//           <EmptyState type="no-bookings" />
//         </>
//       ) : (
//         <div className="space-y-6">
//           <BookingTabs
//             activeTab={upcomingPast}
//             onTabChange={handleTabChange}
//             upcomingCount={upcomingPast === 'upcoming' ? totalItems : 0}
//             pastCount={upcomingPast === 'past' ? totalItems : 0}
//           />

//           <BookingFilters
//             searchQuery={searchQuery}
//             onSearchChange={handleSearchChange}
//             sortBy={sortBy}
//             onSortChange={setSortBy}
//             statusFilter={statusFilter}
//             onStatusFilterChange={setStatusFilter}
//           />

//           {filteredBookings.length === 0 ? (
//             <EmptyState
//               type={upcomingPast}
//               searchQuery={searchQuery}
//               statusFilter={statusFilter}
//               onClearFilters={handleClearFilters}
//             />
//           ) : (
//             <BookingList
//               bookings={filteredBookings}
//               type={upcomingPast}
//               onShowTransactionModal={setShowTransactionModal}
//               bookingActions={bookingActions}
//             />
//           )}

//           {/* {totalPages > 1 && ( */}
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             totalItems={totalItems}
//             itemsPerPage={limit}
//             onPageChange={handlePageChange}
//           />
//           {/* )} */}

//           {bookingResponse?.data.map((bookingData: BookingData) => (
//             <TransactionModal
//               key={`modal-${bookingData.booking.id}`}
//               // show={showTransactionModal === bookingData.booking.id}
//               showTransactionModal={showTransactionModal}
//               setShowTransactionModal={setShowTransactionModal}
//               booking={bookingData}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BookingHistory;
