import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.status === 'pending') {
        navigate('/pending');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
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
      toast.error(error.response?.data?.message || 'Google Login failed');
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
          <p>Share more, own less</p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          id="login-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className="premium-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type="password"
                className="premium-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            id="login-submit"
          >
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
          
          <div className="auth-separator">
            <span>OR</span>
          </div>
          
          <div className="google-btn-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign In was unsuccessful')}
              theme="filled_black"
              shape="pill"
              text="continue_with"
              width="100%"
            />
          </div>
        </motion.form>

        <motion.div 
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Don't have an account? <Link to="/register">Create one</Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
