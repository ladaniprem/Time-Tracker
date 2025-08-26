import { useState } from 'react';
import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import backend, { updateEmployee as httpUpdateEmployee, deleteEmployee as httpDeleteEmployee } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EmployeeForm from '../components/EmployeeForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Search, Users, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import type { attendance } from '../../encore-client';
type Employee = attendance.Employee;

type CreateEmployeeRequest = attendance.CreateEmployeeRequest;

export default function EmployeesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
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
      // Optimistically add to first page of infinite query cache
      queryClient.setQueryData(['employees'], (oldData: any) => {
        if (!oldData || !Array.isArray(oldData.pages) || oldData.pages.length === 0) return oldData;
        const pages = [...oldData.pages];
        const first = { ...pages[0] };
        const list = Array.isArray(first.employees) ? first.employees : [];
        const exists = list.some((e: any) => (e as { id: number }).id === (created as { id: number }).id);
        first.employees = exists ? list : [created, ...list];
        // bump total on first page metadata if present
        if (typeof first.total === 'number' && !exists) {
          first.total = first.total + 1;
        }
        pages[0] = first;
        return { ...oldData, pages };
      });

      // Refetch to ensure server consistency
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsFormOpen(false);
      toast.success("Employee created", { description: "New employee has been added successfully." });
    },
    onError: (error) => {
      console.error('Failed to create employee:', error);
      toast.error("Error", { description: "Failed to create employee. Please try again.", duration: 5000 });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: (data: Partial<Employee> & { id: number }) =>
      // Use direct HTTP helper because the generated client lacks this endpoint
      httpUpdateEmployee({
        id: data.id,
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        position: data.position,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setEditingEmployee(null);
      toast.success('Employee updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update employee', { description: error?.message || 'Unknown error' });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: number) => httpDeleteEmployee({ id }),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['employees'] });
      await queryClient.cancelQueries({ queryKey: ['attendance'] });
      await queryClient.cancelQueries({ queryKey: ['attendance-report'] as any });
      const previous = queryClient.getQueryData(['employees']);

      queryClient.setQueryData(['employees'], (old: any) => {
        if (!old) return old;
        const pages = (old.pages || []).map((p: any) => ({
          ...p,
          employees: (p.employees || []).filter((e: any) => (e as { id: number }).id !== id),
        }));
        const firstTotal = (old.pages?.[0]?.total ?? 0) as number;
        if (pages.length && typeof firstTotal === 'number') {
          pages[0] = { ...pages[0], total: Math.max(0, firstTotal - 1) };
        }
        return { ...old, pages };
      });

      // Optimistically remove this employee's attendance from loaded caches
      queryClient.setQueryData(['attendance'], (old: any) => {
        if (!old) return old;
        const pages = (old.pages || []).map((p: any) => ({
          ...p,
          records: (p.records || []).filter((r: any) => (r as { employeeId: number }).employeeId !== id),
        }));
        return { ...old, pages };
      });
      queryClient.setQueryData(['attendance-report'] as any, (old: any) => {
        if (!old) return old;
        const pages = (old.pages || []).map((p: any) => ({
          ...p,
          records: (p.records || []).filter((r: any) => (r as { employeeId: number }).employeeId !== id),
        }));
        return { ...old, pages };
      });

      return { previous };
    },
    onError: (error: any, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['employees'], context.previous);
      }
      toast.error('Failed to delete employee', { description: error?.message || 'Unknown error' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-report'] as any });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setDeletingEmployee(null);
      toast.success('Employee deleted');
    },
    onSettled: () => {
      // Ensure any variant caches are updated
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  const handleDelete = (employee: Employee) => {
    setDeletingEmployee(employee);
  };

  const handleConfirmDelete = () => {
    if (deletingEmployee) {
      deleteEmployeeMutation.mutate(deletingEmployee.id);
    }
  };

  const handleFormSubmit = (data: any) => {
    if (editingEmployee) {
      // Update existing employee
      updateEmployeeMutation.mutate(data);
    } else {
      // Create new employee
      createEmployeeMutation.mutate(data);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const flatEmployees = (employeesPages?.pages || []).flatMap((p: any) => p?.employees || []);
  const filteredEmployees = flatEmployees
    .filter((employee) => (employee as any)?.id != null)
    .filter(employee =>
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
            <Card key={(employee as { id: string }).id} className="hover:shadow-md transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{(employee as { name: string }).name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{(employee as { employeeId: string }).employeeId}</Badge>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(employee as Employee)}
                        title="Edit employee"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(employee as Employee)}
                        title="Delete employee"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
                    <Badge variant="outline">{(employee as { position?: string }).position}</Badge>
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
        open={isFormOpen || !!editingEmployee}
        onOpenChange={handleFormClose}
        onSubmit={handleFormSubmit}
        isLoading={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
        employee={editingEmployee}
        mode={editingEmployee ? 'edit' : 'create'}
      />

      <ConfirmDialog
        open={!!deletingEmployee}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deletingEmployee?.name} (${deletingEmployee?.employeeId})? This action cannot be undone and will also remove all associated attendance records.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingEmployee(null)}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </div>
  );
}


