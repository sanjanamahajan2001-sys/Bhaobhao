import React from 'react';
import { Plus, MapPin } from 'lucide-react';
import AddAddressForm from './form/AddAddressForm';
import AddressCard, { Address } from './ui/AddressCard';
import { useAddresses } from '@/hooks/address/useAddresses';

interface LocationStepProps {
  selectedAddress: Address | null;
  showAddAddress: boolean;
  loading: boolean;
  onSelectAddress: (address: Address) => void;
  onShowAddAddress: () => void;
  onHideAddAddress: () => void;
}

const LocationStep: React.FC<LocationStepProps> = ({
  selectedAddress,
  showAddAddress,
  loading,
  onSelectAddress,
  onShowAddAddress,
  onHideAddAddress,
}) => {
  // React Query hook for addresses - THIS IS WHERE WE USE IT
  const {
    data: addresses = [],
    isLoading: addressesLoading,
    error: addressesError,
    refetch,
  } = useAddresses();

  // Handle successful address addition
  const onAddressAdded = async (newAddressData: any) => {
    console.log('New address added:', newAddressData);
    await refetch(); // Refetch addresses after adding new one
    // ✅ Auto-select the newly added address
    if (newAddressData?.data?.id) {
      onSelectAddress(newAddressData?.data);
    }
  };

  // Loading state

  if (addressesLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  // Error state
  if (addressesError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600">
            Error loading addresses. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex sm:items-center justify-between mb-6 gap-4 max-sm:flex-col">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Select Location
          </h2>
          <p className="text-gray-600 text-sm max-sm:hidden">
            Choose where you'd like the grooming service
          </p>
        </div>
        <button
          onClick={onShowAddAddress}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Address</span>
        </button>
      </div>

      {showAddAddress && (
        <AddAddressForm
          onAddAddress={onAddressAdded}
          onCancel={onHideAddAddress}
          loading={loading}
        />
      )}

      {addresses.length === 0 && !showAddAddress ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No addresses found
          </h3>
          <p className="text-gray-500 mb-4">
            Please add an address to continue with booking
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Your Addresses</h3>
            <div className="text-sm text-gray-600">
              {selectedAddress ? '1 selected' : 'None selected'}
            </div>
          </div>

          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddress?.id === address.id}
              onSelect={() => onSelectAddress(address)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationStep;
