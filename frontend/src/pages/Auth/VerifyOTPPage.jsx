import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { Loader2, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import logo from '../../property-master.png';

export default function VerifyOTPPage() {
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer]       = useState(60);
  const { verifyOTP, resendOTP, currentUser } = useAuth();
  const navigate                = useNavigate();
  const location                = useLocation();
  const email                   = location.state?.email;
  const inputRefs               = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/account'} replace />;
  }

  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pasteData.forEach((char, i) => {
      if (/^\d$/.test(char)) newOtp[i] = char;
    });
    setOtp(newOtp);
    const lastIdx = Math.min(pasteData.length, 5);
    inputRefs.current[lastIdx].focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return toast.error('Please enter the full 6-digit code');

    setLoading(true);
    try {
      const data = await verifyOTP(email, code);
      toast.success('Email verified successfully!');
      navigate(data.user?.role === 'admin' ? '/admin/dashboard' : '/account');
    } catch (err) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await resendOTP(email);
      toast.success('New code sent to your email');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page-bg">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="auth-grid" />

      <div className="auth-card max-w-md">
        <div className="flex justify-center mb-2">
          <Link to="/" className="hover:scale-105 transition-transform duration-300">
            <img src={logo} alt="Property Master" className="w-32 h-32 object-contain" />
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-500/10 text-brand-500 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="auth-title">Verify your email</h1>
          <p className="auth-sub px-4">
            We've sent a 6-digit code to <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.some(d => !d)}
            className="auth-btn w-full flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-4">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={timer > 0 || resending}
            className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
              timer > 0 ? 'text-gray-600 cursor-not-allowed' : 'text-brand-500 hover:text-brand-400'
            }`}
          >
            {resending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
          </button>
        </div>

        <Link
          to="/signup"
          className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to signup
        </Link>
      </div>
    </div>
  );
}
