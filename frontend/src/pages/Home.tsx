import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar,
  History,
  User,
  Scissors,
  Heart,
  Sparkles,
  ArrowRight,
  Star,
  Shield,
  Clock,
  TrendingUp,
  Award,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  PawPrint,
  Users,
  Target,
  Zap,
  Globe,
  Headphones,
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Book Service',
      description: 'Schedule a grooming appointment',
      icon: Calendar,
      action: () => navigate('/booking'),
      gradient: 'from-blue-600 via-purple-600 to-teal-600',
      iconBg: 'from-blue-500 to-purple-500',
    },
    {
      title: 'View History',
      description: 'See past appointments',
      icon: History,
      action: () => navigate('/history'),
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      iconBg: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Manage Profile',
      description: 'Update pets and addresses',
      icon: User,
      action: () => navigate('/profile'),
      gradient: 'from-violet-600 via-purple-600 to-pink-600',
      iconBg: 'from-violet-500 to-purple-500',
    },
  ];

  const features = [
    {
      icon: PawPrint,
      title: 'Expert Care',
      description: 'Certified professionals with 10+ years experience',
      color: 'blue',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Fully insured with health protocols',
      color: 'green',
    },
    {
      icon: Clock,
      title: 'Flexible Timing',
      description: 'Book appointments that fit your schedule',
      color: 'purple',
    },
    {
      icon: Heart,
      title: 'Loving Care',
      description: 'We treat your pets like our own family',
      color: 'pink',
    },
    {
      icon: Star,
      title: 'Premium Quality',
      description: 'Top-rated service with 4.9★ reviews',
      color: 'yellow',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer assistance',
      color: 'indigo',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-50 to-blue-100 text-blue-600',
      green: 'from-green-50 to-green-100 text-green-600',
      purple: 'from-purple-50 to-purple-100 text-purple-600',
      pink: 'from-pink-50 to-pink-100 text-pink-600',
      yellow: 'from-yellow-50 to-yellow-100 text-yellow-600',
      indigo: 'from-indigo-50 to-indigo-100 text-indigo-600',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl"></div>
        <div className="absolute inset-0 hero-background-pattern opacity-30"></div>

        <div className="relative p-4 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-4 mb-8">
              {/* <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                <img src="/logo.png" alt="Bhao Bhao" className="h-10 w-10" />
              </div> */}
              <div>
                <div className="text-white/90 text-2xl sm:text-3xl font-semibold">
                  Welcome,
                </div>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {user?.full_name}!{' '}
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Professional in home 
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                pet grooming
              </span>
            </h1>

            <p className="text-sm sm:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed  ">
              What you get is - Experienced groomers who are very gentle with
              pets and give them a comfortable experience in their home space.
            
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/booking')}
                className="group bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 text-white sm:px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <Calendar className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>Book a grooming service</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button
                onClick={() => navigate('/history')}
                className="bg-white/10 backdrop-blur-sm text-white sm:px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-3 border border-white/20"
              >
                <History className="h-6 w-6" />
                <span>View History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-40 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-20 w-16 h-16 bg-gradient-to-r from-teal-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="group relative bg-white rounded-3xl p-4 sm:p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-500 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100/50 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>

            <div
              className={`bg-gradient-to-r ${action.iconBg} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10 shadow-lg`}
            >
              <action.icon className="h-8 w-8 text-white" />
            </div>

            <h3 className="font-bold text-gray-900 mb-3 text-xl relative z-10 group-hover:text-gray-800 transition-colors">
              {action.title}
            </h3>
            <p className="text-gray-600 relative z-10 mb-4 group-hover:text-gray-700 transition-colors">
              {action.description}
            </p>

            <div className="flex items-center text-teal-600 group-hover:text-teal-700 transition-colors relative z-10">
              <span className="font-medium mr-2">Get Started</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </button>
        ))}
      </div>

      {/* Stats Dashboard */}
      {/* <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
          <div className="text-sm text-gray-600 mb-1">Completed Sessions</div>
          <div className="text-xs text-green-600 font-medium">
            +2 this month
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
          <div className="text-sm text-gray-600 mb-1">Upcoming Bookings</div>
          <div className="text-xs text-blue-600 font-medium">Next: Jan 15</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <Award className="h-4 w-4 text-purple-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">4.9</div>
          <div className="text-sm text-gray-600 mb-1">Average Rating</div>
          <div className="text-xs text-purple-600 font-medium">
            Excellent service
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Heart className="h-6 w-6 text-orange-600" />
            </div>
            <div className="bg-orange-50 p-2 rounded-lg">
              <PawPrint className="h-4 w-4 text-orange-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
          <div className="text-sm text-gray-600 mb-1">Happy Pets</div>
          <div className="text-xs text-orange-600 font-medium">
            All registered
          </div>
        </div>
      </div> */}

      {/* Features Grid */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>

        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-blue-700 font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Premium Pet Care
            </h2>
            <p className="text-sm sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the difference with our award-winning grooming services
              designed for your pet's comfort and your complete peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group text-center hover:scale-105 transition-all duration-300"
              >
                <div
                  className={`bg-gradient-to-br ${getColorClasses(
                    feature.color
                  )} p-6 rounded-3xl w-fit mx-auto mb-6 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border border-gray-100`}
                >
                  <feature.icon className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {/* <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-teal-50 to-blue-50 rounded-full -translate-y-24 -translate-x-24 opacity-50"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-gradient-to-r from-teal-100 to-blue-100 p-3 rounded-xl">
              <Clock className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Activity
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Grooming Completed
                </h3>
                <p className="text-gray-600 text-sm">
                  Max&apos;s Premium Spa session was completed successfully
                </p>
                <div className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full inline-block mt-2">
                  2 days ago
                </div>
              </div>
            </div>

    
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Upcoming Appointment
                </h3>
                <p className="text-gray-600 text-sm">
                  Buddy&apos;s Basic Bath scheduled for Jan 15, 10:00 AM
                </p>
                <div className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full inline-block mt-2">
                  in 3 days
                </div>
              </div>
            </div>

        
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Review Submitted
                </h3>
                <p className="text-gray-600 text-sm">
                  You rated your last grooming session 5 stars
                </p>
                <div className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full inline-block mt-2">
                  1 week ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Company Stats */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 rounded-3xl p-4 sm:p-8 lg:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 stats-background-pattern opacity-50"></div>

        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20">
              <Globe className="h-5 w-5 text-blue-400" />
              <span className="text-white/90 font-medium">
                Trusted Nationwide
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              Trusted by Pet Parents Everywhere
            </h2>
            <p className="text-white/80 text-sm sm:text-lg max-w-2xl mx-auto ">
              Join thousands of satisfied customers who trust us with their
              beloved pets
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">
                15,000+
              </div>
              <div className="text-white/80 max-sm:text-sm group-hover:text-white transition-colors">
                Happy Pets Served
              </div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                200+
              </div>
              <div className="text-white/80 max-sm:text-sm group-hover:text-white transition-colors">
                Expert Groomers
              </div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                4.9★
              </div>
              <div className="text-white/80 max-sm:text-sm group-hover:text-white transition-colors">
                Average Rating
              </div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent mb-2">
                50+
              </div>
              <div className="text-white/80 max-sm:text-sm group-hover:text-white transition-colors">
                Cities Covered
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 rounded-3xl p-4 sm:p-8 border border-teal-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-3 rounded-xl">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Need Help?</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
                <Phone className="h-5 w-5 text-teal-600" />
                <span className="text-gray-700 font-medium">07900118109</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
                <Mail className="h-5 w-5 text-teal-600" />
                <span className="text-gray-700 font-medium">
                  hi@bhaobaho.in
                </span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
                <MapPin className="h-5 w-5 text-teal-600" />
                <span className="text-gray-700 font-medium">
                  Available in 10+ cities
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl p-4 sm:p-8 border border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-16 translate-x-16"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Service Hours</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between p-2 sm:p-3 bg-white/50 rounded-xl">
                <span className="text-gray-700 max-sm:text-sm">
                  Monday - Friday
                </span>
                <span className="font-semibold text-gray-900">
                  9:00 AM - 6:00 PM
                </span>
              </div>
              <div className="flex justify-between p-2 sm:p-3 bg-white/50 rounded-xl">
                <span className="text-gray-700">Saturday</span>
                <span className="font-semibold text-gray-900">
                  9:00 AM - 4:00 PM
                </span>
              </div>
              <div className="flex justify-between p-2 sm:p-3 bg-white/50 rounded-xl">
                <span className="text-gray-700">Sunday</span>
                <span className="font-semibold text-gray-900">
                  10:00 AM - 3:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
