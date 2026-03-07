'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { facultyNavItems } from '../page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssignmentManager } from '@/components/faculty/assignment-manager';
import { MaterialManager } from '@/components/faculty/material-manager';

export default function FacultyAcademicsPage() {
    return (
        <DashboardLayout
            title="Academic Management"
            navItems={facultyNavItems}
        >
            <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
                <Tabs defaultValue="assignments" className="space-y-8">
                    <TabsList className="bg-surface border border-border p-1 rounded-2xl h-auto gap-1">
                        <TabsTrigger
                            value="assignments"
                            className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-text-primary font-bold"
                        >
                            Assignments
                        </TabsTrigger>
                        <TabsTrigger
                            value="materials"
                            className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-text-primary font-bold"
                        >
                            Study Materials
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="assignments" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                        <AssignmentManager />
                    </TabsContent>

                    <TabsContent value="materials" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                        <MaterialManager />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
