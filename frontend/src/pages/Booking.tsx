import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  keepPreviousData,
  QueryClient,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

import { Address, Category, Pets, Service } from '@/types/booking.type';
import BookingProgress from '@/components/booking/BookingProgress';
import ServiceStep from '@/components/booking/ServiceStep';
import PetStep from '@/components/booking/PetStep';
import LocationStep from '@/components/booking/LocationStep';
import ScheduleStep from '@/components/booking/ScheduleStep';
import ConfirmationStep from '@/components/booking/ConfirmationStep';
import CategoryStep from '@/components/booking/CategoryStep';
import {
  fetchCategories,
  fetchSubCategoriesWithServices,
} from '@/features/booking/FetchBookingServices';
import usePets, { Pet } from '@/hooks/pets/usePets';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';
import { convertTo24Hr } from '@/features/booking/ConvertTo24Hr';
import { useAddresses } from '@/hooks/address/useAddresses';

interface SubCategoryWithServices {
  id: number;
  sub_category_name: string;
  photos: string[];
  description: string;
  services: ServiceWithPricing[];
}

interface ServiceWithPricing {
  id: number;
  name: string;
  photos: string[];
  smallDescription: string;
  description: string;
  rating: number;
  totalRatings: number;
  durationMinutes: number;
  petType: string[];
  petBreed: string[];
  gender: string[];
  pricing: PricingOption[];
}

interface PricingOption {
  id: number;
  pet_size: string;
  groomer_level: string;
  mrp: number;
  discounted_price: number;
}

