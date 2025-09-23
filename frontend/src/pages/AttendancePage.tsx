import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import backend, { BASE_URL } from "../backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; 
import AttendanceRecordForm from "../components/AttendanceRecordForm";
import { Plus, Search, Clock, Calendar } from "lucide-react";
import PageHeader from "../components/PageHeader";
import type { attendance } from "../../encore-client";
type RecordAttendanceRequest = attendance.RecordAttendanceRequest;



export default function AttendancePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(() => {
    // Restore last used date filter across refreshes
    const saved = localStorage.getItem("attendance.dateFilter");
    return saved || "";
  });
  const [employeeId, setEmployeeId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [userAttendanceResult, setUserAttendanceResult] = useState<string | null>(null);
  const [showMyRecent, setShowMyRecent] = useState(false);
  const queryClient = useQueryClient();

  // Attendance data
  const {
    data: attendancePages,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["attendance", dateFilter],
    initialPageParam: { offset: 0, limit: 20 },
    queryFn: ({ pageParam }) =>
      backend.attendance.listAttendance({
        startDate: dateFilter || undefined,
        endDate: dateFilter || undefined,
        limit: (pageParam as { limit: number }).limit,
        offset: (pageParam as { offset: number }).offset,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p: any) => sum + (p?.records?.length || 0), 0);
      const total = (lastPage as any)?.total || 0;
      if (loaded >= total) return undefined;
      return { offset: loaded, limit: 20 };
    },
  });

  const loadAll = async () => {
    while (true) {
      const canLoad = hasNextPage && !isFetchingNextPage;
      if (!canLoad) break;
      // eslint-disable-next-line no-await-in-loop
      await fetchNextPage();
    }
  };

  // Employee data
  const { data: employeesData } = useQuery({
    queryKey: ["employees", { limit: 1000, offset: 0 }],
    queryFn: () => backend.attendance.listEmployees({ limit: 1000, offset: 0 }),
  });

  // My recent attendance (last 3) for entered employeeId
  const { data: myRecentData, isFetching: isFetchingMyRecent } = useQuery({
    queryKey: ["my-recent-attendance", employeeId, showMyRecent],
    enabled: !!employeeId && showMyRecent,
    queryFn: () =>
      backend.attendance.listAttendance({
        employeeId: Number(employeeId),
        limit: 100,
        offset: 0,
      }),
  });

  // Realtime: refresh employee view when new attendance arrives for that employee
  useEffect(() => {
    if (!showMyRecent || !employeeId) return;
    const es = new EventSource(`${BASE_URL}/realtime/attendance?userId=ui`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as { employeeId?: number };
        if (data && typeof data.employeeId === 'number' && data.employeeId === Number(employeeId)) {
          queryClient.invalidateQueries({ queryKey: ["my-recent-attendance", employeeId, true] });
          queryClient.invalidateQueries({ queryKey: ["attendance-summary"] });
        }
      } catch {}
    };
    es.onerror = () => {
      es.close();
    };
    return () => {
      es.close();
    };
  }, [showMyRecent, employeeId, queryClient]);

  // Employees who have attendance, with totals
  const { data: attendanceSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["attendance-summary"],
    queryFn: () => (fetch(`${BASE_URL}/attendance/summary`).then(r => r.json())),
  });

  // Record attendance mutation
  const recordAttendanceMutation = useMutation({
    mutationFn: (data: RecordAttendanceRequest) =>
      backend.attendance.recordAttendance(data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["attendance", dateFilter] });
      const previous = queryClient.getQueryData(["attendance", dateFilter]);

      const flat = (attendancePages?.pages || []).flatMap((p: any) => p?.records || []);
      const employee = (employeesData?.employees || []).find(
        (e: any) => (e as { id: number }).id === Number(variables.employeeId)
      ) as any;
      const now = variables.timestamp ? new Date(variables.timestamp as any) : new Date();

      const optimisticRecord = {
        id: `temp-${Date.now()}`,
        employeeName: employee?.name || "",
        employeeCode: employee?.employeeId || "",
        employeeId: Number(variables.employeeId),
        date: now.toISOString(),
        inTime: variables.type === "in" ? now.toISOString() : flat.find(r => r.employeeId === Number(variables.employeeId))?.inTime || null,
        outTime: variables.type === "out" ? now.toISOString() : null,
        totalHours: null,
        lateMinutes: 0,
        earlyMinutes: 0,
        notes: variables.notes || "",
      } as any;

      // Prepend into first page
      queryClient.setQueryData(["attendance", dateFilter], (old: any) => {
        if (!old) return old;
        const pages = [...old.pages];
        if (!pages.length) return old;
        const first = { ...pages[0] };
        first.records = [optimisticRecord, ...(first.records || [])];
        pages[0] = first;
        return { ...old, pages };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["attendance", dateFilter], context.previous);
      }
      toast.error("Failed to record attendance. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] });
      if (employeeId) {
        queryClient.invalidateQueries({ queryKey: ["my-recent-attendance", employeeId, true] });
      }
      setIsFormOpen(false);
      toast.success("Attendance has been recorded successfully.");
    },
  });

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
  const flatRecords = (attendancePages?.pages || []).flatMap((p: any) => p?.records || []);
  const filteredRecords =
    flatRecords.filter(
      (record: { employeeName: string; employeeCode: string }) =>
        record.employeeName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Persist date filter so previously created data shows after refresh
  // Empty means show all recent records (no date constraint)
  if (typeof window !== 'undefined') {
    // Save only when it changes
    const current = localStorage.getItem("attendance.dateFilter");
    if (current !== dateFilter) {
      localStorage.setItem("attendance.dateFilter", dateFilter);
    }
  }

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
      <PageHeader
        title="Attendance"
        actions={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Attendance
          </Button>
        }
      />

      {/* Get User Attendance Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Get My Attendance</h2>
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Your Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && employeeId) {
                  setShowMyRecent(true);
                }
              }}
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
            <Button
              variant="secondary"
              onClick={() => setShowMyRecent(true)}
              disabled={!employeeId || isFetchingMyRecent}
            >
              {isFetchingMyRecent ? "Loading..." : "Search"}
            </Button>
          </div>
          {userAttendanceResult && (
            <div className="mt-4 p-4 bg-muted rounded-md whitespace-pre-wrap">
              {userAttendanceResult}
            </div>
          )}

          {showMyRecent && employeeId && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-foreground">Employee Attendance</h3>
                <span className="text-sm text-muted-foreground">
                  {(() => {
                    const total = (myRecentData as any)?.total || 0;
                    const shown = ((myRecentData as any)?.records || []).length;
                    return `Results: ${shown} of ${total}`;
                  })()}
                </span>
              </div>
              <div className="flex justify-end mb-2">
                <Button variant="outline" size="sm" onClick={() => { setShowMyRecent(false); setEmployeeId(""); }}>
                  Clear
                </Button>
              </div>
              <div className="space-y-3">
                {((myRecentData as any)?.records || []).map((record: any) => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">
                            {record.employeeName} <span className="text-muted-foreground">({record.employeeCode})</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {(() => {
                              const d = new Date(record.date);
                              const day = d.getDate();
                              const month = d.getMonth() + 1;
                              const year = d.getFullYear();
                              return `${day}/${month}/${year}`;
                            })()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">In</div>
                            <div className="font-medium">
                              {record.inTime ? (() => {
                                const t = new Date(record.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                return t.replace('AM','am').replace('PM','pm');
                              })() : '-'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Out</div>
                            <div className="font-medium">
                              {record.outTime ? (() => {
                                const t = new Date(record.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                return t.replace('AM','am').replace('PM','pm');
                              })() : '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {((myRecentData as any)?.records || []).length === 0 && (
                  <div className="text-sm text-muted-foreground">No recent records.</div>
                )}
              </div>
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
          <span>{(attendancePages?.pages?.[0] as any)?.total || 0} records</span>
        </div>
      </div>

      {/* Loading state (hidden when showing employee-specific results) */}
      {isLoading && !showMyRecent ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (!showMyRecent ? (
        <div className="space-y-4">
          {/* Employees with attendance */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Employees with Attendance</h2>
                <span className="text-sm text-muted-foreground">Total: {(attendanceSummary as any)?.total || 0}</span>
              </div>
              {isLoadingSummary ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {((attendanceSummary as any)?.summaries || []).map((s: any) => (
                    <div key={s.employeeId} className="flex items-center justify-between text-sm">
                      <div className="text-foreground">
                        {s.employeeName} <span className="text-muted-foreground">({s.employeeCode})</span>
                      </div>
                      <div className="text-muted-foreground">{s.total} records</div>
                    </div>
                  ))}
                  {((attendanceSummary as any)?.summaries || []).length === 0 && (
                    <div className="text-sm text-muted-foreground">No employees with attendance yet.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

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
      ) : null)}

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
          <Button onClick={loadAll} disabled={isFetchingNextPage} variant="secondary" className="ml-2">
            {isFetchingNextPage ? "Loading..." : "Load All"}
          </Button>
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
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