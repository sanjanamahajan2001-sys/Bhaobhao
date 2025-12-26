export interface Groomer {
  email: string;
  role: string;
  groomer_name: string;
  gender: string;
  mobile_number: string;
  profile_image: string[];
  dob: string | null;
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  size: 'Small' | 'Medium' | 'Large';
  specialInstructions?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Booking {
  id: string;
  pet: Pet;
  customer: Customer;
  services: string[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  notes?: string;
  estimatedDuration: number; // in minutes
}

export interface LoginCredentials {
  groomerId: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  groomer: Groomer;
}

// Add to your existing types
export interface PaymentTransaction {
  id?: number;
  transaction_id?: string;
  booking_id: number;
  amount: number;
  method: 'UPI' | 'Cash';
  notes: string;
  status?: 'Completed' | 'Pending';
  createdat?: string;
  updatedat?: string;
}
export interface BookingData {
  customer: any;
  booking: {
    id: number;
    status: string;
    appointment_time_slot: string;
    [key: string]: any;
  };
  pet: any;
  service: any;
  service_pricing: any;
  address: any;
  transactions: PaymentTransaction[]; // Add this line
}
