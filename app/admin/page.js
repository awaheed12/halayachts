'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import { FaLock, FaEnvelope, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ImSpinner8 } from 'react-icons/im';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Login successful!');
        localStorage.setItem('adminLoggedIn', 'true');
        setTimeout(() => router.push('/admin/dashboard'), 1500);
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <div className="lg:w-1/2 relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-r to-black z-10" />
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: 'url("/images/admin.jpg")' }}
          />
          <div className="absolute inset-4 flex items-center justify-center z-20">
            <div className="text-center text-white px-8 flex flex-col gap-4 items-center justify-center">
              <h1 className="text-3xl md:text-6xl lg:text-6xl xl:text-[100px] font-light">
                Hala Yachts
              </h1>
              <div className="w-20 h-[1px] bg-white mx-auto" />
              <p className="text-base md:text-xl lg:text-2xl font-light tracking-wider">
                Luxury Yacht Administration
              </p>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-[#c8a75c] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShieldAlt className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl lg:text-2xl font-light tracking-wider">
                  Administrator Login
                </h2>
                <p className="text-base md:text-lg lg:text-xl sm:max-w-5xl mx-auto leading-relaxed tracking-wider font-light">
                  Access your management dashboard
                </p>
              </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-base md:text-lg leading-relaxed tracking-wider font-light mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 pl-11 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-[#c8a75c] transition duration-200 bg-gray-50 text-base md:text-lg leading-relaxed tracking-wider font-light"
                      placeholder="admin@halayachts.com"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <FaEnvelope className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-base md:text-lg leading-relaxed tracking-wider font-light mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 pl-11 pr-11 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-[#c8a75c] transition duration-200 bg-gray-50 text-base md:text-lg leading-relaxed tracking-wider font-light"
                      placeholder="Enter your password"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <FaLock className="h-4 w-4 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-lg p-1 transition-colors"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-4 w-4 text-gray-400" />
                      ) : (
                        <FaEye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center bg-[#c8a75c] text-base p-3 md:text-base font-medium rounded-lg cursor-pointer hover:bg-opacity-90 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c8a75c] disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <ImSpinner8 className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in to Dashboard'
                    )}
                  </button>
                </div>
              </form>
            </div>
            <div className="mt-8 text-center">
              <p className="text-base leading-relaxed tracking-wider font-light">
                © {new Date().getFullYear()} Hala Yachts. Developed By Crossway Consulting
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer 
        position="bottom-right"
        theme= "dark"
        autoClose={3000}
        hideProgressBar
        closeButton={false}
        toastClassName="rounded-xl"
      />
    </div>
  );
}