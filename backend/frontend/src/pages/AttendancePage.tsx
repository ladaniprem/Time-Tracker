import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "../../../backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; 
import AttendanceRecordForm from "../components/AttendanceRecordForm";
import { Plus, Search, Clock, Calendar } from "lucide-react";
import type { RecordAttendanceRequest } from "../../../backend/attendance/record_attendance";



export default function AttendancePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [userAttendanceResult, setUserAttendanceResult] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Attendance data
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["attendance", dateFilter],
    queryFn: () =>
      backend.listAttendance({
        startDate: dateFilter || undefined,
        endDate: dateFilter || undefined,
      }),
  });

  // Employee data
  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => backend.attendance.listEmployees(),
  });

  // Record attendance mutation
  const recordAttendanceMutation = useMutation({
    mutationFn: (data: RecordAttendanceRequest) =>
      backend.recordAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsFormOpen(false);
      toast.success("Attendance has been recorded successfully.");
    },
    onError: (error) => {
      console.error("Failed to record attendance:", error);
      toast.error("Failed to record attendance. Please try again.");
    },
  });

  // Get user attendance mutation
  const getUserAttendanceMutation = useMutation({
    mutationFn: (data: { employeeId: string; date: string }) =>
      backend.attendance.getUserAttendance(data),
    onSuccess: (data) => {
      setUserAttendanceResult((data as { message: string }).message);
      if ((data as { success: boolean }).success) {
        toast.success("User attendance retrieved successfully.");
      } else {
        toast.error((data as { message: string }).message);
      }
    },
    onError: (error) => {
      console.error("Failed to get user attendance:", error);
      toast.error("Failed to retrieve user attendance. Please try again.");
      setUserAttendanceResult(`Error: ${error.message}`);
    },
  });

  // Filter records by search
  const filteredRecords =
    attendanceData?.records.filter(
      (record: { employeeName: string; employeeCode: string }) =>
        record.employeeName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const formatTime = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (record: { inTime: string | null; lateMinutes: number; outTime: string | null }) => {
    if (!record.inTime) {
      return <Badge variant="destructive">Absent</Badge>;
    }
    if (record.lateMinutes > 0) {
      return <Badge variant="secondary">Late</Badge>;
    }
    if (record.outTime) {
      return <Badge variant="default">Complete</Badge>;
    }
    return <Badge variant="outline">Present</Badge>;
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Attendance
        </Button>
      </div>

      {/* Get User Attendance Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Get My Attendance</h2>
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Your Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="flex-1"
            />
            <Input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-40"
            />
            <Button
              onClick={() =>
                getUserAttendanceMutation.mutate({ employeeId, date: attendanceDate })
              }
              disabled={!employeeId || !attendanceDate || getUserAttendanceMutation.isPending}
            >
              {getUserAttendanceMutation.isPending ? "Loading..." : "Get Attendance"}
            </Button>
          </div>
          {userAttendanceResult && (
            <div className="mt-4 p-4 bg-muted rounded-md whitespace-pre-wrap">
              {userAttendanceResult}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-10 w-40"
          />
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{attendanceData?.total || 0} records</span>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record: { 
            id: string;
            employeeName: string;
            employeeCode: string;
            date: string;
            inTime: string | null;
            outTime: string | null;
            totalHours: number | null;
            lateMinutes: number;
            earlyMinutes: number;
            notes?: string;
          }) => (
            <Card key={record.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {record.employeeName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {record.employeeCode} • {formatDate(record.date)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Check In</p>
                      <p className="font-medium">{formatTime(record.inTime)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Check Out</p>
                      <p className="font-medium">{formatTime(record.outTime)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Total Hours
                      </p>
                      <p className="font-medium">
                        {record.totalHours
                          ? `${record.totalHours.toFixed(1)}h`
                          : "-"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(record)}
                    </div>
                  </div>
                </div>

                {(record.lateMinutes > 0 ||
                  record.earlyMinutes > 0 ||
                  record.notes) && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center space-x-4 text-sm">
                      {record.lateMinutes > 0 && (
                        <span className="text-red-600">
                          Late: {record.lateMinutes}m
                        </span>
                      )}
                      {record.earlyMinutes > 0 && (
                        <span className="text-orange-600">
                          Early leave: {record.earlyMinutes}m
                        </span>
                      )}
                      {record.notes && (
                        <span className="text-muted-foreground">
                          Note: {record.notes}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No records found */}
      {!isLoading && filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm || dateFilter
              ? "No records found"
              : "No attendance records yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || dateFilter
              ? "Try adjusting your search or date filter"
              : "Start recording attendance for your employees"}
          </p>
          {!searchTerm && !dateFilter && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record Attendance
            </Button>
          )}
        </div>
      )}

      {/* Attendance form */}
      <AttendanceRecordForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={(data) => recordAttendanceMutation.mutate(data)}
        employees={employeesData?.employees || []}
        isLoading={recordAttendanceMutation.isPending}
      />
    </div>
  );
}