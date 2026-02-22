'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Building2, Plus, Users, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function SuperAdminDashboard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [universities, setUniversities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddUniOpen, setIsAddUniOpen] = useState(false);
    const [newUniForm, setNewUniForm] = useState({
        name: '', shortName: '', location: '', email: '', adminUsername: '', adminPassword: ''
    });

    useEffect(() => {
        fetchUniversities();
    }, []);

    const fetchUniversities = async () => {
        try {
            const { data } = await api.get('/universities');
            setUniversities(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUniversity = async () => {
        try {
            await api.post('/universities', newUniForm);
            setIsAddUniOpen(false);
            setNewUniForm({ name: '', shortName: '', location: '', email: '', adminUsername: '', adminPassword: '' });
            fetchUniversities();
            alert('University and Admin account implicitly created!');
        } catch (e) {
            console.error(e);
            alert('Failed to create university. Ensure shortName or admin username is unique.');
        }
    };

    const navItems = [
        { title: 'Overview', href: '/superadmin', icon: <LayoutDashboard className="w-5 h-5" /> },
        { title: 'Universities', href: '/superadmin/universities', icon: <Building2 className="w-5 h-5" /> },
        { title: 'Users', href: '/superadmin/users', icon: <Users className="w-5 h-5" /> },
    ];

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <DashboardLayout navItems={navItems} title="Super Admin Dashboard">

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Universities Overview</h2>
                        <p className="text-slate-500">Manage all registered universities and their credentials.</p>
                    </div>
                    <Button onClick={() => setIsAddUniOpen(true)} className="bg-primary shadow-md hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" /> Add University
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {universities.map(uni => (
                            <Card key={uni.id} className="shadow-sm hover:shadow-md transition-all border-slate-200 cursor-pointer">
                                <CardHeader className="pb-3 border-b bg-slate-50/50 rounded-t-xl">
                                    <CardTitle className="flex items-start justify-between">
                                        <span className="font-semibold text-lg">{uni.shortName}</span>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">ACTIVE</span>
                                    </CardTitle>
                                    <CardDescription className="line-clamp-1">{uni.name}</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 pb-4">
                                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                                        <span className="flex items-center"><Building2 className="w-4 h-4 mr-2 text-primary/70" /> Departments</span>
                                        <span className="font-semibold px-2 bg-slate-100 rounded-md">{uni._count?.departments || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                                        <span className="flex items-center"><Users className="w-4 h-4 mr-2 text-primary/70" /> Faculty</span>
                                        <span className="font-semibold px-2 bg-slate-100 rounded-md">{uni._count?.faculty || 0}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {universities.length === 0 && (
                            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                                No universities found. Please add one to get started.
                            </div>
                        )}
                    </div>
                )}

                {/* Add University Modal */}
                <Dialog open={isAddUniOpen} onOpenChange={setIsAddUniOpen}>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Register New University</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Institution Name</label>
                                <Input
                                    placeholder="e.g. Veer Narmad South Gujarat University"
                                    value={newUniForm.name}
                                    onChange={(e) => setNewUniForm({ ...newUniForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Short Name (Identifier)</label>
                                <Input
                                    placeholder="e.g. VNSGU"
                                    value={newUniForm.shortName}
                                    onChange={(e) => setNewUniForm({ ...newUniForm, shortName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Location</label>
                                <Input
                                    placeholder="e.g. Surat, Gujarat"
                                    value={newUniForm.location}
                                    onChange={(e) => setNewUniForm({ ...newUniForm, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contact Email</label>
                                <Input
                                    type="email"
                                    placeholder="admin@vnsgu.ac.in"
                                    value={newUniForm.email}
                                    onChange={(e) => setNewUniForm({ ...newUniForm, email: e.target.value })}
                                />
                            </div>

                            <hr className="my-4" />
                            <h4 className="text-sm font-semibold text-slate-800">Root Admin Account</h4>
                            <p className="text-xs text-slate-500 mb-2">This account will have total control over the newly provisioned university.</p>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Admin Username</label>
                                <Input
                                    placeholder="admin_vnsgu"
                                    value={newUniForm.adminUsername}
                                    onChange={(e) => setNewUniForm({ ...newUniForm, adminUsername: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Temporary Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newUniForm.adminPassword}
                                    onChange={(e) => setNewUniForm({ ...newUniForm, adminPassword: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddUniOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleCreateUniversity}
                                disabled={!newUniForm.name || !newUniForm.shortName || !newUniForm.adminUsername || !newUniForm.adminPassword}
                            >
                                Provision Tenant
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </DashboardLayout>
        </ProtectedRoute>
    );
}
