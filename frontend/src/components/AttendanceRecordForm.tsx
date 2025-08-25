// import { useForm } from 'react-hook-form';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { toast } from 'sonner';
// import backend from '~backend/client';
// import type { RecordAttendanceRequest } from '~backend/attendance/record_attendance';
// import type { Employee } from '~backend/attendance/create_employee';

// interface AttendanceRecordFormProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSubmit: (data: RecordAttendanceRequest) => void;
//   employees: Employee[];
//   isLoading?: boolean;
// }

// export default function AttendanceRecordForm({ 
//   open, 
//   onOpenChange, 
//   onSubmit, 
//   employees,
//   isLoading 
// }: AttendanceRecordFormProps) {
//   const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<RecordAttendanceRequest>();
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const broadcastMutation = useMutation({
//     mutationFn: (update: any) => backend.realtime.broadcastAttendanceUpdate(update),
//     onError: (error) => {
//       console.error('Failed to broadcast update:', error);
//     },
//   });

//   const handleFormSubmit = (data: RecordAttendanceRequest) => {
//     const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
//     const employee = employees.find(emp => emp.id === Number(data.employeeId));
    
//     onSubmit({
//       ...data,
//       timestamp,
//       employeeId: Number(data.employeeId)
//     });

//     // Broadcast real-time update with correct type mapping
//     if (employee) {
//       const broadcastType = data.type === "in" ? "checkin" : "checkout";
//       broadcastMutation.mutate({
//         type: broadcastType,
//         employeeId: employee.id,
//         employeeName: employee.name,
//         timestamp,
//         data: { notes: data.notes }
//       });
//     }

//     reset();
//   };

//   const selectedEmployeeId = watch('employeeId');

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
//         <DialogHeader>
//           <DialogTitle>Record Attendance</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="employeeId">Employee</Label>
//             <Select onValueChange={(value) => setValue('employeeId', Number(value))}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select an employee" />
//               </SelectTrigger>
//               <SelectContent>
//                 {employees.map((employee) => (
//                   <SelectItem key={employee.id} value={employee.id.toString()}>
//                     {employee.name} ({employee.employeeId})
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {errors.employeeId && (
//               <p className="text-sm text-red-600">Employee is required</p>
//             )}
//           </div>
          
//           <div className="space-y-2">
//             <Label htmlFor="type">Type</Label>
//             <Select onValueChange={(value) => setValue('type', value as 'in' | 'out')}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="in">Check In</SelectItem>
//                 <SelectItem value="out">Check Out</SelectItem>
//               </SelectContent>
//             </Select>
//             {errors.type && (
//               <p className="text-sm text-red-600">Type is required</p>
//             )}
//           </div>
          
//           <div className="space-y-2">
//             <Label htmlFor="timestamp">Timestamp (optional)</Label>
//             <Input
//               id="timestamp"
//               type="datetime-local"
//               {...register('timestamp')}
//             />
//             <p className="text-xs text-muted-foreground">
//               Leave empty to use current time
//             </p>
//           </div>
          
//           <div className="space-y-2">
//             <Label htmlFor="notes">Notes (optional)</Label>
//             <Textarea
//               id="notes"
//               {...register('notes')}
//               placeholder="Any additional notes..."
//               rows={3}
//             />
//           </div>
          
//           <div className="flex justify-end space-x-2 pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isLoading || !selectedEmployeeId}>
//               {isLoading ? 'Recording...' : 'Record Attendance'}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
import { useForm } from "react-hook-form";
import { useMutation} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner"; 
import backend from "../backend";

import type { attendance } from "../../encore-client";
type RecordAttendanceRequest = attendance.RecordAttendanceRequest;
type Employee = attendance.Employee;

interface AttendanceRecordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecordAttendanceRequest) => void;
  employees: Employee[];
  isLoading?: boolean;
}

export default function AttendanceRecordForm({
  open,
  onOpenChange,
  onSubmit,
  employees,
  isLoading,
}: AttendanceRecordFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecordAttendanceRequest>();

// Remove unused queryClient since it's not being used anywhere in the component

  const broadcastMutation = useMutation({
    mutationFn: (update: {
      type: "checkin" | "checkout";
      employeeId: number;
      employeeName: string;
      timestamp: Date;
      data: { notes?: string };
    }) =>
      backend.realtime.broadcastAttendanceUpdate(update),
    onError: (error) => {
      console.error("Failed to broadcast update:", error);
    },
  });

  const handleFormSubmit = (data: RecordAttendanceRequest) => {
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    const employee = employees.find(
      (emp) => emp.id === Number(data.employeeId)
    );

    onSubmit({
      ...data,
      timestamp,
      employeeId: Number(data.employeeId),
    });

    if (employee) {
      const broadcastType = data.type === "in" ? "checkin" : "checkout";
      broadcastMutation.mutate({
        type: broadcastType,
        employeeId: employee.id,
        employeeName: employee.name,
        timestamp,
        data: { notes: data.notes },
      });
    }

    toast.success("Attendance recorded successfully"); 

    reset();
  };

  const selectedEmployeeId = watch('employeeId');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Record Attendance</DialogTitle>
          <DialogDescription>
            Fill in the details below to record employee attendance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee</Label>
            <Select
              onValueChange={(value) =>
                setValue("employeeId", Number(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem
                    key={employee.id}
                    value={employee.id.toString()}
                  >
                    {employee.name} ({employee.employeeId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && (
              <p className="text-sm text-red-600">Employee is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              onValueChange={(value) =>
                setValue("type", value as "in" | "out")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Check In</SelectItem>
                <SelectItem value="out">Check Out</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">Type is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timestamp">Timestamp (optional)</Label>
            <Input
              id="timestamp"
              type="datetime-local"
              {...register("timestamp")}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use current time
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedEmployeeId}
            >
              {isLoading ? "Recording..." : "Record Attendance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
