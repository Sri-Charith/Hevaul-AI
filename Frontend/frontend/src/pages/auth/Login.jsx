import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

// --- FIXED UI Components ---

const Button = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 focus:ring-blue-500",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 focus:ring-gray-200",
    outline: "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-200"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ icon: Icon, className, containerClassName = '', ...props }) => (
  <div className={`relative group ${containerClassName}`}>
    {Icon && (
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200 pointer-events-none">
        <Icon className="h-5 w-5" />
      </div>
    )}
    <input
      className={`w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl py-3.5 ${Icon ? 'pl-11' : 'pl-4'} pr-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 ${className}`}
      {...props}
    />
  </div>
);

const Card = ({ className, children }) => (
  <div className={`rounded-3xl bg-white shadow-2xl shadow-gray-200/50 border border-white/50 overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- Main Login Component ---
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const { login, googleLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    const result = await login(email, password);

    if (result.success) {
      setStatus({ type: 'success', message: 'Successfully logged in!' });
      setTimeout(() => {
        navigate('/');
      }, 500);
    } else {
      setStatus({ type: 'error', message: result.error || 'Invalid credentials' });
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setStatus({ type: '', message: '' });

      const result = await googleLogin(tokenResponse.access_token);

      if (result.success) {
        setStatus({ type: 'success', message: 'Successfully logged in with Google!' });
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        setStatus({ type: 'error', message: result.error || 'Google login failed' });
        setIsLoading(false);
      }
    },
    onError: () => {
      setStatus({ type: 'error', message: 'Google login failed' });
      setIsLoading(false);
    }
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans p-4">

      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2" />
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <Card className="grid md:grid-cols-2 min-h-[600px]">

          {/* LEFT SIDE - BRANDING */}
          <div className="hidden md:flex flex-col justify-between p-12 bg-blue-600 relative overflow-hidden">
            {/* Decorative Patterns */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700"></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">SecureSpace</span>
              </div>

              <h2 className="text-4xl font-bold text-white mb-6 leading-[1.15]">
                Turn your ideas<br />
                into <span className="text-blue-200">reality.</span>
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
                Join thousands of developers building the future with our secure and scalable platform.
              </p>
            </div>

            {/* Floating Stats Card */}
            <div className="relative z-10 mt-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-xs transform hover:scale-105 transition-transform duration-300 cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">System Operational</div>
                    <div className="text-blue-200 text-sm">All services online</div>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-xs text-blue-200/80 font-medium">
                &copy; 2024 SecureSpace Inc.
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="p-8 md:p-12 lg:p-16 bg-white flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
                <p className="text-gray-500">Please enter your details to sign in.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                  <Input
                    icon={Mail}
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-semibold text-gray-700">Password</label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <Input
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-12" // Extra padding for eye icon
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Status Messages */}
                {status.message && (
                  <div className={`p-4 rounded-xl flex items-start gap-3 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {status.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                    <span className="font-medium">{status.message}</span>
                  </div>
                )}

                <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider"><span className="bg-white px-4 text-gray-400 font-medium">Or continue with</span></div>
                </div>

                {/* Google Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-sm font-medium hover:bg-gray-50 bg-white border-gray-200 text-gray-700"
                  onClick={() => loginWithGoogle()}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Sign in with Google</span>
                </Button>

                <div className="text-center mt-8">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                      Sign up now
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}