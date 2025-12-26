import React, { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';

export type AddressPayload = {
  flat_no: string;
  apartment_name: string;
  full_address: string;
  pincode: string;
  label: string;
  isDefault: boolean;
  location?: string;
  latitude?: number;
  longitude?: number;
  AddressID?: string | number;
  IsNew?: boolean;
  customLabel?: string;
};

interface AddAddressFormProps {
  editingAddressId?: string | null;
  initialData?: Partial<AddressPayload>; // ✅ pre-fill when editing
  onAddAddress: (addressData: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const AddAddressForm: React.FC<AddAddressFormProps> = ({
  editingAddressId,
  initialData,
  onAddAddress,
  onCancel,
  loading,
}) => {
  const [formData, setFormData] = useState<AddressPayload>({
    flat_no: '',
    apartment_name: '',
    full_address: '',
    pincode: '',
    label: 'Home',
    isDefault: false,
    customLabel: '',
    location: '',
    latitude: undefined,
    longitude: undefined,
  });

  const [submitting, setSubmitting] = useState(false);

  // ✅ If editing, pre-fill form
  useEffect(() => {
    if (editingAddressId && initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        AddressID: editingAddressId,
      }));
    }
  }, [editingAddressId, initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.flat_no.trim() ||
      !formData.apartment_name.trim() ||
      !formData.full_address.trim() ||
      !formData.pincode.trim()
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    // ✅ Pincode validation
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(formData.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    setSubmitting(true);

    try {
      const payload: AddressPayload = {
        ...formData,
        label:
          formData.label === 'Other' && formData.customLabel
            ? formData.customLabel
            : formData.label, // ✅ replace "Other" with user input
        IsNew: !editingAddressId, // ✅ only true if creating
        AddressID: editingAddressId || undefined,
      };

      const response = await axiosInstance.post('/addresses/save', payload);

      console.log(editingAddressId ? 'Address updated!' : 'Address added!');
      toast.success(editingAddressId ? 'Address updated!' : 'Address added!');
      onAddAddress(response.data);
      onCancel();

      // Reset only if adding new
      if (!editingAddressId) {
        setFormData({
          flat_no: '',
          apartment_name: '',
          full_address: '',
          pincode: '',
          label: 'Home',
          isDefault: false,
          location: '',
          latitude: undefined,
          longitude: undefined,
        });
      }
    } catch (error: any) {
      console.error('Failed to save address:', error);
      toast.error(
        error?.response?.data?.message ||
          'Failed to save address. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-3 sm:p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        {editingAddressId ? 'Edit Address' : 'Add New Address'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flat No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="flat_no"
              required
              value={formData.flat_no}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="A-101, 2nd Floor, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Building/Apartment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="apartment_name"
              required
              value={formData.apartment_name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Sunrise Apartments, etc."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="full_address"
              required
              value={formData.full_address}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Complete address with landmarks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pin Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              required
              value={formData.pincode}
              onChange={(e) => {
                const value = e.target.value;
                // ✅ Allow only numbers, max 6 digits
                if (/^\d{0,6}$/.test(value)) {
                  setFormData((prev) => ({ ...prev, pincode: value }));
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="123456"
              inputMode="numeric" // mobile numeric keyboard
              maxLength={6} // hard stop at 6 chars
            />
          </div>
          {/* --------SELECT LABEL---------- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label
            </label>
            <select
              name="label"
              value={formData.label}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  label: value,
                  // clear custom label if switching away from "Other"
                  customLabel: value === 'Other' ? prev.customLabel : '',
                }));
              }}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-2"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>

            {formData.label === 'Other' && (
              <input
                type="text"
                name="customLabel"
                value={formData.customLabel || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customLabel: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter custom label"
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isDefault"
              id="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isDefault"
              className="text-sm font-medium text-gray-700"
            >
              Set as Default Address
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={
              submitting ||
              loading ||
              !formData.flat_no.trim() ||
              !formData.apartment_name.trim() ||
              !formData.full_address.trim() ||
              !formData.pincode.trim()
            }
            className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Adding...' : 'Add Address'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAddressForm;
