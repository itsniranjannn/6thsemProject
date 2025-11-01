import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.js';
import ConfirmationModal from '../components/ConfirmationModel.js';
import { 
  User, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Settings, 
  History,
  TrendingUp,
  Shield,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Edit,
  X,
  CheckCircle,
  Clock,
  Truck,
  PackageCheck,
  AlertCircle,
  ArrowLeft,
  Filter,
  Search,
  Download,
  Eye,
  Trash2,
  Star,
  Heart,
  Bell,
  LogOut,
  LayoutDashboard,
  Map,
  Globe,
  CreditCard as CardIcon,
  Smartphone,
  Database,
  Activity,
  Award,
  Target,
  BarChart3,
  Wallet,
  Truck as ShippingIcon,
  MessageSquare,
  FileText,
  Shield as SecurityIcon,
  Zap,
  Crown,
  BadgeCheck,
  RefreshCw,
  Send,
  Key,
  AlertTriangle,
  Save,
  Upload,
  UserCheck,
  MailCheck
} from 'lucide-react';

// Enhanced Dashboard Stats Component
const DashboardStats = ({ stats, user }) => {
  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: Package,
      color: 'blue',
      description: 'All time orders',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders || 0,
      icon: Clock,
      color: 'amber',
      description: 'Awaiting processing',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Delivered',
      value: stats.deliveredOrders || 0,
      icon: PackageCheck,
      color: 'emerald',
      description: 'Successfully delivered',
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      title: 'Total Spent',
      value: `Rs. ${(stats.totalSpent || 0).toLocaleString()}`,
      icon: CreditCard,
      color: 'purple',
      description: 'Lifetime value',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Member Since',
      value: new Date(user?.created_at).getFullYear(),
      icon: Award,
      color: 'indigo',
      description: 'Loyal customer',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate || 95}%`,
      icon: Target,
      color: 'green',
      description: 'Order completion',
      gradient: 'from-green-500 to-teal-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: index * 0.1, type: "spring" }}
          whileHover={{ 
            y: -5,
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
        >
          {/* Gradient Background Effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Enhanced Profile Section with Phone and Email Verification
const ProfileSection = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Nepal'
  });

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || 'Nepal'
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Profile update response:', data);

      if (data.success) {
        // Update both local state and localStorage
        const updatedUser = { ...user, ...data.user };
        onUpdate(updatedUser);
        
        // Update localStorage immediately
        const currentUserData = JSON.parse(localStorage.getItem('user'));
        const updatedUserData = { ...currentUserData, ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        // Show confirmation and reset editing
        setSaveConfirmation(true);
        setTimeout(() => {
          setSaveConfirmation(false);
          setIsEditing(false);
        }, 2000);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setIsVerifyingEmail(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: user.email })
      });

      const data = await response.json();
      if (data.success) {
        alert('Verification email sent! Please check your inbox.');
      } else {
        // Check if email is already verified
        if (data.message?.includes('already verified')) {
          // Update local state to show verified status
          const updatedUser = { ...user, email_verified: true };
          onUpdate(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          alert('Email is already verified!');
        } else {
          alert(data.message || 'Failed to send verification email');
        }
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Error sending verification email');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const calculateMemberDuration = () => {
    if (!user?.created_at) return 'Recently joined';
    
    const joinDate = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const handleCancelEdit = () => {
    // Reset form data to original user data
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      country: user?.country || 'Nepal'
    });
    setIsEditing(false);
  };

  const hasChanges = () => {
    return formData.name !== user?.name ||
           formData.phone !== user?.phone ||
           formData.address !== user?.address ||
           formData.city !== user?.city ||
           formData.country !== user?.country;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
          <p className="text-sm text-gray-600">Manage your personal details and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {saveConfirmation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full"
            >
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Saved!</span>
            </motion.div>
          )}
          <button
            onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            {isEditing ? <X size={16} /> : <Edit size={16} />}
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900">{user?.name}</h4>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <Award size={16} className="text-amber-500" />
                <span className="text-sm text-gray-600">
                  Member for {calculateMemberDuration()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <BadgeCheck size={16} className={user?.email_verified ? "text-green-500" : "text-gray-400"} />
                <span className={`text-sm ${user?.email_verified ? "text-green-600" : "text-gray-500"}`}>
                  {user?.email_verified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification Banner */}
        {!user?.email_verified && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-50 border border-amber-200 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle size={20} className="text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">Email Not Verified</p>
                  <p className="text-sm text-amber-700">Verify your email to access all features</p>
                </div>
              </div>
              <button
                onClick={handleVerifyEmail}
                disabled={isVerifyingEmail}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {isVerifyingEmail ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                <span>{isVerifyingEmail ? 'Sending...' : 'Verify Email'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Profile Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <User size={18} />
              <span>Personal Information</span>
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-900 font-medium py-3 px-2 bg-gray-50 rounded-lg">
                  {user?.name || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              {isEditing ? (
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                    placeholder="Enter your email"
                  />
                  {user?.email_verified && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={20} />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between py-3 px-2 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                  {user?.email_verified ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <AlertCircle size={20} className="text-amber-500" />
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="+977 98XXXXXXXX"
                />
              ) : (
                <p className="text-gray-900 font-medium py-3 px-2 bg-gray-50 rounded-lg">
                  {user?.phone || 'Not provided'}
                </p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <MapPin size={18} />
              <span>Address Information</span>
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Enter your street address"
                />
              ) : (
                <p className="text-gray-900 font-medium py-3 px-2 bg-gray-50 rounded-lg min-h-[60px]">
                  {user?.address || 'Not provided'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your city"
                  />
                ) : (
                  <p className="text-gray-900 font-medium py-3 px-2 bg-gray-50 rounded-lg">
                    {user?.city || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                {isEditing ? (
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="Nepal">Nepal</option>
                    <option value="India">India</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium py-3 px-2 bg-gray-50 rounded-lg">
                    {user?.country || 'Nepal'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex space-x-3 pt-6 border-t border-gray-200"
          >
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges()}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span className="font-semibold">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </span>
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              <X size={18} />
              <span className="font-semibold">Cancel</span>
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Enhanced Change Password Component with Confirmation Modal
const ChangePasswordSection = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmPasswordChange = async () => {
    setIsLoading(true);
    setMessage('');
    setShowConfirmation(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(data.message || 'Failed to change password');
      }
    } catch (error) {
      setMessage('Error changing password');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Change Password</h3>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Confirm new password"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded-xl ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <Key size={18} />
            <span className="font-semibold">
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </span>
          </button>
        </form>
      </motion.div>

      {/* Password Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmPasswordChange}
        title="Change Password"
        message="Are you sure you want to change your password? You will need to use your new password for future logins."
        confirmText="Yes, Change Password"
        cancelText="Cancel"
        type="warning"
        isLoading={isLoading}
      />
    </>
  );
};

// Enhanced Order Card Component
const OrderCard = ({ order, onViewDetails, onCancelOrder }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: Clock,
        gradient: 'from-amber-400 to-orange-500'
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        gradient: 'from-blue-400 to-cyan-500'
      },
      shipped: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Truck,
        gradient: 'from-purple-400 to-pink-500'
      },
      delivered: {
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: PackageCheck,
        gradient: 'from-emerald-400 to-green-500'
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: X,
        gradient: 'from-red-400 to-rose-500'
      }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  
  // Only show cancel button for pending/confirmed orders
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  // Show refunded amount if payment is refunded
  const displayAmount = order.payment_status === 'refunded' ? 0 : order.total_amount;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${statusConfig.gradient} shadow-lg`}>
            <StatusIcon size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">Order #{order.id}</p>
            <p className="text-sm text-gray-600">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          {/* Show 0 if refunded, otherwise show actual amount */}
          <p className={`font-bold text-xl ${
            order.payment_status === 'refunded' ? 'text-green-600 line-through' : 'text-gray-900'
          }`}>
            Rs. {displayAmount?.toLocaleString()}
          </p>
          {order.payment_status === 'refunded' && (
            <p className="text-sm text-green-600 font-semibold">💰 Refunded</p>
          )}
          <p className="text-sm text-gray-600">{order.item_count} items</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600 font-medium">Payment Method</p>
          <p className="font-semibold capitalize flex items-center space-x-1">
            <CardIcon size={14} />
            <span>{order.payment_method}</span>
          </p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Payment Status</p>
          <p className={`font-semibold ${
            order.payment_status === 'completed' ? 'text-green-600' : 
            order.payment_status === 'refunded' ? 'text-blue-600' : 
            order.payment_status === 'failed' ? 'text-red-600' :
            'text-amber-600'
          }`}>
            {order.payment_status}
            {order.payment_status === 'refunded' && ' 💰'}
          </p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Items</p>
          <p className="font-semibold">{order.total_items || order.item_count} products</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Order Status</p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.color} border`}>
            {order.status}
            {order.status === 'cancelled' && ' ❌'}
          </span>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => onViewDetails(order.id)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 group"
        >
          <Eye size={18} />
          <span className="font-semibold">View Details</span>
        </button>
        
        {/* Cancel button only for eligible orders */}
        {canCancel && (
          <button
            onClick={() => onCancelOrder(order.id)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <Trash2 size={18} />
            <span className="font-semibold">Cancel Order</span>
          </button>
        )}

        {/* Show message if order cannot be cancelled */}
        {!canCancel && order.status !== 'cancelled' && (
          <div className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-600 rounded-xl">
            <span className="text-sm font-semibold">Cannot Cancel</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Enhanced Order History Component
const OrderHistory = ({ orders, onViewDetails, onCancelOrder }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = order.id.toString().includes(searchTerm) || 
                         order.payment_method?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Order History</h3>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={onViewDetails}
              onCancelOrder={onCancelOrder}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h4 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h4>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start shopping to see your orders here!'
              }
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Enhanced Order Details Modal
const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  // Calculate display amount based on refund status
  const displayAmount = order.payment_status === 'refunded' ? 0 : order.total_amount;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Order Details</h2>
              <p className="text-gray-600">Order #{order.id}</p>
              {/* Show cancellation badge if cancelled */}
              {order.status === 'cancelled' && (
                <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold mt-2">
                  ❌ Order Cancelled
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Items */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <ShoppingCart size={20} />
                <span>Order Items</span>
              </h3>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <img
                      src={item.product_image || '/api/placeholder/80/80'}
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded-xl shadow-sm"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600 mb-2">{item.product_description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700">Qty: {item.quantity}</p>
                        <p className="font-bold text-gray-900">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className={`rounded-2xl p-6 border ${
                order.payment_status === 'refunded' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200'
              }`}>
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <FileText size={20} />
                  <span>Order Summary</span>
                  {/* Show refund badge */}
                  {order.payment_status === 'refunded' && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                      💰 Refunded
                    </span>
                  )}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-semibold">Rs. {order.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-200">
                    <span className="text-gray-700">Shipping Fee</span>
                    <span className="font-semibold">Rs. {order.shipping_fee?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-200">
                    <span className="text-gray-700">Discount</span>
                    <span className="font-semibold text-green-600">-Rs. {order.discount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-t border-gray-300">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    {/* Show 0 if refunded */}
                    <span className={`text-xl font-bold ${
                      order.payment_status === 'refunded' ? 'text-green-600 line-through' : 'text-gray-900'
                    }`}>
                      Rs. {displayAmount?.toLocaleString()}
                    </span>
                  </div>
                  {/* Show refund message */}
                  {order.payment_status === 'refunded' && (
                    <div className="bg-green-100 border border-green-300 rounded-xl p-3 text-center">
                      <p className="text-green-800 font-semibold">✅ Full amount has been refunded</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <CreditCard size={20} />
                  <span>Payment Information</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Payment Method</span>
                    <span className="font-semibold capitalize">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Payment Status</span>
                    <span className={`font-semibold ${
                      order.payment_status === 'completed' ? 'text-green-600' : 
                      order.payment_status === 'refunded' ? 'text-blue-600' : 
                      order.payment_status === 'failed' ? 'text-red-600' :
                      'text-amber-600'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                  {order.transaction_id && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Transaction ID</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {order.transaction_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {order.shipping_address && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <MapPin size={20} />
                    <span>Shipping Address</span>
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{order.shipping_address}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Dashboard Component
const UserDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:5000/api/users/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch order history
      const ordersResponse = await fetch('http://localhost:5000/api/users/orders/history?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Process responses
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setDashboardStats(statsData.stats);
        }
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        if (ordersData.success) {
          setOrders(ordersData.orders);
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSelectedOrder(data.order);
        setIsOrderModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleCancelOrderClick = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setOrderToCancel(order);
      setIsCancelModalOpen(true);
    }
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    setIsCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/orders/${orderToCancel.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        // Close modals and refresh data
        setIsCancelModalOpen(false);
        setOrderToCancel(null);
        fetchDashboardData(); // Refresh the data
        
        // Show success message
        setTimeout(() => {
          alert(`✅ Order #${orderToCancel.id} cancelled successfully!\n\n💰 Payment has been refunded and product stock restored.`);
        }, 100);
      } else {
        alert(`❌ Failed to cancel order: ${data.message}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('❌ Error cancelling order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    // Update both local state and AuthContext
    updateUser(updatedUser);
    // Also update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // Refresh dashboard data to ensure consistency
    fetchDashboardData();
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 h-32 shadow-lg"></div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 h-96"></div>
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center lg:text-left"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 p-4">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Here's your complete shopping activity and account overview
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex overflow-x-auto space-x-1 bg-white/80 backdrop-blur-sm rounded-2xl p-2 mb-8 shadow-lg border border-gray-200 scrollbar-hide"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <DashboardStats stats={dashboardStats} user={user} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <ProfileSection user={user} onUpdate={handleProfileUpdate} />
                  
                  <div className="lg:col-span-2">
                    <OrderHistory
                      orders={orders.slice(0, 5)}
                      onViewDetails={handleViewOrderDetails}
                      onCancelOrder={handleCancelOrderClick}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <OrderHistory
                orders={orders}
                onViewDetails={handleViewOrderDetails}
                onCancelOrder={handleCancelOrderClick}
              />
            )}

            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProfileSection user={user} onUpdate={handleProfileUpdate} />
                <ChangePasswordSection />
              </div>
            )}

            {activeTab === 'security' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChangePasswordSection />
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Account Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-3">
                        <Shield className="text-green-600" size={24} />
                        <div>
                          <p className="font-semibold text-green-900">Account Status</p>
                          <p className="text-sm text-green-700">Active and Secure</p>
                        </div>
                      </div>
                      <CheckCircle className="text-green-600" size={24} />
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-semibold"
                    >
                      <LogOut size={20} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />

      {/* Cancel Order Confirmation Modal */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
        title="Cancel Order"
        message={
          orderToCancel ? `Are you sure you want to cancel Order #${orderToCancel.id}?\n\n` +
          `Total Amount: Rs. ${orderToCancel.total_amount}\n` +
          `This action will:\n` +
          `• Set order status to "cancelled"\n` +
          `• Set payment status to "refunded"\n` +
          `• Refund the full amount (Rs. 0)\n` +
          `• Restore product stock\n\n` +
          `This action cannot be undone.` : ''
        }
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep Order"
        type="danger"
        isLoading={isCancelling}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to log in again to access your account."
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};

export default UserDashboard;