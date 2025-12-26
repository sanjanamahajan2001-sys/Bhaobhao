import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, Filter, X, DogIcon } from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { PricingOption, Service } from '@/types/booking.type';

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

interface SubCategoryWithServices {
  id: number;
  sub_category_name: string;
  photos: string[];
  description: string;
  services: ServiceWithPricing[];
}

interface ServiceStepProps {
  searchQuery: string;
  priceFilter: { min: number; max: number };
  selectedService: Service | null;
  subCategoriesData: SubCategoryWithServices[];
  onSearchChange: (query: string) => void;
  onPriceFilterChange: (filter: { min: number; max: number }) => void;
  onServiceSelect: (
    service: Service,
    subCategory: SubCategoryWithServices
  ) => void;
  onResetPriceFilter: () => void;
}
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
};
const ServiceStep: React.FC<ServiceStepProps> = ({
  searchQuery,
  priceFilter,
  selectedService,
  subCategoriesData,
  onSearchChange,
  onPriceFilterChange,
  onServiceSelect,
  onResetPriceFilter,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  // inside ServiceStep
  const { bookingState, updateBooking } = useBooking();
  // Get all services with their subcategory info
  const allServices = useMemo(() => {
    return subCategoriesData.flatMap((subCategory) =>
      subCategory.services.map((service) => ({
        ...service,
        subCategory: subCategory,
        minPrice: Math.min(...service.pricing.map((p) => p.discounted_price)),
        maxPrice: Math.max(...service.pricing.map((p) => p.discounted_price)),
      }))
    );
  }, [subCategoriesData]);

  // Filter services based on search and price
  const filteredServices = useMemo(() => {
    return allServices.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.smallDescription
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        service.subCategory.sub_category_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesPrice =
        service.minPrice >= priceFilter.min &&
        service.minPrice <= priceFilter.max;

      return matchesSearch && matchesPrice;
    });
  }, [allServices, searchQuery, priceFilter]);

  // Group filtered services by subcategory
  const groupedServices = useMemo(() => {
    const groups: {
      [key: number]: { subCategory: SubCategoryWithServices; services: any[] };
    } = {};

    filteredServices.forEach((service) => {
      if (!groups[service.subCategory.id]) {
        groups[service.subCategory.id] = {
          subCategory: service.subCategory,
          services: [],
        };
      }
      groups[service.subCategory.id].services.push(service);
    });

    return Object.values(groups);
  }, [filteredServices]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Service
        </h2>
        <p className="text-gray-600 max-sm:hidden">
          Select the perfect service for your pet
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        {/* // TODO ADD LATER */}
        <div className="  items-center justify-between hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>

          {(priceFilter.min > 0 || priceFilter.max < 5000) && (
            <button
              onClick={onResetPriceFilter}
              className="flex items-center space-x-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200"
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceFilter.min || ''}
                  onChange={(e) =>
                    onPriceFilterChange({
                      ...priceFilter,
                      min: Number(e.target.value) || 0,
                    })
                  }
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceFilter.max || ''}
                  onChange={(e) =>
                    onPriceFilterChange({
                      ...priceFilter,
                      max: Number(e.target.value) || 5000,
                    })
                  }
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Services by Subcategory */}
      <div className="space-y-8">
        {groupedServices.map(({ subCategory, services }) => (
          <div key={subCategory.id} className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-teal-600">
                  {subCategory.sub_category_name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {subCategory.sub_category_name}
                </h3>
                <p className="text-gray-600">{subCategory.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                // Find the pricing option with the largest discounted price
                const highestPricing = service.pricing.reduce(
                  (prev: any, curr: any) =>
                    curr.discounted_price > prev.discounted_price ? curr : prev
                );

                return (
                  <div
                    key={service.id}
                    className={`
        relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg
        ${
          selectedService?.id === service.id
            ? 'border-teal-500 bg-teal-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-teal-300'
        }
      `}
                    onClick={() => {
                      onServiceSelect(service, subCategory);
                      updateBooking({ selectedPricing: highestPricing });
                    }}
                  >
                    {/* Service Image */}
                    {service.photos && service.photos.length > 0 ? (
                      <div className="mb-4">
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${
                            service.photos[0]
                          }`}
                          alt={service.name}
                          className="w-full h-40 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <DogIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}

                    {/* Service Info */}
                    <div className="space-y-3">
                      <div>
                        <h4
                          className={`
                                      font-semibold text-lg mb-2
                                      ${
                                        selectedService?.id === service.id
                                          ? 'text-teal-900'
                                          : 'text-gray-900'
                                      }
                                    `}
                        >
                          {service.name}
                        </h4>
                        <p
                          className={`
                                          text-sm leading-relaxed
                                          ${
                                            selectedService?.id === service.id
                                              ? 'text-teal-700'
                                              : 'text-gray-600'
                                          }
                                        `}
                        >
                          {service.smallDescription}
                        </p>
                      </div>

                      {/* Rating and Duration */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{service.rating}</span>
                          <span className="text-gray-500">
                            ({service.totalRatings.toLocaleString()})
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(service.durationMinutes)}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center space-x-2">
                        {highestPricing.mrp >
                          highestPricing.discounted_price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(highestPricing.mrp)}
                          </span>
                        )}
                        <span className="text-lg font-semibold text-green-600">
                          {formatPrice(highestPricing.discounted_price)}
                        </span>
                      </div>

                      {/* Pet Types */}
                      <div className="flex flex-wrap gap-1">
                        {service.petType
                          .slice(0, 3)
                          .map((type: string, index: number) => (
                            <span
                              key={index}
                              className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${
                  selectedService?.id === service.id
                    ? 'bg-teal-200 text-teal-800'
                    : 'bg-gray-100 text-gray-700'
                }
              `}
                            >
                              {type}
                            </span>
                          ))}
                        {service.petType.length > 3 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            +{service.petType.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                     <a
                      href="https://wa.me/919579279673"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fixed bottom-16 right-6 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 32 32"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path d="M16 .3C7.2.3.1 7.4.1 16.3c0 2.9.7 5.6 2.1 8.1L.3 31.8l7.6-2c2.3 1.2 4.9 1.8 7.5 1.8 8.9 0 16.1-7.2 16.1-16.1S24.9.3 16 .3zm0 29.3c-2.5 0-5-.6-7.2-1.8l-.5-.3-4.5 1.2 1.2-4.4-.3-.5C3.3 21.3 2.7 18.9 2.7 16.3c0-7.3 6-13.3 13.3-13.3s13.3 6 13.3 13.3-6 13.3-13.3 13.3z" />
                      </svg>
                      <span>Connect on WhatsApp</span>
                    </a>


                    {/* Selection Indicator */}
                    {selectedService?.id === service.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No services found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filters to find more services.
          </p>
        </div>
      )}

      {/* Service Details Modal (if needed) */}
      {/* {selectedService && (
        <div className="mt-8 p-3 sm:p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-teal-900 mb-2">Selected Service</h4>
          <p className="text-teal-800 text-sm mb-4">
            {selectedService.description}
          </p>

          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-teal-900 mb-2">
                Available Pricing Options:
              </h5>
              <div className="space-y-2">
                {selectedService.pricing.map((pricing) => {
                  const isSelected =
                    bookingState.selectedPricing?.id === pricing.id;

                  return (
                    <div
                      key={pricing.id}
                      onClick={() =>
                        updateBooking({ selectedPricing: pricing })
                      }
                      className={`
                                  flex items-center justify-between p-3 rounded-lg cursor-pointer border-2 transition
                                  ${
                                    isSelected
                                      ? 'border-teal-500 bg-teal-50'
                                      : 'border-gray-200 bg-white hover:border-teal-300'
                                  }
                                `}
                    >
                      <div>
                        <span className="font-medium text-gray-900">
                          {pricing.pet_size}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          ({pricing.groomer_level})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-green-600">
                          {formatPrice(pricing.discounted_price)}
                        </span>
                        {pricing.mrp > pricing.discounted_price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(pricing.mrp)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ServiceStep;
// {services.map((service) => (
//               <div
//                 key={service.id}
//                 className={`
//                   relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg
//                   ${
//                     selectedService?.id === service.id
//                       ? 'border-teal-500 bg-teal-50 shadow-md'
//                       : 'border-gray-200 bg-white hover:border-teal-300'
//                   }
//                 `}
//                 onClick={() => onServiceSelect(service, subCategory)}
//               >
//                 {/* Service Image */}
//                 {service.photos && service.photos.length > 0 ? (
//                   <div className="mb-4">
//                     <img
//                       src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${
//                         service.photos[0]
//                       }`}
//                       alt={service.name}
//                       className="w-full h-40 object-cover rounded-lg"
//                       loading="lazy"
//                     />
//                   </div>
//                 ) : (
//                   <div className="w-full h-full bg-gray-100 flex items-center justify-center">
//                     <DogIcon className="h-6 w-6 text-gray-400" />
//                   </div>
//                 )}

//                 {/* Service Info */}
//                 <div className="space-y-3">
//                   <div>
//                     <h4
//                       className={`
//                       font-semibold text-lg mb-2
//                       ${
//                         selectedService?.id === service.id
//                           ? 'text-teal-900'
//                           : 'text-gray-900'
//                       }
//                     `}
//                     >
//                       {service.name}
//                     </h4>
//                     <p
//                       className={`
//                       text-sm leading-relaxed
//                       ${
//                         selectedService?.id === service.id
//                           ? 'text-teal-700'
//                           : 'text-gray-600'
//                       }
//                     `}
//                     >
//                       {service.smallDescription}
//                     </p>
//                   </div>

//                   {/* Rating and Duration */}
//                   <div className="flex items-center justify-between text-sm">
//                     <div className="flex items-center space-x-1">
//                       <Star className="h-4 w-4 text-yellow-400 fill-current" />
//                       <span className="font-medium">{service.rating}</span>
//                       <span className="text-gray-500">
//                         ({service.totalRatings.toLocaleString()})
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-1 text-gray-600">
//                       <Clock className="h-4 w-4" />
//                       <span>{formatDuration(service.durationMinutes)}</span>
//                     </div>
//                   </div>

//                   {/* Price Range */}
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-1">
//                       {/* <DollarSign className="h-4 w-4 text-green-600" /> */}
//                       <span className="font-semibold text-green-600">
//                         {formatPrice(service.minPrice)}
//                         {service.minPrice !== service.maxPrice && (
//                           <span> - {formatPrice(service.maxPrice)}</span>
//                         )}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Pet Types */}
//                   <div className="flex flex-wrap gap-1">
//                     {service.petType
//                       .slice(0, 3)
//                       .map((type: string, index: number) => (
//                         <span
//                           key={index}
//                           className={`
//                           px-2 py-1 rounded-full text-xs font-medium
//                           ${
//                             selectedService?.id === service.id
//                               ? 'bg-teal-200 text-teal-800'
//                               : 'bg-gray-100 text-gray-700'
//                           }
//                         `}
//                         >
//                           {type}
//                         </span>
//                       ))}
//                     {service.petType.length > 3 && (
//                       <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
//                         +{service.petType.length - 3} more
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Selection Indicator */}
//                 {selectedService?.id === service.id && (
//                   <div className="absolute top-4 right-4">
//                     <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
//                       <svg
//                         className="w-4 h-4 text-white"
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
