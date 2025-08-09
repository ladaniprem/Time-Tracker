import { useQuery } from '@tanstack/react-query';
import backend from '~backend/client';
import StatsCard from '../components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, AlertTriangle, UserX, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: backend.attendance.getDashboardStats,
  });

  const { data: recentAttendance } = useQuery({
    queryKey: ['recent-attendance'],
    queryFn: () => backend.attendance.listAttendance({ limit: 5 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={Users}
          description="Active workforce"
        />
        <StatsCard
          title="Present Today"
          value={stats?.presentToday || 0}
          icon={Clock}
          description="Checked in employees"
        />
        <StatsCard
          title="Late Today"
          value={stats?.lateToday || 0}
          icon={AlertTriangle}
          description="Late arrivals"
        />
        <StatsCard
          title="Absent Today"
          value={stats?.absentToday || 0}
          icon={UserX}
          description="Not checked in"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Average Working Hours</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats?.averageWorkingHours || 0}h
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Last 7 days average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAttendance?.records.slice(0, 5).map((record: { id: string; employeeName: string; inTime: string | null; totalHours: number | null; lateMinutes: number }) => (
                <div key={record.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{record.employeeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.inTime ? new Date(record.inTime).toLocaleTimeString() : 'Not checked in'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '-'}
                    </p>
                    {record.lateMinutes > 0 && (
                      <p className="text-xs text-red-600">
                        {record.lateMinutes}m late
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {(!recentAttendance?.records || recentAttendance.records.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent attendance records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
