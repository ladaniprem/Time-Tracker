import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreateEmployeeRequest } from '../../../backend/attendance/create_employee';
import type { Employee } from '../../../backend/attendance/update_employee';

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEmployeeRequest | Partial<CreateEmployeeRequest> & { id?: number }) => void;
  isLoading?: boolean;
  employee?: Employee | null; // For edit mode
  mode?: 'create' | 'edit';
}

export default function EmployeeForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading,
  employee,
  mode = 'create'
}: EmployeeFormProps) {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<CreateEmployeeRequest>();

  // Reset form when employee data changes or form opens/closes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && employee) {
        // Pre-fill form with employee data for editing
        setValue('employeeId', employee.employeeId);
        setValue('name', employee.name);
        setValue('email', employee.email);
        setValue('phone', employee.phone || '');
        setValue('department', employee.department || '');
        setValue('position', employee.position || '');
      } else {
        // Reset form for creating new employee
        reset();
      }
    }
  }, [open, employee, mode, setValue, reset]);

  const handleFormSubmit = (data: CreateEmployeeRequest) => {
    if (mode === 'edit' && employee) {
      // For edit mode, include the employee ID
      onSubmit({ ...data, id: employee.id });
    } else {
      // For create mode, submit as is
      onSubmit(data);
    }
    reset();
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background text-foreground p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {mode === 'edit' ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <button
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="employeeId" className="text-sm font-medium">
              Employee ID
            </label>
            <Input
              id="employeeId"
              {...register('employeeId', { 
                required: 'Employee ID is required',
                minLength: {
                  value: 2,
                  message: 'Employee ID must be at least 2 characters'
                }
              })}
              placeholder="EMP001"
              disabled={mode === 'edit'} // Disable editing employee ID to avoid conflicts
            />
            {errors.employeeId && (
              <p className="text-sm text-red-600">{errors.employeeId.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              {...register('name', { 
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                }
              })}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="john@company.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone
            </label>
            <Input
              id="phone"
              {...register('phone', {
                pattern: {
                  value: /^[\+]?[1-9][\d]{0,15}$/,
                  message: 'Please enter a valid phone number'
                }
              })}
              placeholder="+1234567890"
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium">
              Department
            </label>
            <Input
              id="department"
              {...register('department', {
                minLength: {
                  value: 2,
                  message: 'Department must be at least 2 characters'
                }
              })}
              placeholder="Engineering"
            />
            {errors.department && (
              <p className="text-sm text-red-600">{errors.department.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="position" className="text-sm font-medium">
              Position
            </label>
            <Input
              id="position"
              {...register('position', {
                minLength: {
                  value: 2,
                  message: 'Position must be at least 2 characters'
                }
              })}
              placeholder="Software Developer"
            />
            {errors.position && (
              <p className="text-sm text-red-600">{errors.position.message}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (mode === 'edit' ? 'Updating...' : 'Adding...') 
                : (mode === 'edit' ? 'Update Employee' : 'Add Employee')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
