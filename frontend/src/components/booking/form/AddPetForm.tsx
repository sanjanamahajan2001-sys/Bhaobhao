import React, { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import usePetTypes from '@/hooks/pets/usePetTypes';
import usePetBreeds from '@/hooks/pets/usePetBreeds';
import { Pets } from '@/types/booking.type';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

interface AddPetFormProps {
  onPetAdded: (petData: Pets) => void;
  onCancel: () => void;
  loading?: boolean;
  initialPet?: Pets;
  editingPetId?: string | null;
}

const AddPetForm: React.FC<AddPetFormProps> = ({
  onPetAdded,
  onCancel,
  loading,
  initialPet,
  editingPetId,
}) => {
  console.log('Editing pet ID:', initialPet);
  const [formData, setFormData] = useState({
    IsNew: true,
    PetID: '',
    remove_profile_image: false,
    pet_name: '',
    pet_gender: 'Male',
    pet_type_id: '1',
    breed_id: '1',
    owner_name: 'Jon Doe',
    pet_dob: '',
    nature: '',
    health_conditions: '',
    pet_pic: null as File | null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Load initial pet if editing
  useEffect(() => {
    if (initialPet && editingPetId) {
      setFormData({
        IsNew: false,
        PetID: initialPet.id?.toString() || '',
        remove_profile_image: false,
        pet_name: initialPet.pet_name || '',
        pet_gender: initialPet.pet_gender || 'Male',
        pet_type_id: initialPet.pet_type_id || '1',
        breed_id: initialPet.breed_id || '1',
        owner_name: initialPet.owner_name || 'Jon Doe',
        nature: initialPet.nature || '',
        health_conditions: initialPet.health_conditions || '',
        // 👇 format DOB (YYYY-MM-DD only)
        pet_dob: initialPet.pet_dob
          ? new Date(initialPet.pet_dob).toISOString().split('T')[0]
          : '',
        pet_pic: null,
      });
      setPreviewImage(
        initialPet.pet_pic_url
          ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${
              initialPet.pet_pic_url
            }`
          : 'https://static.vecteezy.com/system/resources/previews/021/334/027/non_2x/smiling-bernese-mountain-dog-avatar-tongue-hanging-out-cute-cartoon-pet-domestic-animal-vector.jpg'
      );
    }
  }, [initialPet, editingPetId]);

  // React Query hooks
  const {
    data: petTypes = [],
    isLoading: petTypesLoading,
    error: petTypesError,
  } = usePetTypes();

  const {
    data: petBreeds = [],
    isLoading: petBreedsLoading,
    error: petBreedsError,
  } = usePetBreeds();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // ✅ Ensure only images are allowed
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (jpg, png, etc.)');
        e.target.value = ''; // clear the input
        return;
      }

      // (Optional) Limit size, e.g., 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Image size should not exceed 5MB');
        e.target.value = '';
        return;
      }

      setFormData((prev) => ({
        ...prev,
        pet_pic: file,
        remove_profile_image: false, // ✅ Mark for addition
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.pet_name.trim() ||
      !formData.pet_dob ||
      // !formData.owner_name.trim() ||
      !formData.nature.trim() ||
      !formData.health_conditions.trim()
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    // if (formData.pet_name.length > 30 || formData.owner_name.length > 30) {
    if (formData.pet_name.length > 30) {
      toast.error('Name cannot exceed 30 characters');
      return;
    }
    // Validate date is not in the future
    const selectedDate = new Date(formData.pet_dob);
    if (selectedDate >= new Date()) {
      toast.error('Please select a valid date of birth');
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'pet_pic') {
          formDataToSend.append(key, value.toString());
        }
      });

      if (formData.pet_pic) {
        formDataToSend.append('pet_pic', formData.pet_pic);
      }

      const response = await axiosInstance.post('/pets/save', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(
        editingPetId ? 'Pet updated successfully!' : 'Pet added successfully!'
      );

      onPetAdded(response.data);
      onCancel();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save pet:', error);
      toast.error(
        error?.response?.data?.message ||
          'Failed to save pet. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      IsNew: true,
      PetID: '',
      remove_profile_image: false,
      pet_name: '',
      pet_gender: 'Male',
      pet_type_id: '1',
      breed_id: '1',
      owner_name: 'Jon Doe',
      pet_dob: '',
      nature: '',
      health_conditions: '',
      pet_pic: null,
    });
    setPreviewImage(null);
  };

  // Loading state
  if (petTypesLoading || petBreedsLoading) {
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
  if (petTypesError || petBreedsError) {
    return (
      <div className="bg-red-50 rounded-xl p-6 mb-6">
        <div className="text-red-600">
          Error loading form data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-3 sm:p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        {editingPetId ? 'Edit Pet' : 'Add New Pet'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="sm:col-span-2 mb-4">
          <div className="flex justify-center">
            {previewImage ? (
              <div className="relative inline-block">
                <img
                  src={previewImage}
                  alt="Pet preview"
                  className="h-32 w-32 rounded-full object-cover border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setFormData((prev) => ({
                      ...prev,
                      pet_pic: null,
                      remove_profile_image: true, // ✅ Mark for deletion
                    }));
                  }}
                  className="absolute top-1 right-1 bg-white rounded-full shadow p-1 hover:bg-gray-100 transition"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center h-32 w-32 rounded-full border-2 border-dashed border-gray-300 cursor-pointer hover:border-teal-500 transition">
                <span className="text-gray-500 text-sm">Upload</span>
                <input
                  type="file"
                  name="pet_pic"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Pet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pet Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pet_name"
              required
              value={formData.pet_name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter Pet Name"
            />
          </div>

          {/* Owner Name */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="owner_name"
              required
              value={formData.owner_name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter Owner Name"
            />
          </div> */}

          {/* Pet Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pet Type <span className="text-red-500">*</span>
            </label>
            <select
              name="pet_type_id"
              value={formData.pet_type_id}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {petTypes.map((type) => (
                <option key={type.id} value={type.id.toString()}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Breed <span className="text-red-500">*</span>
            </label>
            <select
              name="breed_id"
              value={formData.breed_id}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {petBreeds.map((breed) => (
                <option key={breed.id} value={breed.id.toString()}>
                  {breed.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="pet_gender"
              value={formData.pet_gender}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="pet_dob"
                required
                value={formData.pet_dob}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent  "
              />
            </div>
          </div>
          {/* nature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nature <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="nature"
                required
                value={formData.nature}
                placeholder='e.g. "Active", "Passive", "Aggressive"'
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent  "
              />
            </div>
          </div>
          {/* health_conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health Conditions <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="health_conditions"
                required
                value={formData.health_conditions}
                placeholder='e.g. "Healthy", "Sick", "Injured"'
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent  "
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={
              submitting ||
              loading ||
              !formData.pet_name.trim() ||
              !formData.pet_dob
              // ||
              // !formData.owner_name.trim()
            }
            className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting
              ? editingPetId
                ? 'Saving...'
                : 'Adding...'
              : editingPetId
              ? 'Save Changes'
              : 'Save Pet'}
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onCancel();
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPetForm;
