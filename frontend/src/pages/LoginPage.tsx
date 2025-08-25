import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner'; 

import Enhanced3DCharacter from '../components/Enhanced3DCharacter';
import { Building2, Eye, EyeOff, Loader2, Mail, Lock, Shield, Check, Users, BarChart3, Cloud, Zap } from 'lucide-react';

import backend from '../backend';
import type { auth } from '../../encore-client';
type LoginRequest = auth.LoginRequest;

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

        toast.success(`Welcome back, ${(response.user as { firstName: string }).firstName}!`);
        navigate('/');
      } else {
        toast.error((response as { error?: string }).error || 'Invalid credentials');
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

  const handleDemoLogin = async () => {
    try {
      // Set the demo credentials
      const demoEmail = 'admin@company.com';
      const demoPassword = 'admin123';
      
      setEmail(demoEmail);
      setPassword(demoPassword);
      
      // Show loading state
      toast.loading('Logging in with demo credentials...');
      
      // Attempt login with demo credentials
      const response = await backend.auth.login({ email: demoEmail, password: demoPassword });
      
      if (response && typeof response === 'object' && 'success' in response && response.success && 'user' in response) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userProfile', JSON.stringify(response.user));
        localStorage.setItem('authToken', 'token' in response && typeof response.token === 'string' ? response.token : '');
        
        toast.dismiss();
        toast.success(`Welcome back, ${(response.user as { firstName: string }).firstName}!`);
        navigate('/');
      } else {
        toast.dismiss();
        toast.error((response as { error?: string }).error || 'Demo login failed. Please check your backend connection.');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Demo login error:', error);
      toast.error('Demo login failed. Please ensure the backend server is running.');
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex flex-col relative overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.6);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.8);
        }
      `}</style>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500/20 rounded-full filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-40 right-40 w-60 h-60 bg-pink-500/20 rounded-full filter blur-xl opacity-50 animate-blob animation-delay-6000"></div>
      </div>

      {/* Top Section - Welcome Content (Centered) */}
      <div className="flex-1 flex flex-col items-center justify-center pt-16 pb-8 relative z-10 min-h-screen">
        <div className="text-center max-w-4xl px-8 animate-fade-in-up">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-purple-400">Welcome to</span>
            <br />
            <span className="text-purple-200 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
              AttendanceHub
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8 max-w-3xl mx-auto">
            Experience the future of workforce management with our intelligent attendance tracking system powered by cutting-edge technology.
          </p>
          
          {/* Feature highlights with animated icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-3 text-green-400 animate-fade-in-up animation-delay-300 group">
              <div className="p-4 bg-green-500/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 animate-pulse" />
              </div>
              <span className="text-lg font-medium">Real-time Updates</span>
            </div>
            <div className="flex flex-col items-center space-y-3 text-blue-400 animate-fade-in-up animation-delay-500 group">
              <div className="p-4 bg-blue-500/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 animate-pulse" />
              </div>
              <span className="text-lg font-medium">Smart Analytics</span>
            </div>
            <div className="flex flex-col items-center space-y-3 text-purple-400 animate-fade-in-up animation-delay-700 group">
              <div className="p-4 bg-purple-500/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Cloud className="h-8 w-8 animate-pulse" />
              </div>
              <span className="text-lg font-medium">Cloud Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Login Form */}
      <div className="flex items-center justify-center p-8 relative z-10 min-h-screen">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-gray-900/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Building2 className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Sign in to your account
            </CardTitle>
            <p className="text-gray-300">
              Enter your credentials to access the dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">
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
                    className="h-11 pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    disabled={loginMutation.isPending}
                    autoComplete="email"
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-white">
                    Password
                  </Label>
                  <a href="#" className="text-xs text-blue-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="•••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    disabled={loginMutation.isPending}
                    autoComplete="current-password"
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-10 hover:bg-transparent text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loginMutation.isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200"
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
                  className="w-full h-11 border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500 transition-all duration-200"
                  onClick={handleDemoLogin}
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Demo Login...
                    </>
                  ) : (
                    'Quick Demo Login'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="text-sm border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-purple-400" />
                  <p className="font-medium text-white">Demo Credentials</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-700 rounded p-2 text-left">
                    <p className="text-xs text-gray-400 mb-1">Email</p>
                    <p className="font-mono text-xs text-white">admin@company.com</p>
                  </div>
                  <div className="bg-gray-700 rounded p-2 text-left">
                    <p className="text-xs text-gray-400 mb-1">Password</p>
                    <p className="font-mono text-xs text-white">admin123</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-green-400">
                  <Check className="h-3 w-3" />
                  <p>Fields are pre-filled for convenience</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating animated characters */}
      <div className="absolute top-20 left-10 animate-float-slow pointer-events-none">
        <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Users className="h-8 w-8 text-blue-300" />
        </div>
      </div>
      
      <div className="absolute top-40 right-20 animate-float-medium pointer-events-none">
        <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center backdrop-blur-sm">
          <BarChart3 className="h-6 w-6 text-purple-300" />
        </div>
      </div>
      
      <div className="absolute bottom-40 left-20 animate-float-fast pointer-events-none">
        <div className="w-14 h-14 bg-green-500/30 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Zap className="h-7 w-7 text-green-300" />
        </div>
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
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-left {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-medium {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-5deg);
          }
        }

        @keyframes float-fast {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(8deg);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-fade-in-left {
          animation: fade-in-left 0.8s ease-out forwards;
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 5s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .animation-delay-700 {
          animation-delay: 0.7s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
}
