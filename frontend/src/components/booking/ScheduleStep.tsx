import React, { useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosInstance';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const formatPrettyDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();

  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
      ? 'nd'
      : day % 10 === 3 && day !== 13
      ? 'rd'
      : 'th';

  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  return `${day}${suffix} ${month} ${year}`;
};
// ✅ Helper to format date to YYYY-MM-DD
export const formatISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
interface Slot {
  date: string;
  time: string;
}

interface SlotWithStatus {
  id: number;
  slot: string; // e.g. "09:00 - 10:00"
  is_booked: boolean;
}

interface ScheduleStepProps {
  slots: Slot[];
  onAddSlot: (slot: Slot) => void;
  onRemoveSlot: (index: number) => void;
  isRescheduling: boolean;
}

// 🔥 New fetch function
const fetchSlotsWithBookingStatus = async (
  date: string
): Promise<SlotWithStatus[]> => {
  const { data } = await axiosInstance.get(
    '/slots/get_slots_with_booking_status',
    {
      params: { date },
    }
  );
  return data.data;
};

const ScheduleStep: React.FC<ScheduleStepProps> = ({
  slots,
  onAddSlot,
  onRemoveSlot,
  isRescheduling,
}) => {
  // ✅ Default to today's date
  const todayISO = formatISODate(new Date());
  const [tempDate, setTempDate] = useState<string>(todayISO);
  const [tempTime, setTempTime] = useState<string>('');

  const { user } = useAuth();

  // 🔥 Fetch slots only when date is chosen
  const {
    data: availableSlots = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['slotsWithStatus', tempDate],
    queryFn: () => fetchSlotsWithBookingStatus(tempDate),
    enabled: !!tempDate && !!user,
    placeholderData: keepPreviousData,
  });

  const handleAdd = () => {
    if (!tempDate || !tempTime) return;

    if (isRescheduling) {
      if (slots.length >= 1) {
        toast.error('You can only select one slot when rescheduling.');
        return;
      }
    }

    const alreadySelected = slots.some(
      (slot) => slot.date === tempDate && slot.time === tempTime
    );
    if (alreadySelected) {
      toast.error('You have already selected this slot.');
      return;
    }

    onAddSlot({ date: tempDate, time: tempTime });
    // setTempDate('');
    // setTempTime('');
  };

  if (isLoading) {
    return <p className="text-gray-600">Loading available slots...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-600">Failed to load slots. Please refresh.</p>
    );
  }

  // Divide into Morning (9-12) and Afternoon (12-6)
  const morningSlots = availableSlots.filter((s) => {
    const hour = parseInt(s.slot.split(':')[0], 10);
    return hour >= 9 && hour < 12;
  });

  const afternoonSlots = availableSlots.filter((s) => {
    const hour = parseInt(s.slot.split(':')[0], 10);
    return hour >= 12 && hour < 18;
  });

  // ✅ Get current date/time
  const now = new Date();

  // Disable slots in the past (for today only)
  const isPastSlot = (slot: string, date: string) => {
    const [hourStr, minuteStr] = slot.split(':'); // e.g. "09:00 - 10:00" → "09", "00"
    const slotHour = parseInt(hourStr, 10);
    const slotMinute = parseInt(minuteStr, 10) || 0;

    // Create a Date object for this slot start time
    const slotDateTime = new Date(date);
    slotDateTime.setHours(slotHour, slotMinute, 0, 0);

    return slotDateTime <= now;
  };

  return (
    <>
      <style>{`
        .custom-datepicker .react-datepicker {
          background: white;
          border: 2px solid #10b981;
          border-radius: 16px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          font-weight: 500;
        }
        .custom-datepicker .react-datepicker__header {
          background: linear-gradient(to right, #10b981, #14b8a6);
          color: white;
          border: none;
          border-radius: 14px 14px 0 0;
          padding-top: 12px;
        }
        .custom-datepicker .react-datepicker__current-month {
          color: white;
          font-weight: 600;
        }
        .custom-datepicker .react-datepicker__day-name {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
        .custom-datepicker .react-datepicker__navigation {
          top: 6px;
        }
        .custom-datepicker .react-datepicker__navigation-icon::before {
          border-color: white;
          border-top-color: white;
          border-right-color: white;
        }
      `}</style>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Schedule Appointment
        </h2>

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Date
          </label>
          <div className="flex justify-center">
            <div className="relative custom-datepicker">
              <DatePicker
                selected={tempDate ? new Date(tempDate) : null}
                onChange={(date: Date | null) => {
                  if (!date) return;

                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  if (date < today) {
                    toast.error('You cannot select a past date.');
                    setTempDate('');
                    return;
                  }

                  // Fix timezone issue by using local date formatting
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const iso = `${year}-${month}-${day}`;

                  setTempDate(iso);
                  setTempTime('');
                }}
                inline
                minDate={new Date()}
                dayClassName={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isSelected =
                    tempDate &&
                    new Date(tempDate).toDateString() === date.toDateString();

                  if (date < today) {
                    return '!text-slate-400 !cursor-not-allowed !bg-slate-50';
                  }
                  if (isSelected) {
                    return '!bg-emerald-600 !text-white !font-bold !rounded-lg !shadow-md';
                  }
                  return '!text-slate-700 hover:!bg-emerald-50 hover:!text-emerald-700 !rounded-lg !transition-all !duration-200 hover:!scale-105';
                }}
                wrapperClassName="w-full flex justify-center"
              />
            </div>
          </div>
          {tempDate && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-medium">
                <Calendar className="h-4 w-4" />
                <span>Selected: {formatPrettyDate(tempDate)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Time Slots */}
        {tempDate && (
          <div>
            {/* Morning */}
            <p className="text-gray-600 text-sm mb-2">Morning (9 AM – 12 PM)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {morningSlots.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    !s.is_booked &&
                    !isPastSlot(s.slot, tempDate) &&
                    setTempTime(s.slot)
                  }
                  disabled={s.is_booked || isPastSlot(s.slot, tempDate)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    s.is_booked || isPastSlot(s.slot, tempDate)
                      ? 'bg-red-100 text-red-400 cursor-not-allowed'
                      : tempTime === s.slot
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={
                    s.is_booked
                      ? 'Already booked'
                      : isPastSlot(s.slot, tempDate)
                      ? 'This time has already passed'
                      : ''
                  }
                >
                  {s.slot}
                </button>
              ))}
            </div>

            {/* Afternoon */}
            <p className="text-gray-600 text-sm mb-2">
              Afternoon (12 PM – 6 PM)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {afternoonSlots.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    !s.is_booked &&
                    !isPastSlot(s.slot, tempDate) &&
                    setTempTime(s.slot)
                  }
                  disabled={s.is_booked || isPastSlot(s.slot, tempDate)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    s.is_booked || isPastSlot(s.slot, tempDate)
                      ? 'bg-red-100 text-red-400 cursor-not-allowed'
                      : tempTime === s.slot
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={
                    s.is_booked
                      ? 'Already booked'
                      : isPastSlot(s.slot, tempDate)
                      ? 'This time has already passed'
                      : ''
                  }
                >
                  {s.slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add Slot Button */}
        <div>
          {/* Instruction */}
          <p className="text-sm text-gray-500 mb-4">
            {isRescheduling
              ? 'You can only select one slot when rescheduling.'
              : 'You can select multiple slots if needed.'}
          </p>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!tempDate || !tempTime}
            className="  px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50"
          >
            Add Slot
          </button>
        </div>

        {/* Selected Slots */}
        {slots.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Selected Slots
            </h3>
            <ul className="grid gap-3  lg:grid-cols-2 ">
              {slots.map((slot, index) => (
                <li
                  key={index}
                  className="flex flex-row sm:items-center justify-between bg-gray-100 p-3 rounded-xl"
                >
                  <span className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-700">
                    {/* Date */}
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-teal-600" />
                      {formatPrettyDate(slot.date)}
                    </span>

                    {/* Time */}
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-teal-600" />
                      {slot.time}
                    </span>
                  </span>
                  <button
                    onClick={() => onRemoveSlot(index)}
                    className="text-red-500 hover:text-red-700 flex items-center justify-center"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default ScheduleStep;
