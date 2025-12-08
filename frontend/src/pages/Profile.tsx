import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';
import {
    User,
    Mail,
    MapPin,
    Package,
    LogOut,
    Edit2,
    Plus,
    Trash2,
    Save,
    X,
    ChevronRight,
    Shield,
    Camera,
    Home,
    Briefcase,
    Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';

interface Address {
    _id: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    type: 'home' | 'work' | 'other';
    isDefault: boolean;
}

interface Order {
    _id: string;
    items: Array<{
        product: {
            name: string;
            image: string;
            price: number;
        } | string;
        productName: string;
        productImage: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    shippingAddress: {
        name: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
}

type TabType = 'profile' | 'addresses' | 'orders' | 'security';

export default function Profile() {
    const navigate = useNavigate();
    const { user, token, logout, updateUser, refreshProfile } = useAuth();
    const { showConfirm } = useToast();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile edit state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        gender: user?.gender || '',
        dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    });

    // Address state
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressForm, setAddressForm] = useState({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        type: 'home' as 'home' | 'work' | 'other',
        isDefault: false,
    });

    // Orders state
    const [orders, setOrders] = useState<Order[]>([]);

    // Password change state
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const loadData = async () => {
            // Fetch profile
            try {
                const response = await fetch(`${API_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setAddresses(data.user.addresses || []);
                    setProfileForm({
                        name: data.user.name || '',
                        phone: data.user.phone || '',
                        gender: data.user.gender || '',
                        dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.split('T')[0] : '',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                setMessage({ type: 'error', text: 'Failed to load profile data' });
            }

            // Fetch orders
            try {
                const response = await fetch(`${API_URL}/orders/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setOrders(data);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            }
        };

        loadData();
    }, [token, navigate]);

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(profileForm),
            });
            const data = await response.json();
            if (response.ok) {
                updateUser(data.user);
                setIsEditingProfile(false);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                await refreshProfile();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            console.error('Update profile error:', error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/addresses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(addressForm),
            });
            const data = await response.json();
            if (response.ok) {
                setAddresses(data.addresses);
                setIsAddingAddress(false);
                resetAddressForm();
                setMessage({ type: 'success', text: 'Address added successfully!' });
                // Refresh profile to sync addresses across app
                await refreshProfile();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            console.error('Add address error:', error);
            setMessage({ type: 'error', text: 'Failed to add address' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAddress = async (addressId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/addresses/${addressId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(addressForm),
            });
            const data = await response.json();
            if (response.ok) {
                setAddresses(data.addresses);
                setEditingAddressId(null);
                resetAddressForm();
                setMessage({ type: 'success', text: 'Address updated successfully!' });
                // Refresh profile to sync addresses across app
                await refreshProfile();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            console.error('Update address error:', error);
            setMessage({ type: 'error', text: 'Failed to update address' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        showConfirm('Are you sure you want to delete this address?', async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/users/addresses/${addressId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setAddresses(data.addresses);
                    setMessage({ type: 'success', text: 'Address deleted successfully!' });
                    // Refresh profile to sync addresses across app
                    await refreshProfile();
                } else {
                    setMessage({ type: 'error', text: data.message });
                }
            } catch (error) {
                console.error('Delete address error:', error);
                setMessage({ type: 'error', text: 'Failed to delete address' });
            } finally {
                setLoading(false);
            }
        });
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setIsChangingPassword(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setMessage({ type: 'success', text: 'Password changed successfully!' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            console.error('Change password error:', error);
            setMessage({ type: 'error', text: 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    const resetAddressForm = () => {
        setAddressForm({
            name: '',
            phone: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
            type: 'home',
            isDefault: false,
        });
    };

    const startEditAddress = (address: Address) => {
        setEditingAddressId(address._id);
        setAddressForm({
            name: address.name,
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
            type: address.type,
            isDefault: address.isDefault,
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const tabs = [
        { id: 'profile' as TabType, label: 'Profile Information', icon: User },
        { id: 'addresses' as TabType, label: 'Manage Addresses', icon: MapPin },
        { id: 'orders' as TabType, label: 'My Orders', icon: Package },
        { id: 'security' as TabType, label: 'Security', icon: Shield },
    ];

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-white via-amber-50/30 to-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-black mb-2">My Account</h1>
                    <p className="text-black/60">Manage your profile, addresses, and orders</p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {message.text}
                        <button onClick={() => setMessage({ type: '', text: '' })} className="float-right">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="border-amber-200/60 rounded-2xl overflow-hidden">
                            {/* User Info Header */}
                            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                            {user.profileImage ? (
                                                <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User className="h-8 w-8 text-white" />
                                            )}
                                        </div>
                                        <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg">
                                            <Camera className="h-3 w-3 text-amber-600" />
                                        </button>
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-lg">{user.name}</h2>
                                        <p className="text-white/80 text-sm">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <CardContent className="p-4">
                                <nav className="space-y-1">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => {
                                                    if (tab.id === 'orders') {
                                                        navigate('/orders');
                                                    } else {
                                                        setActiveTab(tab.id);
                                                    }
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'text-black/60 hover:bg-amber-50 hover:text-amber-600'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className="h-5 w-5" />
                                                    <span className="font-medium text-sm">{tab.label}</span>
                                                </div>
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        );
                                    })}
                                </nav>

                                <div className="border-t border-amber-100 mt-4 pt-4">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span className="font-medium text-sm">Logout</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Card className="border-amber-200/60 rounded-2xl">
                            <CardContent className="p-6">
                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold text-black">Personal Information</h2>
                                            {!isEditingProfile ? (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsEditingProfile(true)}
                                                    className="border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                                >
                                                    <Edit2 className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsEditingProfile(false)}
                                                        className="border-gray-200"
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleUpdateProfile}
                                                        disabled={loading}
                                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                                    >
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-black/60 mb-2">Full Name</label>
                                                {isEditingProfile ? (
                                                    <input
                                                        type="text"
                                                        value={profileForm.name}
                                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                ) : (
                                                    <p className="text-black font-medium">{user.name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-black/60 mb-2">Email Address</label>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-black font-medium">{user.email}</p>
                                                    {user.isVerified && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Verified</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-black/60 mb-2">Mobile Number</label>
                                                {isEditingProfile ? (
                                                    <input
                                                        type="tel"
                                                        value={profileForm.phone}
                                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                        placeholder="+91 XXXXX XXXXX"
                                                    />
                                                ) : (
                                                    <p className="text-black font-medium">{user.phone || 'Not added'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-black/60 mb-2">Gender</label>
                                                {isEditingProfile ? (
                                                    <select
                                                        value={profileForm.gender}
                                                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                ) : (
                                                    <p className="text-black font-medium capitalize">{user.gender || 'Not specified'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-black/60 mb-2">Date of Birth</label>
                                                {isEditingProfile ? (
                                                    <input
                                                        type="date"
                                                        value={profileForm.dateOfBirth}
                                                        onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                                                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                ) : (
                                                    <p className="text-black font-medium">
                                                        {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not specified'}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-black/60 mb-2">Member Since</label>
                                                <p className="text-black font-medium">
                                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Addresses Tab */}
                                {activeTab === 'addresses' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold text-black">Manage Addresses</h2>
                                            {!isAddingAddress && !editingAddressId && (
                                                <Button
                                                    onClick={() => setIsAddingAddress(true)}
                                                    className="bg-amber-600 hover:bg-amber-700 text-white"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add New Address
                                                </Button>
                                            )}
                                        </div>

                                        {/* Add/Edit Address Form */}
                                        {(isAddingAddress || editingAddressId) && (
                                            <div className="mb-6 p-6 bg-amber-50/50 rounded-xl border border-amber-200">
                                                <h3 className="font-semibold text-black mb-4">
                                                    {isAddingAddress ? 'Add New Address' : 'Edit Address'}
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        value={addressForm.name}
                                                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                                        className="px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                    <input
                                                        type="tel"
                                                        placeholder="Phone Number"
                                                        value={addressForm.phone}
                                                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                        className="px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Street Address"
                                                        value={addressForm.street}
                                                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                                        className="md:col-span-2 px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="City"
                                                        value={addressForm.city}
                                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                        className="px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="State"
                                                        value={addressForm.state}
                                                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                        className="px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="PIN Code"
                                                        value={addressForm.zipCode}
                                                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                                                        className="px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                    <select
                                                        value={addressForm.type}
                                                        onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value as 'home' | 'work' | 'other' })}
                                                        className="px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    >
                                                        <option value="home">Home</option>
                                                        <option value="work">Work</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                    <div className="md:col-span-2 flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="isDefault"
                                                            checked={addressForm.isDefault}
                                                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                                            className="w-4 h-4 text-amber-600 rounded"
                                                        />
                                                        <label htmlFor="isDefault" className="text-sm text-black/70">Set as default address</label>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 mt-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setIsAddingAddress(false);
                                                            setEditingAddressId(null);
                                                            resetAddressForm();
                                                        }}
                                                        className="border-gray-200"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={() => editingAddressId ? handleUpdateAddress(editingAddressId) : handleAddAddress()}
                                                        disabled={loading}
                                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                                    >
                                                        {editingAddressId ? 'Update' : 'Save'} Address
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Address List */}
                                        <div className="space-y-4">
                                            {addresses.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <MapPin className="h-12 w-12 text-amber-200 mx-auto mb-4" />
                                                    <p className="text-black/60">No addresses saved yet</p>
                                                </div>
                                            ) : (
                                                addresses.map((address) => (
                                                    <div
                                                        key={address._id}
                                                        className={`p-4 rounded-xl border ${address.isDefault ? 'border-amber-400 bg-amber-50/30' : 'border-gray-200'}`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {address.type === 'home' && <Home className="h-4 w-4 text-amber-600" />}
                                                                    {address.type === 'work' && <Briefcase className="h-4 w-4 text-amber-600" />}
                                                                    <span className="font-medium text-black capitalize">{address.type}</span>
                                                                    {address.isDefault && (
                                                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Default</span>
                                                                    )}
                                                                </div>
                                                                <p className="font-semibold text-black">{address.name}</p>
                                                                <p className="text-black/60 text-sm mt-1">
                                                                    {address.street}, {address.city}, {address.state} - {address.zipCode}
                                                                </p>
                                                                <p className="text-black/60 text-sm mt-1">Phone: {address.phone}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => startEditAddress(address)}
                                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAddress(address._id)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Orders Tab */}
                                {activeTab === 'orders' && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-black mb-6">My Orders</h2>
                                        {orders.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Package className="h-12 w-12 text-amber-200 mx-auto mb-4" />
                                                <p className="text-black/60 mb-4">No orders yet</p>
                                                <Button
                                                    onClick={() => navigate('/collections')}
                                                    className="bg-amber-600 hover:bg-amber-700 text-white"
                                                >
                                                    Start Shopping
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {orders.map((order) => (
                                                    <div key={order._id} className="p-4 rounded-xl border border-gray-200">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div>
                                                                <p className="text-sm text-black/60">Order #{order._id.slice(-8).toUpperCase()}</p>
                                                                <p className="text-xs text-black/40">
                                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric',
                                                                    })}
                                                                </p>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                    order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm text-black/60">{order.items.length} item(s)</p>
                                                            <p className="font-semibold text-amber-600">₹{order.totalAmount}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Security Tab */}
                                {activeTab === 'security' && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-black mb-6">Security Settings</h2>

                                        <div className="space-y-6">
                                            {/* Change Password */}
                                            <div className="p-6 rounded-xl border border-gray-200">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Lock className="h-5 w-5 text-amber-600" />
                                                        <div>
                                                            <h3 className="font-semibold text-black">Password</h3>
                                                            <p className="text-sm text-black/60">Change your password</p>
                                                        </div>
                                                    </div>
                                                    {!isChangingPassword && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setIsChangingPassword(true)}
                                                            className="border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                                        >
                                                            Change
                                                        </Button>
                                                    )}
                                                </div>

                                                {isChangingPassword && (
                                                    <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
                                                        <input
                                                            type="password"
                                                            placeholder="Current Password"
                                                            value={passwordForm.currentPassword}
                                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                            className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                        />
                                                        <input
                                                            type="password"
                                                            placeholder="New Password"
                                                            value={passwordForm.newPassword}
                                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                            className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                        />
                                                        <input
                                                            type="password"
                                                            placeholder="Confirm New Password"
                                                            value={passwordForm.confirmPassword}
                                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                            className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                        />
                                                        <div className="flex gap-3">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setIsChangingPassword(false);
                                                                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                                                }}
                                                                className="border-gray-200"
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                onClick={handleChangePassword}
                                                                disabled={loading}
                                                                className="bg-amber-600 hover:bg-amber-700 text-white"
                                                            >
                                                                Update Password
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Email Verification Status */}
                                            <div className="p-6 rounded-xl border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-5 w-5 text-amber-600" />
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-black">Email Verification</h3>
                                                        <p className="text-sm text-black/60">{user.email}</p>
                                                    </div>
                                                    {user.isVerified ? (
                                                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Verified</span>
                                                    ) : (
                                                        <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">Not Verified</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
