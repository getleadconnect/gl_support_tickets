import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';

export default function TicketsSimple() {
  console.log('TicketsSimple component rendering');
  
  return (
    <DashboardLayout title="Tickets">
      <div className="p-6">
        <h1>Tickets Page - Simple Version</h1>
        <p>If you can see this, the basic component is working.</p>
      </div>
    </DashboardLayout>
  );
}