'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuUser, LuMail, LuPhone, LuMapPin, LuGraduationCap, LuBriefcase, LuSave, LuShield, LuBuilding, LuBadgeCheck } from 'react-icons/lu';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { DEPT_ADMIN_NAV, UNI_ADMIN_NAV, SUPERADMIN_NAV, FACULTY_NAV } from '@/lib/constants/nav-config';

export default function ProfilePage() {
    const { user: authUser } = useAuthStore();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    // Form states
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        address: '',
        qualifications: '',
        experience: ''
    });

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users/me');
            setProfile(data);
            setFormData({
                username: data.username || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                address: data.address || '',
                qualifications: data.facultyDetails?.qualifications || '',
                experience: data.facultyDetails?.experience || ''
            });
        } catch (e) {
            console.error('Failed to load profile:', e);
            showToast('error', 'Failed to load profile details.');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            // Update User Profile
            await api.put('/users/profile', {
                username: formData.username,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                address: formData.address
            });

            // If Faculty, update Faculty details separately if needed, 
            // but we can also update them through the faculty endpoint
            if (profile?.role === 'FACULTY' && profile?.entityId) {
                await api.put(`/faculty/${profile.entityId}`, {
                    qualifications: formData.qualifications,
                    experience: formData.experience
                });
            }

            showToast('success', 'Profile updated successfully!');
            fetchProfile();
        } catch (e: any) {
            console.error('Failed to save profile:', e);
            const msg = e.response?.data?.error || 'Failed to update profile.';
            showToast('error', msg);
        } finally {
            setSaving(false);
        }
    };

    // Determine navigation based on role
    const getNavItems = () => {
        switch (authUser?.role) {
            case 'SUPERADMIN': return SUPERADMIN_NAV;
            case 'UNI_ADMIN': return UNI_ADMIN_NAV;
            case 'DEPT_ADMIN': return DEPT_ADMIN_NAV;
            case 'FACULTY': return FACULTY_NAV;
            default: return [];
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'FACULTY']}>
            <DashboardLayout navItems={getNavItems()} title="User Profile">
                <Toast toast={toast} onClose={hideToast} />

                <div className="max-w-4xl mx-auto space-y-8 pb-12">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center gap-6 p-8 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10">
                            <LuBadgeCheck className="w-32 h-32 text-primary" />
                        </div>
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg relative z-10">
                            {profile?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center md:text-left relative z-10">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{profile?.username}</h2>
                            <p className="text-primary font-semibold uppercase tracking-wider text-sm mt-1 flex items-center justify-center md:justify-start">
                                <LuShield className="w-4 h-4 mr-2" /> {profile?.role?.replace('_', ' ')}
                            </p>
                            <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center"><LuMail className="w-4 h-4 mr-1.5" /> {profile?.email}</span>
                                {profile?.phoneNumber && <span className="flex items-center"><LuPhone className="w-4 h-4 mr-1.5" /> {profile?.phoneNumber}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Left Column: Personal info */}
                        <div className="md:col-span-12 space-y-8">
                            <Card className="glass-card border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                                <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b dark:border-white/10 px-8 py-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl text-slate-900 dark:text-white">Personal Details</CardTitle>
                                            <CardDescription className="text-slate-500 dark:text-slate-400">Update your contact and identification information</CardDescription>
                                        </div>
                                        <LuUser className="w-6 h-6 text-primary/40" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                                                <LuUser className="w-4 h-4 mr-2 text-primary" /> Username
                                            </label>
                                            <Input
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                placeholder="johndoe"
                                                className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-primary/20 transition-all text-slate-900 dark:text-white font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                                                <LuMail className="w-4 h-4 mr-2 text-primary" /> Email
                                            </label>
                                            <Input
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="john@vnsgu.ac.in"
                                                className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-primary/20 transition-all text-slate-900 dark:text-white font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                                                <LuPhone className="w-4 h-4 mr-2 text-primary" /> Contact Number
                                            </label>
                                            <Input
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                placeholder="+91 9876543210"
                                                className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-primary/20 transition-all text-slate-900 dark:text-white font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                                                <LuMapPin className="w-4 h-4 mr-2 text-primary" /> Address
                                            </label>
                                            <Input
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="City, State, Country"
                                                className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-primary/20 transition-all text-slate-900 dark:text-white font-medium"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Faculty Specific Fields */}
                            {(profile?.role === 'FACULTY' || profile?.role === 'DEPT_ADMIN') && (
                                <Card className="glass-card border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                                    <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b dark:border-white/10 px-8 py-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-xl">Professional Background</CardTitle>
                                                <CardDescription>Highlight your academic qualifications and work experience</CardDescription>
                                            </div>
                                            <LuBriefcase className="w-6 h-6 text-primary/40" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                                                <LuGraduationCap className="w-4 h-4 mr-2 text-primary" /> Educational Qualifications
                                            </label>
                                            <Textarea
                                                value={formData.qualifications}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, qualifications: e.target.value })}
                                                placeholder="e.g. Ph.D. in Computer Science, M.Tech, etc."
                                                rows={3}
                                                className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-primary/20 transition-all text-slate-900 dark:text-white font-medium resize-none shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                                                <LuBriefcase className="w-4 h-4 mr-2 text-primary" /> Professional Experience
                                            </label>
                                            <Textarea
                                                value={formData.experience}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, experience: e.target.value })}
                                                placeholder="Describe your previous academic and industrial experience..."
                                                rows={4}
                                                className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-primary/20 transition-all text-slate-900 dark:text-white font-medium resize-none shadow-inner"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Institutional Context (Read-only) */}
                            <Card className="glass-card border-slate-200 dark:border-white/10 overflow-hidden shadow-sm opacity-80 shadow-inner bg-slate-50/30 dark:bg-transparent">
                                <CardHeader className="px-8 py-4 border-b dark:border-white/5">
                                    <CardTitle className="text-sm uppercase tracking-widest text-slate-500 font-bold flex items-center">
                                        <LuBuilding className="w-4 h-4 mr-2" /> Institutional Context
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">University</p>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{profile?.university?.name || 'VNSGU'}</p>
                                    </div>
                                    {profile?.facultyDetails?.departments && (
                                        <div className="md:col-span-2">
                                            <p className="text-xs font-bold text-slate-500 uppercase">Affiliated Department(s)</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {profile.facultyDetails.departments.map((d: any) => (
                                                    <span key={d.departmentId} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold ring-1 ring-primary/20">
                                                        {d.department?.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="px-10 py-6 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all bg-gradient-to-r from-primary to-indigo-600 border-0"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full mr-2"></div>
                                    ) : (
                                        <LuSave className="w-5 h-5 mr-2" />
                                    )}
                                    Update Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

