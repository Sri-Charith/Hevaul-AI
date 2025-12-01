import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, LogOut, Shield, Activity, Edit2, Save, X, Phone, Calendar, Ruler, Weight, Heart, AlertTriangle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const Profile = () => {
    const { user, logout, updateProfile } = useAuthStore();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        photoUrl: '',
        dateOfBirth: '',
        gender: '',
        height: '',
        weight: '',
        healthProfile: {
            diseases: [],
            allergies: [],
            medications: [],
            activityLevel: 'sedentary',
            dietType: 'none'
        },
        emergencyContact: {
            name: '',
            phone: '',
            relation: ''
        },
        alertSettings: {
            emailAlerts: true,
            smsAlerts: false,
            emergencyAlerts: true
        }
    });

    // Initialize form data when user loads
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                photoUrl: user.photoUrl || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                gender: user.gender || '',
                height: user.height || '',
                weight: user.weight || '',
                healthProfile: {
                    diseases: user.healthProfile?.diseases || [],
                    allergies: user.healthProfile?.allergies || [],
                    medications: user.healthProfile?.medications || [],
                    activityLevel: user.healthProfile?.activityLevel || 'sedentary',
                    dietType: user.healthProfile?.dietType || 'none'
                },
                emergencyContact: {
                    name: user.emergencyContact?.name || '',
                    phone: user.emergencyContact?.phone || '',
                    relation: user.emergencyContact?.relation || ''
                },
                alertSettings: {
                    emailAlerts: user.alertSettings?.emailAlerts ?? true,
                    smsAlerts: user.alertSettings?.smsAlerts ?? false,
                    emergencyAlerts: user.alertSettings?.emergencyAlerts ?? true
                }
            });
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSave = async () => {
        setIsLoading(true);
        const result = await updateProfile(formData);
        setIsLoading(false);
        if (result.success) {
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } else {
            toast.error(result.error || 'Failed to update profile');
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const calculateBMI = (height, weight) => {
        if (!height || !weight) return null;
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        return bmi;
    };

    const getBMIStatus = (bmi) => {
        if (!bmi) return null;
        if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
        if (bmi < 25) return { label: 'Normal', color: 'text-green-500' };
        if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-500' };
        return { label: 'Obese', color: 'text-red-500' };
    };

    if (!user) return null;

    const age = calculateAge(formData.dateOfBirth);
    const bmi = calculateBMI(formData.height, formData.weight);
    const bmiStatus = getBMIStatus(bmi);

    // Helper for array inputs (comma separated)
    const handleArrayInput = (e, field, subField) => {
        const values = e.target.value.split(',').map(item => item.trim());
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                [subField]: values
            }
        }));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">

            {/* Header Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-12 text-white shadow-2xl shadow-blue-500/20">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center text-4xl font-bold shadow-xl overflow-hidden">
                                {formData.photoUrl ? (
                                    <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user.name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                            {isEditing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-xs font-medium">Change URL</span>
                                </div>
                            )}
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            {isEditing ? (
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-2xl font-bold h-12"
                                    placeholder="Your Name"
                                />
                            ) : (
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{user.name}</h1>
                            )}

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <div className="flex items-center gap-2 text-blue-100 bg-blue-500/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm font-medium">{user.email}</span>
                                </div>
                                {formData.phone && (
                                    <div className="flex items-center gap-2 text-blue-100 bg-blue-500/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm font-medium">{formData.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`gap-2 ${isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-white/10 hover:bg-white/20'} border-none text-white`}
                    >
                        {isEditing ? (
                            <>{isLoading ? 'Saving...' : 'Save Changes'} <Save className="w-4 h-4" /></>
                        ) : (
                            <>Edit Profile <Edit2 className="w-4 h-4" /></>
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* Left Column: Personal Stats */}
                <div className="md:col-span-1 space-y-6">
                    {/* Physical Stats */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" /> Physical Stats
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <div className="text-xs text-gray-500 mb-1">Age</div>
                                    <div className="font-bold text-gray-900">{age} yrs</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <div className="text-xs text-gray-500 mb-1">Gender</div>
                                    {isEditing ? (
                                        <select
                                            value={formData.gender}
                                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full bg-transparent text-sm font-bold outline-none"
                                        >
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    ) : (
                                        <div className="font-bold text-gray-900 capitalize">{formData.gender || 'N/A'}</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">Height (cm)</span>
                                        {isEditing && <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: parseFloat(e.target.value) })} className="w-20 text-right border rounded px-1" />}
                                    </div>
                                    {!isEditing && <div className="font-bold text-gray-900">{formData.height || 'N/A'} cm</div>}
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">Weight (kg)</span>
                                        {isEditing && <input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })} className="w-20 text-right border rounded px-1" />}
                                    </div>
                                    {!isEditing && <div className="font-bold text-gray-900">{formData.weight || 'N/A'} kg</div>}
                                </div>
                            </div>

                            {/* BMI Card */}
                            {bmi && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-blue-900">BMI</span>
                                        <span className={`text-sm font-bold ${bmiStatus?.color}`}>{bmiStatus?.label}</span>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-700">{bmi}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" /> Emergency Contact
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500">Name</label>
                                {isEditing ? (
                                    <Input
                                        value={formData.emergencyContact.name}
                                        onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value } })}
                                        className="h-8 text-sm"
                                    />
                                ) : (
                                    <div className="font-medium text-gray-900">{formData.emergencyContact.name || 'Not set'}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Phone</label>
                                {isEditing ? (
                                    <Input
                                        value={formData.emergencyContact.phone}
                                        onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phone: e.target.value } })}
                                        className="h-8 text-sm"
                                    />
                                ) : (
                                    <div className="font-medium text-gray-900">{formData.emergencyContact.phone || 'Not set'}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Relation</label>
                                {isEditing ? (
                                    <Input
                                        value={formData.emergencyContact.relation}
                                        onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, relation: e.target.value } })}
                                        className="h-8 text-sm"
                                    />
                                ) : (
                                    <div className="font-medium text-gray-900">{formData.emergencyContact.relation || 'Not set'}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle & Right Column: Health Profile & Details */}
                <div className="md:col-span-2 space-y-6">

                    {/* Basic Info Form (Edit Mode Only) */}
                    {isEditing && (
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">Phone Number</label>
                                    <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Date of Birth</label>
                                    <Input type="date" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500">Profile Photo URL</label>
                                    <Input value={formData.photoUrl} onChange={e => setFormData({ ...formData, photoUrl: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Health Profile */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-pink-500" /> Health Profile
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Medical Conditions */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Diseases / Conditions</label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.healthProfile.diseases.join(', ')}
                                            onChange={e => handleArrayInput(e, 'healthProfile', 'diseases')}
                                            placeholder="e.g. Diabetes, Hypertension (comma separated)"
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.healthProfile.diseases.length > 0 ? (
                                                formData.healthProfile.diseases.map((item, i) => (
                                                    <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">{item}</span>
                                                ))
                                            ) : <span className="text-gray-400 italic">None listed</span>}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Allergies</label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.healthProfile.allergies.join(', ')}
                                            onChange={e => handleArrayInput(e, 'healthProfile', 'allergies')}
                                            placeholder="e.g. Peanuts, Penicillin"
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.healthProfile.allergies.length > 0 ? (
                                                formData.healthProfile.allergies.map((item, i) => (
                                                    <span key={i} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-medium">{item}</span>
                                                ))
                                            ) : <span className="text-gray-400 italic">None listed</span>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lifestyle */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Current Medications</label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.healthProfile.medications.join(', ')}
                                            onChange={e => handleArrayInput(e, 'healthProfile', 'medications')}
                                            placeholder="e.g. Aspirin 100mg"
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.healthProfile.medications.length > 0 ? (
                                                formData.healthProfile.medications.map((item, i) => (
                                                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">{item}</span>
                                                ))
                                            ) : <span className="text-gray-400 italic">None listed</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Activity Level</label>
                                        {isEditing ? (
                                            <select
                                                value={formData.healthProfile.activityLevel}
                                                onChange={e => setFormData({ ...formData, healthProfile: { ...formData.healthProfile, activityLevel: e.target.value } })}
                                                className="w-full p-2 border rounded-lg text-sm"
                                            >
                                                <option value="sedentary">Sedentary</option>
                                                <option value="lightly_active">Lightly Active</option>
                                                <option value="moderately_active">Moderately Active</option>
                                                <option value="very_active">Very Active</option>
                                            </select>
                                        ) : (
                                            <div className="font-medium text-gray-900 capitalize">{formData.healthProfile.activityLevel.replace('_', ' ')}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Diet Type</label>
                                        {isEditing ? (
                                            <select
                                                value={formData.healthProfile.dietType}
                                                onChange={e => setFormData({ ...formData, healthProfile: { ...formData.healthProfile, dietType: e.target.value } })}
                                                className="w-full p-2 border rounded-lg text-sm"
                                            >
                                                <option value="none">None</option>
                                                <option value="vegetarian">Vegetarian</option>
                                                <option value="vegan">Vegan</option>
                                                <option value="keto">Keto</option>
                                                <option value="paleo">Paleo</option>
                                            </select>
                                        ) : (
                                            <div className="font-medium text-gray-900 capitalize">{formData.healthProfile.dietType}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alert Settings */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-500" /> Alert Settings
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                                {isEditing ? (
                                    <input
                                        type="checkbox"
                                        checked={formData.alertSettings.emailAlerts}
                                        onChange={e => setFormData({ ...formData, alertSettings: { ...formData.alertSettings, emailAlerts: e.target.checked } })}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                ) : (
                                    <span className={`text-sm font-bold ${formData.alertSettings.emailAlerts ? 'text-green-600' : 'text-gray-400'}`}>
                                        {formData.alertSettings.emailAlerts ? 'Enabled' : 'Disabled'}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-medium text-gray-700">Emergency Alerts</span>
                                {isEditing ? (
                                    <input
                                        type="checkbox"
                                        checked={formData.alertSettings.emergencyAlerts}
                                        onChange={e => setFormData({ ...formData, alertSettings: { ...formData.alertSettings, emergencyAlerts: e.target.checked } })}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                ) : (
                                    <span className={`text-sm font-bold ${formData.alertSettings.emergencyAlerts ? 'text-green-600' : 'text-gray-400'}`}>
                                        {formData.alertSettings.emergencyAlerts ? 'Enabled' : 'Disabled'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Logout Button */}
            <div className="flex justify-center pt-8">
                <button
                    onClick={handleLogout}
                    className="group flex items-center gap-2 px-8 py-4 bg-white border border-red-100 text-red-600 rounded-2xl font-semibold shadow-lg shadow-red-500/5 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Sign Out of Account</span>
                </button>
            </div>

        </div>
    );
};

export default Profile;
