import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import backend from "../../../backend/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, Calendar, TrendingUp } from "lucide-react";

// Type for an individual attendance record
type AttendanceRecord = {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  date: string;
  inTime: string | null;
  outTime: string | null;
  totalHours?: number;
  lateMinutes: number;
};

// Type for calculated employee statistics
type EmployeeStat = {
  name: string;
  code: string;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  totalHours: number;
};

// Type for the calculated report metrics
type ReportMetrics = {
  totalRecords: number;
  presentRecords: number;
  lateRecords: number;
  avgHours: number;
  attendanceRate: number;
  punctualityRate: number;
  employeeStats: EmployeeStat[];
};

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["attendance-report", startDate, endDate],
    queryFn: (): Promise<{ records: AttendanceRecord[] }> =>
      backend.attendance.listAttendance({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    enabled: !!(startDate && endDate),
  });

  useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => backend.attendance.getAttendance({ type: 'dashboard' }),
  });

  // Calculate report metrics
  const reportMetrics = React.useMemo<ReportMetrics | null>(() => {
    if (!attendanceData?.records) return null;

    const records = attendanceData.records;
    const totalRecords = records.length;
    const presentRecords = records.filter((r) => r.inTime).length;
    const lateRecords = records.filter((r) => r.lateMinutes > 0).length;
    const totalHours = records.reduce(
      (sum, r) => sum + (r.totalHours || 0),
      0
    );
    const avgHours = totalRecords > 0 ? totalHours / totalRecords : 0;

    // Group by employee
    const employeeStatsMap = records.reduce<Record<number, EmployeeStat>>(
      (acc, record) => {
        const key = record.employeeId;
        if (!acc[key]) {
          acc[key] = {
            name: record.employeeName,
            code: record.employeeCode,
            totalDays: 0,
            presentDays: 0,
            lateDays: 0,
            totalHours: 0,
          };
        }
        acc[key].totalDays++;
        if (record.inTime) acc[key].presentDays++;
        if (record.lateMinutes > 0) acc[key].lateDays++;
        acc[key].totalHours += record.totalHours || 0;
        return acc;
      },
      {}
    );

    return {
      totalRecords,
      presentRecords,
      lateRecords,
      avgHours,
      attendanceRate:
        totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0,
      punctualityRate:
        presentRecords > 0
          ? ((presentRecords - lateRecords) / presentRecords) * 100
          : 0,
      employeeStats: Object.values(employeeStatsMap),
    };
  }, [attendanceData]);

  const handleExport = () => {
    if (!attendanceData?.records) return;

    const headers = [
      "Employee Name",
      "Employee Code",
      "Date",
      "Check In",
      "Check Out",
      "Total Hours",
      "Late Minutes",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...attendanceData.records.map((record) =>
        [
          record.employeeName,
          record.employeeCode,
          new Date(record.date).toLocaleDateString(),
          record.inTime ? new Date(record.inTime).toLocaleTimeString() : "",
          record.outTime ? new Date(record.outTime).toLocaleTimeString() : "",
          record.totalHours?.toFixed(2) || "0",
          record.lateMinutes.toString(),
          record.inTime
            ? record.lateMinutes > 0
              ? "Late"
              : "On Time"
            : "Absent",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Analytics & Insights
          </span>
        </div>
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Date Range Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button
              onClick={handleExport}
              disabled={!reportMetrics}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      {reportMetrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportMetrics.totalRecords}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Attendance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {reportMetrics.attendanceRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Punctuality Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {reportMetrics.punctualityRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Hours/Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportMetrics.avgHours.toFixed(1)}h
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Employee Performance Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportMetrics.employeeStats.map((employee, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {employee.code}
                      </p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Present</p>
                        <p className="font-medium">
                          {employee.presentDays}/{employee.totalDays}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Late Days</p>
                        <p className="font-medium text-red-600">
                          {employee.lateDays}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Total Hours</p>
                        <p className="font-medium">
                          {employee.totalHours.toFixed(1)}h
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Attendance</p>
                        <Badge
                          variant={
                            employee.presentDays / employee.totalDays >= 0.9
                              ? "default"
                              : "secondary"
                          }
                        >
                          {(
                            (employee.presentDays / employee.totalDays) *
                            100
                          ).toFixed(0)}
                          %
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!reportMetrics && !isLoading && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Select Date Range
          </h3>
          <p className="text-muted-foreground">
            Choose start and end dates to generate attendance reports
          </p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      )}
    </div>
  );
}


// import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import backend from '~backend/client';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { BarChart3, Download, Calendar, TrendingUp } from 'lucide-react';

// export default function ReportsPage() {
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');

//   const { data: attendanceData, isLoading } = useQuery({
//     queryKey: ['attendance-report', startDate, endDate],
//     queryFn: () => backend.attendance.listAttendance({
//       startDate: startDate || undefined,
//       endDate: endDate || undefined,
//     }),
//     enabled: !!(startDate && endDate),
//   });

//   const { data: stats } = useQuery({
//     queryKey: ['dashboard-stats'],
//     queryFn: () => backend.attendance.getDashboardStats(),
//   });

//   // Calculate report metrics
//   const reportMetrics = React.useMemo(() => {
//     if (!attendanceData?.records) return null;

//     const records = attendanceData.records;
//     const totalRecords = records.length;
//     const presentRecords = records.filter((r: { inTime: string | null }) => r.inTime).length;
//     const lateRecords = records.filter((r: { lateMinutes: number }) => r.lateMinutes > 0).length;
//     const totalHours = records.reduce((sum: number, r: { totalHours?: number }) => sum + (r.totalHours || 0), 0);
//     const avgHours = totalRecords > 0 ? totalHours / totalRecords : 0;

//     // Group by employee
//     const employeeStats = records.reduce((acc: Record<number, {
//       name: string;
//       code: string;
//       totalDays: number;
//       presentDays: number;
//       lateDays: number;
//       totalHours: number;
//     }>, record: { 
//       employeeId: number;
//       employeeName: string;
//       employeeCode: string;
//       inTime: string | null;
//       lateMinutes: number;
//       totalHours?: number;
//     }) => {
//       const key = record.employeeId;
//       if (!acc[key]) {
//         acc[key] = {
//           name: record.employeeName,
//           code: record.employeeCode,
//           totalDays: 0,
//           presentDays: 0,
//           lateDays: 0,
//           totalHours: 0,
//         };
//       }
//       acc[key].totalDays++;
//       if (record.inTime) acc[key].presentDays++;
//       if (record.lateMinutes > 0) acc[key].lateDays++;
//       acc[key].totalHours += record.totalHours || 0;
//       return acc;
//     }, {} as Record<number, {
//       name: string;
//       code: string;
//       totalDays: number;
//       presentDays: number;
//       lateDays: number;
//       totalHours: number;
//     }>);

//     return {
//       totalRecords,
//       presentRecords,
//       lateRecords,
//       avgHours,
//       attendanceRate: totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0,
//       punctualityRate: presentRecords > 0 ? ((presentRecords - lateRecords) / presentRecords) * 100 : 0,
//       employeeStats: Object.values(employeeStats),
//     };
//   }, [attendanceData]);

//   const handleExport = () => {
//     if (!attendanceData?.records) return;
    
//     // Simple CSV export
//     const headers = ['Employee Name', 'Employee Code', 'Date', 'Check In', 'Check Out', 'Total Hours', 'Late Minutes', 'Status'];
//     const csvContent = [
//       headers.join(','),
//       ...attendanceData.records.map((record: {
//         employeeName: string;
//         employeeCode: string;
//         date: string;
//         inTime: string | null;
//         outTime: string | null;
//         totalHours?: number;
//         lateMinutes: number;
//       }) => [
//         record.employeeName,
//         record.employeeCode,
//         new Date(record.date).toLocaleDateString(),
//         record.inTime ? new Date(record.inTime).toLocaleTimeString() : '',
//         record.outTime ? new Date(record.outTime).toLocaleTimeString() : '',
//         record.totalHours?.toFixed(2) || '0',
//         record.lateMinutes.toString(),
//         record.inTime ? (record.lateMinutes > 0 ? 'Late' : 'On Time') : 'Absent'
//       ].join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `attendance-report-${startDate}-to-${endDate}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-foreground">Reports</h1>
//         <div className="flex items-center space-x-2">
//           <BarChart3 className="h-5 w-5 text-muted-foreground" />
//           <span className="text-sm text-muted-foreground">Analytics & Insights</span>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center space-x-2">
//             <Calendar className="h-5 w-5" />
//             <span>Date Range Selection</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-end space-x-4">
//             <div className="space-y-2">
//               <Label htmlFor="startDate">Start Date</Label>
//               <Input
//                 id="startDate"
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="endDate">End Date</Label>
//               <Input
//                 id="endDate"
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//               />
//             </div>
//             <Button 
//               onClick={handleExport}
//               disabled={!reportMetrics}
//               variant="outline"
//             >
//               <Download className="h-4 w-4 mr-2" />
//               Export CSV
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {reportMetrics && (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Total Records
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{reportMetrics.totalRecords}</div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Attendance Rate
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold text-green-600">
//                   {reportMetrics.attendanceRate.toFixed(1)}%
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Punctuality Rate
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold text-blue-600">
//                   {reportMetrics.punctualityRate.toFixed(1)}%
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Avg. Hours/Day
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {reportMetrics.avgHours.toFixed(1)}h
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <TrendingUp className="h-5 w-5" />
//                 <span>Employee Performance Summary</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {reportMetrics.employeeStats.map((employee: any, index: number) => (
//                   <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
//                     <div>
//                       <h3 className="font-semibold">{employee.name}</h3>
//                       <p className="text-sm text-muted-foreground">{employee.code}</p>
//                     </div>
//                     <div className="flex items-center space-x-6 text-sm">
//                       <div className="text-center">
//                         <p className="text-muted-foreground">Present</p>
//                         <p className="font-medium">{employee.presentDays}/{employee.totalDays}</p>
//                       </div>
//                       <div className="text-center">
//                         <p className="text-muted-foreground">Late Days</p>
//                         <p className="font-medium text-red-600">{employee.lateDays}</p>
//                       </div>
//                       <div className="text-center">
//                         <p className="text-muted-foreground">Total Hours</p>
//                         <p className="font-medium">{employee.totalHours.toFixed(1)}h</p>
//                       </div>
//                       <div className="text-center">
//                         <p className="text-muted-foreground">Attendance</p>
//                         <Badge variant={employee.presentDays / employee.totalDays >= 0.9 ? "default" : "secondary"}>
//                           {((employee.presentDays / employee.totalDays) * 100).toFixed(0)}%
//                         </Badge>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </>
//       )}

//       {!reportMetrics && !isLoading && (
//         <div className="text-center py-12">
//           <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-foreground mb-2">
//             Select Date Range
//           </h3>
//           <p className="text-muted-foreground">
//             Choose start and end dates to generate attendance reports
//           </p>
//         </div>
//       )}

//       {isLoading && (
//         <div className="space-y-4">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
