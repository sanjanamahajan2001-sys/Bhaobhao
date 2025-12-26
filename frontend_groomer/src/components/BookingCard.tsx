import React, { useState } from 'react';
import {
  Plus,
  Clock,
  User,
  Calendar,
  Scissors,
  Play,
  CheckCircle,
} from 'lucide-react';
import { BookingData } from '../types';
import { PaymentSummary } from './PaymentSummary';
import { PaymentForm } from './PaymentForm';
import { BookingStatusTimeline } from './BookingStatusTimeline';
import { OTPModal } from './OTPModal';

export const BookingCard: React.FC<{
  booking: BookingData;
  onStatusUpdate: () => void;
}> = ({ booking, onStatusUpdate }) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpAction, setOtpAction] = useState<'start' | 'complete'>('start');

  const totalAmount = booking.booking.total || 0;
  const paidAmount =
    booking.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const pendingAmount = totalAmount - paidAmount;

  const handleStartBooking = () => {
    setOtpAction('start');
    setShowOTPModal(true);
  };

  const handleCompleteBooking = () => {
    setOtpAction('complete');
    setShowOTPModal(true);
  };

  const handleOTPSuccess = () => {
    // Auto-update the bookings list
    onStatusUpdate();
    setShowOTPModal(false);
  };

  const getActionButton = () => {
    switch (booking.booking.status) {
      case 'Scheduled':
        return (
          <button
            onClick={handleStartBooking}
            className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            <Play size={16} className="mr-1" />
            Start Service
          </button>
        );
      case 'In Progress':
        return (
          <button
            onClick={handleCompleteBooking}
            className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            <CheckCircle size={16} className="mr-1" />
            Complete Service
          </button>
        );
      case 'Completed':
        return null; // No action button for completed bookings
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
          {/* Left section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 break-words">
              {booking.pet?.pet_name || 'Pet Name'}
            </h3>
            <p className="text-sm text-gray-500">
              Order ID: {booking.booking.order_id}
            </p>
          </div>

          {/* Right section */}
          <div className="flex flex-col items-start md:items-end space-y-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                booking.booking.status === 'Completed'
                  ? 'bg-green-100 text-green-800'
                  : booking.booking.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              Booking: {booking.booking.status}
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                pendingAmount > 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {pendingAmount > 0 ? 'Payment: Pending' : 'Fully Paid'}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-3 mb-4 text-sm">
          <div className="flex items-center flex-wrap">
            <User size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-600">Customer:</span>
            <span className="ml-auto font-medium break-words">
              {booking.customer?.customer_name}
            </span>
          </div>

          <div className="flex items-center flex-wrap">
            <Scissors size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-600">Service:</span>
            <span className="ml-auto font-medium break-words">
              {booking.service?.service_name}
            </span>
          </div>

          <div className="flex items-center flex-wrap">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-600">Scheduled:</span>
            <span className="ml-auto font-medium">
              {new Date(booking.booking.appointment_time_slot).toLocaleString()}
            </span>
          </div>

          {booking.booking.notes && (
            <div>
              <span className="text-gray-600">Notes:</span>
              <span className="ml-2 font-medium break-words">
                {booking.booking.notes}
              </span>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="mb-4">
          <BookingStatusTimeline booking={booking} />
        </div>

        {/* Payment Summary */}
        <PaymentSummary booking={booking} />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 pt-4 border-t border-gray-100 gap-3">
          <div className="text-sm">
            {pendingAmount > 0 ? (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                ₹{pendingAmount.toFixed(2)} pending
              </span>
            ) : (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                Fully paid
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {pendingAmount > 0 && (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Add Payment
              </button>
            )}

            {getActionButton()}
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentForm
          booking={booking}
          onPaymentAdded={onStatusUpdate}
          onClose={() => setShowPaymentForm(false)}
        />
      )}

      {/* OTP Modal */}
      {showOTPModal && (
        <OTPModal
          booking={booking}
          action={otpAction}
          onClose={() => setShowOTPModal(false)}
          onSuccess={handleOTPSuccess}
        />
      )}
    </>
  );
};