const Booking: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    bookingState,
    updateBooking,
    resetBooking,
    isRescheduling,
    originalBooking,
  } = useBooking();

  const [currentStep, setCurrentStep] = useState(1);
  // const [selectedPets, setSelectedPets] = useState<Pets[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddPet, setShowAddPet] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 5000 });
  const [searchQuery, setSearchQuery] = useState('');

  // Category & service selections
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategoryWithServices | null>(null);
  const queryClient = useQueryClient();
  // React Query for categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // React Query for subcategories with services
  const {
    data: subCategoriesData,
    isLoading: subCategoriesLoading,
    error: subCategoriesError,
  } = useQuery({
    queryKey: ['subCategories', selectedCategory?.id],
    queryFn: () => fetchSubCategoriesWithServices(selectedCategory!.id),
    enabled: !!selectedCategory,
    placeholderData: keepPreviousData,
  });
  // Add these hooks to get actual pets and addresses data
  const {
    data: pets = [],
    isLoading: petsLoading,
    error: petsError,
  } = usePets();

  const {
    data: addresses = [],
    isLoading: addressesLoading,
    error: addressesError,
  } = useAddresses();
  // Effect to pre-fill form when rescheduling
  // Pre-fill when rescheduling
  useEffect(() => {
    if (
      isRescheduling &&
      originalBooking &&
      categoriesData &&
      !categoriesLoading &&
      !subCategoriesLoading &&
      !petsLoading && // Add these loading checks
      !addressesLoading &&
      pets.length > 0 && // Ensure data is loaded
      addresses.length > 0
    ) {
      const { booking, pet, service, service_pricing, address } =
        originalBooking;

      // ✅ Category
      if (service?.category_id) {
        const categoryData = categoriesData?.data?.find(
          (cat: Category) => cat.id === service.category_id
        );
        if (categoryData) {
          setSelectedCategory(categoryData);
          updateBooking({ category: categoryData });
        }
      }
      console.log('selectedCategory', subCategoriesData);
      // ✅ SubCategory & Service
      if (service?.sub_category_id && subCategoriesData?.data) {
        // Find subcategory
        const subCat = subCategoriesData.data.find(
          (sub: SubCategoryWithServices) =>
            Number(sub.id) === Number(service.sub_category_id)
        );

        if (subCat) {
          setSelectedSubCategory(subCat);

          // Find actual service inside subcategory
          const selectedSrv = subCat.services.find(
            (srv: ServiceWithPricing) => Number(srv.id) === Number(service.id)
          );

          if (selectedSrv) {
            setSelectedService(selectedSrv as unknown as Service);
            updateBooking({ service: selectedSrv as unknown as Service });
          }
        }
      }

      // ✅ Pets - Use actual pets data instead of originalBooking.pet
      if (pet && pets.length > 0) {
        const actualPet = pets.find((p: Pet) => p.id === pet.id);
        if (actualPet) {
          updateBooking({ pets: [actualPet] });
        }
      }

      // ✅ Address - Use actual addresses data instead of originalBooking.address
      if (address && addresses.length > 0) {
        const actualAddress = addresses.find(
          (addr: Address) => addr.id === address.id
        );
        if (actualAddress) {
          updateBooking({ address: actualAddress });
        }
      }
      // ✅ Pricing
      if (service_pricing) updateBooking({ selectedPricing: service_pricing });

      // ✅ Appointment slots
      if (booking.appointment_time_slot) {
        const date = new Date(booking.appointment_time_slot);
        const formattedDate = date.toISOString().split('T')[0];
        const formattedTime = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        updateBooking({
          slots: [{ date: formattedDate, time: formattedTime }],
        });
      }

      // ✅ Notes
      if (booking.notes) updateBooking({ notes: booking.notes });
    }
  }, [
    isRescheduling,
    originalBooking,
    categoriesData,
    categoriesLoading,
    subCategoriesLoading,
    subCategoriesData, // 👈 add this
    // ----------PETS AND ADDRESS--------
    pets, // Add these dependencies
    addresses,
    petsLoading,
    addressesLoading,
  ]);

  const steps = [
    { id: 1, title: 'Category', description: 'Choose service category' },
    { id: 2, title: 'Service', description: 'Choose your service' },
    { id: 3, title: 'Pet', description: 'Select your pets' },
    { id: 4, title: 'Location', description: 'Where to groom' },
    { id: 5, title: 'Schedule', description: 'Date & time' },
    { id: 6, title: 'Confirm', description: 'Review & book' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setSearchQuery('');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setSearchQuery('');
    }
  };

  const handleConfirmBooking = async () => {
    if (!user || !bookingState) return;

    setLoading(true);
    setError('');

    try {
      // ⏱ format appointment slots

      const appointment_time_slots =
        bookingState.slots?.map(({ date, time }) => {
          const localDate = new Date(`${date}T${convertTo24Hr(time)}:00+05:30`);
          return localDate.toISOString();
        }) || [];
      // 🧾 calculate tax & totals
      const tax = (bookingState?.selectedPricing?.discounted_price || 1) * 0.18;

      const basePayload = {
        pet_id: bookingState.pets?.[0].id,
        service_id: selectedService?.id,
        service_pricing_id: bookingState.selectedPricing?.id,
        address_id: bookingState.address?.id,
        appointment_time_slots: appointment_time_slots,
        payment_method: 'COD',
        amount: bookingState?.selectedPricing?.discounted_price,
        tax,
        total: (bookingState?.selectedPricing?.discounted_price || 1) + tax,
        notes: bookingState.notes || '',
        nature:
          bookingState.nature ||
          bookingState?.pets?.[0]?.pet_details?.nature ||
          '',
        health_conditions:
          bookingState.health_conditions ||
          bookingState?.pets?.[0]?.pet_details?.health_conditions ||
          '',
      };

      let response;

      if (isRescheduling && originalBooking?.booking.id) {
        response = await axiosInstance.put(
          `/bookings/update/${originalBooking?.booking.id}`,
          basePayload
        );
        toast.success('Booking Updated Successfully');
      } else {
        response = await axiosInstance.post('/bookings/new', basePayload);
        toast.success('Booking Successful');
      }
      // 👇 invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['slotsWithStatus'] }),
        queryClient.invalidateQueries({ queryKey: ['pets'] }),
      ]);

      if (response.status !== 200) {
        throw new Error('Booking operation failed');
      }

      // 👇 keep your own redirect/reset
      navigate('/history');
      resetBooking();
    } catch (err) {
      console.error('Booking error:', err);
      setError(
        isRescheduling
          ? 'Failed to update booking. Please try again.'
          : 'Failed to create booking. Please try again.'
      );
      toast.error(
        isRescheduling
          ? 'Failed to update booking, please try again'
          : 'Booking failed, please try again'
      );
    } finally {
      setLoading(false);
    }
  };

  // Category & service selections
  const handleCategorySelect = (category: Category) => {
    console.log('Selected category:', category);
    setSelectedCategory(category);
    // if (isRescheduling) {
    setSelectedService(null);
    setSelectedSubCategory(null);
    // }
    updateBooking({ category });
  };

  const handleServiceSelect = (
    service: Service,
    subCategory: SubCategoryWithServices
  ) => {
    // SERVICES IS BROKEN DOWN IN SUBCATEGORIES/SUB-SERVICES like
    // Full Groom, Groom & Style, Groom & Nail Trim
    setSelectedService(service);
    setSelectedSubCategory(subCategory);
    updateBooking({ service });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedCategory !== null;
      case 2:
        return (
          selectedService !== null &&
          selectedSubCategory !== null &&
          bookingState.selectedPricing !== undefined
        );
      case 3:
        return bookingState.pets && bookingState.pets.length > 0;
      case 4:
        return bookingState.address !== undefined;
      case 5:
        return bookingState.slots && bookingState.slots.length > 0;
      case 6:
        return true;
      default:
        return false;
    }
  };
  // console.log('BookingState:', bookingState);
  return (
    <div className="max-w-4xl mx-auto">
      <BookingProgress currentStep={currentStep} steps={steps} />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {(categoriesError ||
        subCategoriesError ||
        petsError ||
        addressesError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          Failed to load data. Please try again.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 min-h-[500px]">
        {currentStep === 1 && !categoriesLoading && (
          <CategoryStep
            categories={categoriesData?.data || []}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            isLoading={
              categoriesLoading ||
              subCategoriesLoading ||
              petsLoading ||
              addressesLoading
            }
          />
        )}

        {currentStep === 2 && !subCategoriesLoading && (
          <ServiceStep
            searchQuery={searchQuery}
            priceFilter={priceFilter}
            selectedService={selectedService}
            subCategoriesData={subCategoriesData?.data || []}
            onSearchChange={setSearchQuery}
            onPriceFilterChange={setPriceFilter}
            onServiceSelect={handleServiceSelect}
            onResetPriceFilter={() => setPriceFilter({ min: 0, max: 5000 })}
          />
        )}

        {currentStep === 3 && (
          <PetStep
            selectedPets={bookingState.pets || []}
            showAddPet={showAddPet}
            loading={loading}
            // onTogglePetSelection={togglePetSelection}
            onTogglePetSelection={(pet) => updateBooking({ pets: [pet] })}
            onShowAddPet={() => setShowAddPet(true)}
            onHideAddPet={() => setShowAddPet(false)}
          />
        )}

        {currentStep === 4 && (
          <LocationStep
            selectedAddress={bookingState.address || null}
            showAddAddress={showAddAddress}
            loading={loading}
            onSelectAddress={(address) => updateBooking({ address })}
            onShowAddAddress={() => setShowAddAddress(true)}
            onHideAddAddress={() => setShowAddAddress(false)}
          />
        )}

        {currentStep === 5 && (
          <ScheduleStep
            isRescheduling={isRescheduling}
            slots={bookingState.slots || []}
            onAddSlot={(slot) =>
              updateBooking({ slots: [...(bookingState.slots || []), slot] })
            }
            onRemoveSlot={(index) =>
              updateBooking({
                slots: bookingState.slots?.filter((_, i) => i !== index) || [],
              })
            }
          />
        )}
        {currentStep === 6 && (
          <ConfirmationStep
            bookingDetails={bookingState}
            updateBooking={updateBooking}
            onConfirm={handleConfirmBooking}
            loading={loading}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || loading}
          className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        {currentStep === steps.length ? null : (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Booking;
// 'use client';

// import type React from 'react';
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   keepPreviousData,
//   useQuery,
//   useQueryClient,
// } from '@tanstack/react-query';
// import { useAuth } from '../contexts/AuthContext';
// import { useBooking } from '../contexts/BookingContext';
// import { ArrowLeft, ArrowRight } from 'lucide-react';

// import type {
//   Address,
//   Category,
//   Pets,
//   ServiceWithPricing,
//   SubCategoryWithServices,
// } from '@/types/booking.type';
// import BookingProgress from '@/components/booking/BookingProgress';
// import LocationStep from '@/components/booking/LocationStep';
// import ScheduleStep from '@/components/booking/ScheduleStep';
// import ConfirmationStep from '@/components/booking/ConfirmationStep';
// import CategoryStep from '@/components/booking/CategoryStep';
// import {
//   fetchCategories,
//   fetchSubCategoriesWithServices,
// } from '@/features/booking/FetchBookingServices';
// import usePets, { type Pet } from '@/hooks/pets/usePets';
// import axiosInstance from '@/utils/axiosInstance';
// import toast from 'react-hot-toast';
// import { convertTo24Hr } from '@/features/booking/ConvertTo24Hr';
// import { useAddresses } from '@/hooks/address/useAddresses';
// import MultiPetStep from '@/components/booking/newMultiComponents/MultiPets';
// import MultiServiceStep from '@/components/booking/newMultiComponents/MultiServiceStep';
// import ServicePetConnectionStep from '@/components/booking/newMultiComponents/ServicePetConnectionStep';
// import MultiScheduleStep from '@/components/booking/newMultiComponents/MultiScheduleStep';
// import MultiConfirmationStep from '@/components/booking/newMultiComponents/MultiConfirmationStep';

// interface PricingOption {
//   id: number;
//   pet_size: string;
//   groomer_level: string;
//   mrp: number;
//   discounted_price: number;
// }

// const Booking: React.FC = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const {
//     bookingState,
//     updateBooking,
//     resetBooking,
//     addServicePetConnection,
//     removeServicePetConnection,
//     updateServicePetConnection,
//     generateAPIPayload,
//     isRescheduling,
//     originalBooking,
//   } = useBooking();

//   const [currentStep, setCurrentStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showAddPet, setShowAddPet] = useState(false);
//   const [showAddAddress, setShowAddAddress] = useState(false);
//   const [priceFilter, setPriceFilter] = useState({ min: 0, max: 5000 });
//   const [searchQuery, setSearchQuery] = useState('');

//   // Category & service selections
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(
//     null
//   );
//   const [selectedSubCategory, setSelectedSubCategory] =
//     useState<SubCategoryWithServices | null>(null);
//   const queryClient = useQueryClient();

//   // React Query for categories
//   const {
//     data: categoriesData,
//     isLoading: categoriesLoading,
//     error: categoriesError,
//   } = useQuery({
//     queryKey: ['categories'],
//     queryFn: fetchCategories,
//   });

//   // React Query for subcategories with services
//   const {
//     data: subCategoriesData,
//     isLoading: subCategoriesLoading,
//     error: subCategoriesError,
//   } = useQuery({
//     queryKey: ['subCategories', selectedCategory?.id],
//     queryFn: () => fetchSubCategoriesWithServices(selectedCategory!.id),
//     enabled: !!selectedCategory,
//     placeholderData: keepPreviousData,
//   });

//   // Add these hooks to get actual pets and addresses data
//   const {
//     data: pets = [],
//     isLoading: petsLoading,
//     error: petsError,
//   } = usePets();

//   const {
//     data: addresses = [],
//     isLoading: addressesLoading,
//     error: addressesError,
//   } = useAddresses();

//   const steps = [
//     { id: 1, title: 'Category', description: 'Choose service category' },
//     { id: 2, title: 'Services', description: 'Select multiple services' },
//     { id: 3, title: 'Pets', description: 'Select your pets' },
//     { id: 4, title: 'Cart', description: 'Connect services to pets' },
//     { id: 5, title: 'Location', description: 'Where to provide services' },
//     { id: 6, title: 'Schedule', description: 'Date & time' },
//     { id: 7, title: 'Confirm', description: 'Review & book' },
//   ];

//   const handleNext = () => {
//     if (currentStep < steps.length) {
//       setCurrentStep(currentStep + 1);
//       setSearchQuery('');
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//       setSearchQuery('');
//     }
//   };

//   const handleCategorySelect = (category: Category) => {
//     console.log('Selected category:', category);
//     setSelectedCategory(category);
//     updateBooking({
//       category,
//       selectedServices: [],
//       selectedPets: [],
//       connections: [],
//     });
//   };

//   const handleServiceToggle = (service: ServiceWithPricing) => {
//     const currentServices = bookingState.selectedServices || [];
//     const isSelected = currentServices.some((s) => s.id === service.id);

//     let updatedServices;
//     if (isSelected) {
//       updatedServices = currentServices.filter((s) => s.id !== service.id);
//     } else {
//       updatedServices = [...currentServices, service];
//     }

//     updateBooking({ selectedServices: updatedServices });
//   };

//   const handlePetToggle = (pet: Pets) => {
//     const currentPets = bookingState.selectedPets || [];
//     const isSelected = currentPets.some((p) => p.id === pet.id);

//     let updatedPets;
//     if (isSelected) {
//       updatedPets = currentPets.filter((p) => p.id !== pet.id);
//     } else {
//       updatedPets = [...currentPets, pet];
//     }

//     updateBooking({ selectedPets: updatedPets });
//   };

//   const canProceed = () => {
//     switch (currentStep) {
//       case 1:
//         return selectedCategory !== null;
//       case 2:
//         return (
//           bookingState.selectedServices &&
//           bookingState.selectedServices.length > 0
//         );
//       case 3:
//         return (
//           bookingState.selectedPets && bookingState.selectedPets.length > 0
//         );
//       case 4:
//         return bookingState.connections && bookingState.connections.length > 0;
//       case 5:
//         return bookingState.address !== undefined;
//       case 6:
//         return (
//           bookingState?.slots?.length || 0 > 0
//           // bookingState.connections &&
//           // bookingState.connections.length > 0 &&
//           // bookingState.connections.every((conn) => conn.timeSlot)
//         );
//       case 7:
//         return true;
//       default:
//         return false;
//     }
//   };

//   // Effect to pre-fill form when rescheduling
//   useEffect(() => {
//     if (
//       isRescheduling &&
//       originalBooking &&
//       categoriesData &&
//       !categoriesLoading &&
//       !subCategoriesLoading &&
//       !petsLoading &&
//       !addressesLoading &&
//       pets.length > 0 &&
//       addresses.length > 0
//     ) {
//       const { booking, pet, service, service_pricing, address } =
//         originalBooking;

//       // ✅ Category
//       if (service?.category_id) {
//         const categoryData = categoriesData?.data?.find(
//           (cat: Category) => cat.id === service.category_id
//         );
//         if (categoryData) {
//           setSelectedCategory(categoryData);
//           updateBooking({ category: categoryData });
//         }
//       }

//       // ✅ SubCategory & Service
//       if (service?.sub_category_id && subCategoriesData?.data) {
//         // Find subcategory
//         const subCat = subCategoriesData.data.find(
//           (sub: SubCategoryWithServices) =>
//             Number(sub.id) === Number(service.sub_category_id)
//         );

//         if (subCat) {
//           setSelectedSubCategory(subCat);

//           // Find actual service inside subcategory
//           const selectedSrv = subCat.services.find(
//             (srv: ServiceWithPricing) => Number(srv.id) === Number(service.id)
//           );

//           if (selectedSrv) {
//             updateBooking({ selectedServices: [selectedSrv] });
//           }
//         }
//       }

//       // ✅ Pets - Use actual pets data instead of originalBooking.pet
//       if (pet && pets.length > 0) {
//         const actualPet = pets.find((p: Pet) => p.id === pet.id);
//         if (actualPet) {
//           updateBooking({ selectedPets: [actualPet] });
//         }
//       }

//       // ✅ Address - Use actual addresses data instead of originalBooking.address
//       if (address && addresses.length > 0) {
//         const actualAddress = addresses.find(
//           (addr: Address) => addr.id === address.id
//         );
//         if (actualAddress) {
//           updateBooking({ address: actualAddress });
//         }
//       }

//       // ✅ Pricing
//       if (service_pricing) updateBooking({ selectedPricing: service_pricing });

//       // ✅ Appointment slots
//       if (booking.appointment_time_slot) {
//         const date = new Date(booking.appointment_time_slot);
//         const formattedDate = date.toISOString().split('T')[0];
//         const formattedTime = date.toLocaleTimeString('en-US', {
//           hour: 'numeric',
//           minute: '2-digit',
//           hour12: true,
//         });

//         updateBooking({
//           slots: [{ date: formattedDate, time: formattedTime }],
//         });
//       }

//       // 👇 Notes
//       if (booking.notes) updateBooking({ notes: booking.notes });
//     }
//   }, [
//     isRescheduling,
//     originalBooking,
//     categoriesData,
//     categoriesLoading,
//     subCategoriesLoading,
//     subCategoriesData,
//     pets,
//     addresses,
//     petsLoading,
//     addressesLoading,
//   ]);

//   // const handleConfirmBooking = async () => {
//   //   if (!user || !bookingState) return;

//   //   setLoading(true);
//   //   setError('');

//   //   try {
//   //     // ⏱ format appointment slots
//   //     const appointment_time_slots =
//   //       bookingState.slots?.map(({ date, time }) => {
//   //         const localDate = new Date(`${date}T${convertTo24Hr(time)}:00+05:30`);
//   //         return localDate.toISOString();
//   //       }) || [];

//   //     // 🧾 calculate tax & totals
//   //     const tax = (bookingState?.selectedPricing?.discounted_price || 1) * 0.18;

//   //     const basePayload = {
//   //       pet_id: bookingState.selectedPets?.map((pet) => pet.id),
//   //       service_id: bookingState.selectedServices?.map((service) => service.id),
//   //       service_pricing_id: bookingState.selectedPricing?.id,
//   //       address_id: bookingState.address?.id,
//   //       appointment_time_slots: appointment_time_slots,
//   //       payment_method: 'COD',
//   //       amount: bookingState?.selectedPricing?.discounted_price,
//   //       tax,
//   //       total: (bookingState?.selectedPricing?.discounted_price || 1) + tax,
//   //       notes: bookingState.notes || '',
//   //       nature:
//   //         bookingState.nature ||
//   //         bookingState?.selectedPets?.[0]?.pet_details?.nature ||
//   //         '',
//   //       health_conditions:
//   //         bookingState.health_conditions ||
//   //         bookingState?.selectedPets?.[0]?.pet_details?.health_conditions ||
//   //         '',
//   //     };

//   //     let response;

//   //     if (isRescheduling && originalBooking?.booking.id) {
//   //       response = await axiosInstance.put(
//   //         `/bookings/update/${originalBooking?.booking.id}`,
//   //         basePayload
//   //       );
//   //       toast.success('Booking Updated Successfully');
//   //     } else {
//   //       response = await axiosInstance.post('/bookings/new', basePayload);
//   //       toast.success('Booking Successful');
//   //     }

//   //     // 👇 invalidate queries
//   //     await Promise.all([
//   //       queryClient.invalidateQueries({ queryKey: ['bookings'] }),
//   //       queryClient.invalidateQueries({ queryKey: ['slotsWithStatus'] }),
//   //       queryClient.invalidateQueries({ queryKey: ['pets'] }),
//   //     ]);

//   //     if (response.status !== 200) {
//   //       throw new Error('Booking operation failed');
//   //     }

//   //     // 👇 keep your own redirect/reset
//   //     navigate('/history');
//   //     resetBooking();
//   //   } catch (err) {
//   //     console.error('Booking error:', err);
//   //     setError(
//   //       isRescheduling
//   //         ? 'Failed to update booking. Please try again.'
//   //         : 'Failed to create booking. Please try again.'
//   //     );
//   //     toast.error(
//   //       isRescheduling
//   //         ? 'Failed to update booking, please try again'
//   //         : 'Booking failed, please try again'
//   //     );
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   const handleConfirmBooking = async () => {
//     if (!user || !bookingState) return;

//     setLoading(true);
//     setError('');

//     try {
//       const apiPayload = generateAPIPayload();

//       console.log('[v0] Generated API payload:', apiPayload);

//       let response;

//       if (isRescheduling && originalBooking?.booking.id) {
//         // For rescheduling, use the update endpoint
//         response = await axiosInstance.put(
//           `/bookings/update/${originalBooking?.booking.id}`,
//           {
//             ...apiPayload,
//             IsNew: false,
//             booking_id: originalBooking.booking.id,
//           }
//         );
//         toast.success('Booking Updated Successfully');
//       } else {
//         // For new bookings, use the save endpoint
//         response = await axiosInstance.post('/bookings/save', apiPayload);
//         toast.success('Booking Successful');
//       }

//       // 👇 invalidate queries
//       await Promise.all([
//         queryClient.invalidateQueries({ queryKey: ['bookings'] }),
//         queryClient.invalidateQueries({ queryKey: ['slotsWithStatus'] }),
//         queryClient.invalidateQueries({ queryKey: ['pets'] }),
//       ]);

//       if (response.status !== 200) {
//         throw new Error('Booking operation failed');
//       }

//       // 👇 keep your own redirect/reset
//       navigate('/history');
//       resetBooking();
//     } catch (err) {
//       console.error('Booking error:', err);
//       setError(
//         isRescheduling
//           ? 'Failed to update booking. Please try again.'
//           : 'Failed to create booking. Please try again.'
//       );
//       toast.error(
//         isRescheduling
//           ? 'Failed to update booking, please try again'
//           : 'Booking failed, please try again'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div className="max-w-4xl mx-auto">
//       <BookingProgress currentStep={currentStep} steps={steps} />

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
//           {error}
//         </div>
//       )}

//       {(categoriesError ||
//         subCategoriesError ||
//         petsError ||
//         addressesError) && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
//           Failed to load data. Please try again.
//         </div>
//       )}

//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 min-h-[500px]">
//         {currentStep === 1 && !categoriesLoading && (
//           <CategoryStep
//             categories={categoriesData?.data || []}
//             selectedCategory={selectedCategory}
//             onCategorySelect={handleCategorySelect}
//             isLoading={
//               categoriesLoading ||
//               subCategoriesLoading ||
//               petsLoading ||
//               addressesLoading
//             }
//           />
//         )}

//         {currentStep === 2 && !subCategoriesLoading && (
//           <MultiServiceStep
//             subCategoriesData={subCategoriesData?.data || []}
//             selectedServices={bookingState.selectedServices || []}
//             searchQuery={searchQuery}
//             priceFilter={priceFilter}
//             onSearchChange={setSearchQuery}
//             onPriceFilterChange={setPriceFilter}
//             onServiceToggle={handleServiceToggle}
//             onResetPriceFilter={() => setPriceFilter({ min: 0, max: 5000 })}
//             isLoading={subCategoriesLoading}
//           />
//         )}

//         {currentStep === 3 && (
//           <MultiPetStep
//             pets={pets}
//             selectedPets={bookingState.selectedPets || []}
//             onPetToggle={handlePetToggle}
//             onShowAddPet={() => setShowAddPet(true)}
//             onHideAddPet={() => setShowAddPet(false)}
//             showAddPet={showAddPet}
//             loading={petsLoading}
//           />
//         )}

//         {currentStep === 4 && (
//           <ServicePetConnectionStep
//             selectedServices={bookingState.selectedServices || []}
//             selectedPets={bookingState.selectedPets || []}
//             connections={bookingState.connections || []}
//             onAddConnection={addServicePetConnection}
//             onRemoveConnection={removeServicePetConnection}
//             onUpdateConnection={updateServicePetConnection}
//           />
//         )}

//         {currentStep === 5 && (
//           <LocationStep
//             selectedAddress={bookingState.address || null}
//             showAddAddress={showAddAddress}
//             loading={loading}
//             onSelectAddress={(address) => updateBooking({ address })}
//             onShowAddAddress={() => setShowAddAddress(true)}
//             onHideAddAddress={() => setShowAddAddress(false)}
//           />
//         )}

//         {/* {currentStep === 6 && (
//           <MultiScheduleStep
//             connections={bookingState.connections || []}
//             onUpdateConnection={updateServicePetConnection}
//             isRescheduling={isRescheduling}
//           />
//         )} */}
//         {currentStep === 6 && (
//           <ScheduleStep
//             isRescheduling={isRescheduling}
//             slots={bookingState.slots || []}
//             onAddSlot={(slot) =>
//               updateBooking({ slots: [...(bookingState.slots || []), slot] })
//             }
//             onRemoveSlot={(index) =>
//               updateBooking({
//                 slots: bookingState.slots?.filter((_, i) => i !== index) || [],
//               })
//             }
//           />
//         )}

//         {/* {currentStep === 7 && (
//           <ConfirmationStep
//             bookingDetails={bookingState}
//             updateBooking={updateBooking}
//             onConfirm={handleConfirmBooking}
//             loading={loading}
//           />
//         )} */}
//         {currentStep === 7 && (
//           <MultiConfirmationStep
//             bookingDetails={bookingState}
//             updateBooking={updateBooking}
//             onConfirm={handleConfirmBooking}
//             loading={loading}
//           />
//         )}
//       </div>

//       {/* Navigation Buttons */}
//       <div className="flex items-center justify-between mt-8">
//         <button
//           onClick={handleBack}
//           disabled={currentStep === 1 || loading}
//           className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <ArrowLeft className="h-5 w-5" />
//           <span>Back</span>
//         </button>

//         {currentStep === steps.length ? null : (
//           <button
//             onClick={handleNext}
//             disabled={!canProceed()}
//             className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <span>Next</span>
//             <ArrowRight className="h-5 w-5" />
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Booking;
