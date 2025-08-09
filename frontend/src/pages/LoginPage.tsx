import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner'; 

import Enhanced3DCharacter from '../components/Enhanced3DCharacter';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';

import backend from '~backend/client';
import type { LoginRequest } from '~backend/auth/profile';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => backend.auth.login(data),
    onSuccess: (response) => {
      if (response && typeof response === 'object' && 'success' in response && 'user' in response) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userProfile', JSON.stringify(response.user));
        localStorage.setItem('authToken', 'token' in response && typeof response.token === 'string' ? response.token : '');

        toast.success(`Welcome back, ${(response.user as { firstName: string }).firstName}!`); // ✅ success toast
        navigate('/');
      } else {
        toast.error((response as { error?: string }).error || 'Invalid credentials'); // ✅ error toast
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      toast.error('An error occurred during login. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleDemoLogin = () => {
    setEmail('admin@company.com');
    setPassword('admin123');
    loginMutation.mutate({
      email: 'admin@company.com',
      password: 'admin123',
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-accent/20 rounded-full filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl flex items-center justify-center gap-12 relative z-10">
        <div className="hidden lg:flex flex-col items-center space-y-8">
          <Enhanced3DCharacter />
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Welcome to <span className="text-primary">AttendanceHub</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Experience the future of workforce management with our intelligent attendance tracking system.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center p-3 rounded-lg bg-card border border-border">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mb-2"></div>
                <span className="text-sm font-medium">Real-time Updates</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-card border border-border">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mb-2"></div>
                <span className="text-sm font-medium">Smart Analytics</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-card border border-border">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse mb-2"></div>
                <span className="text-sm font-medium">Cloud Sync</span>
              </div>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md shadow-lg border border-border">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Sign in to your account
            </CardTitle>
            <p className="text-muted-foreground">
              Enter your credentials to access the dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 pl-10"
                    disabled={loginMutation.isPending}
                    autoComplete="email"
                  />
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10 pr-10"
                    disabled={loginMutation.isPending}
                    autoComplete="current-password"
                  />
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-10 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loginMutation.isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleDemoLogin}
                  disabled={loginMutation.isPending}
                >
                  Quick Demo Login
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <div className="text-sm border border-border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                  </svg>
                  <p className="font-medium text-foreground">Demo Credentials</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-background rounded p-2 text-left">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="font-mono text-xs">admin@company.com</p>
                  </div>
                  <div className="bg-background rounded p-2 text-left">
                    <p className="text-xs text-muted-foreground mb-1">Password</p>
                    <p className="font-mono text-xs">admin123</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  <p>Fields are pre-filled for convenience</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useMutation } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// import Enhanced3DCharacter from '../components/Enhanced3DCharacter';
// import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
// import backend from '~backend/client';
// import type { LoginRequest } from '~backend/auth/profile';

// export default function LoginPage() {
//   const [email, setEmail] = useState('admin@company.com');
//   const [password, setPassword] = useState('admin123');
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();
//     const { toast } = useToast();

//   const loginMutation = useMutation({
//     mutationFn: (data: LoginRequest) => backend.auth.login(data),
//     onSuccess: (response) => {
//       if (response.success && response.user) {
//         localStorage.setItem('isAuthenticated', 'true');
//         localStorage.setItem('userProfile', JSON.stringify(response.user));
//         localStorage.setItem('authToken', response.token || '');
        
//         toast({
//           title: "Login successful",
//           description: `Welcome back, ${response.user.firstName}!`,
//         });
//         navigate('/');
//       } else {
//         toast({
//           title: "Login failed",
//           description: response.error || "Invalid credentials",
//           variant: "destructive",
//         });
//       }
//     },
//     onError: (error) => {
//       console.error('Login error:', error);
//       toast({
//         title: "Login failed",
//         description: "An error occurred during login. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     loginMutation.mutate({ email, password });
//   };

//   const handleDemoLogin = () => {
//     setEmail('admin@company.com');
//     setPassword('admin123');
//     loginMutation.mutate({ email: 'admin@company.com', password: 'admin123' });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
//         <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
//       </div>

//       <div className="w-full max-w-6xl flex items-center justify-center space-x-12 relative z-10">
//         <div className="hidden lg:flex flex-col items-center space-y-8">
//           <Enhanced3DCharacter />
//           <div className="text-center max-w-md">
//             <h1 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//               Welcome to AttendanceHub
//             </h1>
//             <p className="text-lg text-muted-foreground leading-relaxed">
//               Experience the future of workforce management with our intelligent attendance tracking system powered by cutting-edge technology.
//             </p>
//             <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-muted-foreground">
//               <div className="flex items-center space-x-1">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <span>Real-time Updates</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
//                 <span>Smart Analytics</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
//                 <span>Cloud Sync</span>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 shadow-2xl border-0">
//           <CardHeader className="space-y-1 text-center">
//             <div className="flex items-center justify-center mb-6">
//               <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
//                 <Building2 className="h-8 w-8 text-white" />
//               </div>
//             </div>
//             <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
//               Sign in to your account
//             </CardTitle>
//             <p className="text-muted-foreground">
//               Enter your credentials to access the dashboard
//             </p>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-sm font-medium">
//                   Email Address
//                 </Label>
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   placeholder="admin@company.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   className="h-11"
//                   disabled={loginMutation.isPending}
//                   autoComplete="email"
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="password" className="text-sm font-medium">
//                   Password
//                 </Label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     className="h-11 pr-10"
//                     disabled={loginMutation.isPending}
//                     autoComplete="current-password"
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     className="absolute right-0 top-0 h-11 w-10 hover:bg-transparent"
//                     onClick={() => setShowPassword(!showPassword)}
//                     disabled={loginMutation.isPending}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4" />
//                     ) : (
//                       <Eye className="h-4 w-4" />
//                     )}
//                   </Button>
//                 </div>
//               </div>
              
//               <div className="space-y-3">
//                 <Button 
//                   type="submit" 
//                   className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
//                   disabled={loginMutation.isPending}
//                 >
//                   {loginMutation.isPending ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Signing in...
//                     </>
//                   ) : (
//                     'Sign in'
//                   )}
//                 </Button>

//                 <Button 
//                   type="button"
//                   variant="outline"
//                   className="w-full h-11"
//                   onClick={handleDemoLogin}
//                   disabled={loginMutation.isPending}
//                 >
//                   Quick Demo Login
//                 </Button>
//               </div>
//             </form>
            
//             <div className="mt-6 text-center">
//               <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
//                 <p className="font-medium mb-1">Demo Credentials:</p>
//                 <p className="font-mono text-xs">Email: admin@company.com</p>
//                 <p className="font-mono text-xs">Password: admin123</p>
//                 <p className="text-xs mt-2 text-green-600">
//                   ✓ Fields are pre-filled for convenience
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <style jsx>{`
//         @keyframes blob {
//           0% {
//             transform: translate(0px, 0px) scale(1);
//           }
//           33% {
//             transform: translate(30px, -50px) scale(1.1);
//           }
//           66% {
//             transform: translate(-20px, 20px) scale(0.9);
//           }
//           100% {
//             transform: translate(0px, 0px) scale(1);
//           }
//         }
//         .animate-blob {
//           animation: blob 7s infinite;
//         }
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//       `}</style>
//     </div>
//   );
// }
