import { useState } from 'react';
import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import backend from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EmployeeForm from '../components/EmployeeForm';
import { Plus, Search, Users, Mail, Phone } from 'lucide-react';
import type { attendance } from '../../encore-client';
type CreateEmployeeRequest = attendance.CreateEmployeeRequest;

export default function EmployeesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const {
    data: employeesPages,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['employees'],
    initialPageParam: { offset: 0, limit: 30 },
    queryFn: ({ pageParam }) =>
      backend.attendance.listEmployees({
        limit: (pageParam as { limit: number }).limit,
        offset: (pageParam as { offset: number }).offset,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((sum, p: any) => sum + (p?.employees?.length || 0), 0);
      const total = (lastPage as any)?.total || 0;
      if (totalLoaded >= total) return undefined;
      return { offset: totalLoaded, limit: 30 };
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (data: CreateEmployeeRequest) => backend.attendance.createEmployee(data),
    onSuccess: (created) => {
      // Optimistically update cache so new employee shows immediately
      queryClient.setQueryData(['employees'], (oldData: any) => {
        if (!oldData) {
          return { employees: [created], total: 1 };
        }
        const employees = Array.isArray(oldData.employees) ? oldData.employees : [];
        // Avoid duplicates by id
        const exists = employees.some((e: any) => (e as { id: number }).id === (created as { id: number }).id);
        const nextEmployees = exists ? employees : [created, ...employees];
        return { ...oldData, employees: nextEmployees, total: (oldData.total || 0) + (exists ? 0 : 1) };
      });

      // Still refetch to ensure consistency from server
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsFormOpen(false);
      toast.success("Employee created", {
        description: "New employee has been added successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to create employee:', error);
      toast.error("Error", {
        description: "Failed to create employee. Please try again.",
        duration: 5000,
      });
    },
  });

  const flatEmployees = (employeesPages?.pages || []).flatMap((p: any) => p?.employees || []);
  const filteredEmployees = flatEmployees.filter(employee =>
    ((employee as { name?: string }).name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((employee as { employeeId?: string }).employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((employee as { email?: string }).email || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Employees</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

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
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{(employeesPages?.pages?.[0] as any)?.total || 0} employees</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={(employee as { id: string }).id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{(employee as { name: string }).name}</CardTitle>
                  <Badge variant="secondary">{(employee as { employeeId: string }).employeeId}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{(employee as { email: string }).email}</span>
                </div>
                
                {(employee as { phone?: string }).phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{(employee as { phone: string }).phone}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {(employee as { department?: string }).department && (
                    <Badge variant="outline">{(employee as { department: string }).department}</Badge>
                  )}
                  {(employee as { position?: string }).position && (
                    <Badge variant="outline">{(employee as { position: string }).position}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {!isLoading && filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? 'No employees found' : 'No employees yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Get started by adding your first employee'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          )}
        </div>
      )}

      <EmployeeForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={(data) => createEmployeeMutation.mutate(data)}
        isLoading={createEmployeeMutation.isPending}
      />
    </div>
  );
}


