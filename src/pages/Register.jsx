import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('register');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, verifyOTP, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Registration successful! Check your email for the OTP.');
      setStep('otp');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const user = await googleLogin(credentialResponse.credential);
      toast.success(`Welcome, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.status === 'pending') {
        navigate('/pending');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google Sign Up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return toast.error('OTP must be 6 digits');
    }

    setLoading(true);
    try {
      await verifyOTP(email, otp);
      toast.success('Email verified! You can now log in once approved by an admin.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div 
          className="logo"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1>NeighborGoods</h1>
          <p>Join your local sharing community</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'register' ? (
            <motion.form 
              key="register-form"
              onSubmit={handleSubmit} 
              id="register-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="form-group">
                <label htmlFor="register-name">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    id="register-name"
                    type="text"
                    className="premium-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-email">Email</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="register-email"
                    type="email"
                    className="premium-input"
                    placeholder="you@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-password">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="register-password"
                    type="password"
                    className="premium-input"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-confirm">Confirm Password</label>
                <div className="input-wrapper">
                  <CheckCircle size={18} className="input-icon" />
                  <input
                    id="register-confirm"
                    type="password"
                    className="premium-input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading}
                id="register-submit"
              >
                <UserPlus size={18} />
                {loading ? 'Creating Account...' : 'Create Account'}
              </motion.button>
              
              <div className="auth-separator">
                <span>OR</span>
              </div>
              
              <div className="google-btn-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Sign Up was unsuccessful')}
                  theme="filled_black"
                  shape="pill"
                  text="signup_with"
                  width="100%"
                />
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-form"
              onSubmit={handleVerifyOTP} 
              id="otp-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                We sent a 6-digit code to <strong>{email}</strong>. Please enter it below to verify your account.
              </p>
              <div className="form-group">
                <label htmlFor="register-otp">Verification Code</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="register-otp"
                    type="text"
                    className="premium-input"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem', paddingLeft: '1rem' }}
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading}
                id="verify-otp-submit"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </motion.button>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setStep('register')}
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  Back to Registration
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.div 
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Already have an account? <Link to="/login">Sign in</Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
