// import { Link, useLocation } from 'react-router-dom';
// import { cn } from '@/lib/utils';
// import { 
//   LayoutDashboard, 
//   Users, 
//   Clock, 
//   BarChart3, 
//   Settings,
//   Building2
// } from 'lucide-react';

// const navigation = [
//   { name: 'Dashboard', href: '/', icon: LayoutDashboard },
//   { name: 'Employees', href: '/employees', icon: Users },
//   { name: 'Attendance', href: '/attendance', icon: Clock },
//   { name: 'Reports', href: '/reports', icon: BarChart3 },
//   { name: 'Settings', href: '/settings', icon: Settings },
// ];

// export default function Sidebar() {
//   const location = useLocation();

//   return (
//     <div className="w-64 bg-slate-950 border-r border-slate-800 h-screen flex flex-col">
//       <div className="p-6 border-b border-border">
//         <div className="flex items-center space-x-2">
//           <div className="p-2 bg-primary/10 rounded-lg">
//             <Building2 className="h-6 w-6 text-primary" />
//           </div>
//           <div>
//         <h1 className="text-lg font-semibold text-foreground tracking-tight">Attendance   Hub
// </h1>
// <p className="text-sm text-muted-foreground">Workforce Management</p>

//           </div>
//         </div>
//       </div>
      
//       <div className="px-3 py-4">
//         <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">NAVIGATION</h2>
//         <nav className="space-y-1">
//           {navigation.map((item) => {
//             const isActive = location.pathname === item.href;
//             return (
//               <Link
//                 key={item.name}
//                 to={item.href}
//                 className={cn(
//                   "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
//                   isActive
//                     ? "bg-primary text-primary-foreground shadow-sm"
//                     : "text-muted-foreground hover:text-primary hover:bg-white"
//                 )}
//               >
//                 <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
//                 <span>{item.name}</span>
//               </Link>
//             );
//           })}
//         </nav>
//       </div>
      
//       <div className="mt-auto p-4 border-t border-border">
//         <div className="bg-muted/50 rounded-lg p-3">
//           <h3 className="text-sm font-medium mb-1">Need Help?</h3>
//           <p className="text-xs text-muted-foreground mb-2">Check our documentation for assistance</p>
//           <Link to="/settings" className="text-xs text-primary hover:underline">View Documentation</Link>
//         </div>
//       </div>
//     </div>
//   );
// }
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  BarChart3, 
  Settings,
  Building2
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Attendance', href: '/attendance', icon: Clock },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-background border-r border-border h-screen flex flex-col">
      {/* Logo & App Name */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-lg font-semibold text-white tracking-tight leading-tight">
              AttendanceHub
            </div>
            <p className="text-sm text-muted-foreground">Workforce Management</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="px-3 py-4">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
          NAVIGATION
        </h2>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 w-full",
                  isActive
                    ? "bg-muted text-white"
                    : "text-muted-foreground hover:bg-white hover:text-black"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive
                      ? "text-white"
                      : "text-muted-foreground group-hover:text-black"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      
      {/* Footer Help Section */}
      <div className="mt-auto p-4 border-t border-border">
        <div className="bg-muted rounded-lg p-3">
          <h3 className="text-sm font-medium text-white mb-1">Need Help?</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Check our documentation for assistance
          </p>
          <Link
            to="/settings"
            className="text-xs text-primary hover:underline"
          >
            View Documentation
          </Link>
        </div>
      </div>
    </div>
  )
}
