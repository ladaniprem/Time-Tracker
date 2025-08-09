import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import backend from '~backend/client';

interface AttendanceUpdate {
  type: 'checkin' | 'checkout' | 'update';
  employeeId: number;
  employeeName: string;
  timestamp: Date;
  data: {
    checkInTime?: string;
    checkOutTime?: string;
    status?: 'present' | 'absent' | 'late';
    notes?: string;
  };
}

export default function RealtimeUpdates() {
  const [updates, setUpdates] = useState<AttendanceUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let stream: ReadableStream<AttendanceUpdate> | null = null;
    let abortController: AbortController | null = null;

    const connectToStream = async () => {
      try {
        // Check if backend.realtime exists
        if (!backend.realtime) {
          console.error('Realtime service is not available');
          toast.error('Realtime updates unavailable', {
            description: 'The realtime service could not be connected',
          });
          return;
        }

        abortController = new AbortController();
        stream = await backend.realtime.attendanceUpdates(
          { userId: 'admin' },
          { signal: abortController.signal }
        );

        setIsConnected(true);

        toast.success('Real-time updates connected', {
          description: "You'll receive live attendance notifications",
        });

        for await (const update of stream as any) {
          setUpdates((prev) => [update, ...prev.slice(0, 9)]); // Keep last 10

          toast(
            `${update.employeeName} ${
              update.type === 'checkin' ? 'checked in' : 'checked out'
            }`,
            {
              description: `at ${new Date(update.timestamp).toLocaleTimeString()}`,
              icon: update.type === 'checkin' ? <CheckCircle /> : <XCircle />,
            }
          );
        }
      } catch (error) {
        console.error('Failed to connect to real-time updates:', error);
        setIsConnected(false);
        
        toast.error('Connection lost', {
          description: 'Attempting to reconnect to real-time updates...',
          icon: <AlertCircle />,
        });

        // Try to reconnect after 5s
        setTimeout(connectToStream, 5000);
      }
    };

    connectToStream();

    return () => {
      if (abortController) abortController.abort();
    };
  }, []);

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'checkin':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'checkout':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'checkin':
        return 'border-l-4 border-l-green-500 bg-card';
      case 'checkout':
        return 'border-l-4 border-l-red-500 bg-card';
      default:
        return 'border-l-4 border-l-blue-500 bg-card';
    }
  };

  if (updates.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto space-y-2 z-50">
      <Card className="shadow-lg border border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Live Updates
            </h3>
            <Badge variant={isConnected ? 'outline' : 'destructive'} className={isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {updates.map((update, index) => (
              <div
                key={index}
                className={`${getUpdateColor(update.type)} rounded-md shadow-sm animate-in slide-in-from-right duration-300`}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {getUpdateIcon(update.type)}
                      <span className="font-medium text-sm">{update.employeeName}</span>
                    </div>
                    <Badge variant="outline" className="text-xs font-medium">
                      {update.type === 'checkin' ? 'Checked In' : 'Checked Out'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
             ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}



// import  { useEffect, useState } from 'react';
// import { toast } from 'sonner'; 
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent } from '@/components/ui/card';
// import { Clock, CheckCircle, XCircle } from 'lucide-react';
// import backend from '~backend/client';

// interface AttendanceUpdate {
//   type: "checkin" | "checkout" | "update";
//   employeeId: number;
//   employeeName: string;
//   timestamp: Date;
//   data: {
//     checkInTime?: string;
//     checkOutTime?: string;
//     status?: 'present' | 'absent' | 'late';
//     notes?: string;
//   };
// }

// export default function RealtimeUpdates() {
//   const [updates, setUpdates] = useState<AttendanceUpdate[]>([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const { toast } = useToast();

//   useEffect(() => {
//     let stream: ReadableStream<AttendanceUpdate> | null = null;

//     const connectToStream = async () => {
//       try {
//         stream = await backend.realtime.attendanceUpdates({ userId: 'admin' });
//         setIsConnected(true);
        
//         toast({
//           title: "Real-time updates connected",
//           description: "You'll receive live attendance notifications",
//         });

//         for await (const update of stream) {
//           setUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
          
//           toast({
//             title: `${update.employeeName} ${update.type === 'checkin' ? 'checked in' : 'checked out'}`,
//             description: `at ${new Date(update.timestamp).toLocaleTimeString()}`,
//           });
//         }
//       } catch (error) {
//         console.error('Failed to connect to real-time updates:', error);
//         setIsConnected(false);
//       }
//     };

//     connectToStream();

//     return () => {
//       if (stream) {
//         stream.close();
//       }
//     };
//   }, [toast]);

//   const getUpdateIcon = (type: string) => {
//     switch (type) {
//       case 'checkin':
//         return <CheckCircle className="h-4 w-4 text-green-600" />;
//       case 'checkout':
//         return <XCircle className="h-4 w-4 text-red-600" />;
//       default:
//         return <Clock className="h-4 w-4 text-blue-600" />;
//     }
//   };

//   const getUpdateColor = (type: string) => {
//     switch (type) {
//       case 'checkin':
//         return 'bg-green-50 border-green-200';
//       case 'checkout':
//         return 'bg-red-50 border-red-200';
//       default:
//         return 'bg-blue-50 border-blue-200';
//     }
//   };

//   if (updates.length === 0) {
//     return null;
//   }

//   return (
//     <div className="fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto space-y-2 z-50">
//       <div className="flex items-center justify-between mb-2">
//         <h3 className="text-sm font-medium text-foreground">Live Updates</h3>
//         <Badge variant={isConnected ? "default" : "destructive"}>
//           {isConnected ? "Connected" : "Disconnected"}
//         </Badge>
//       </div>
      
//       {updates.map((update, index) => (
//         <Card key={index} className={`${getUpdateColor(update.type)} animate-in slide-in-from-right`}>
//           <CardContent className="p-3">
//             <div className="flex items-center space-x-2">
//               {getUpdateIcon(update.type)}
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-foreground truncate">
//                   {update.employeeName}
//                 </p>
//                 <p className="text-xs text-muted-foreground">
//                   {update.type === 'checkin' ? 'Checked in' : 'Checked out'} at{' '}
//                   {new Date(update.timestamp).toLocaleTimeString()}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }
