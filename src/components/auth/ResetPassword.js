import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FiShield, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiSave, FiClock, FiMail } from 'react-icons/fi';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get token and email from navigation state
  const { token, email, expiresIn } = location.state || {};

  useEffect(() => {
    // Redirect if no token
    if (!token) {
      toast.error('Invalid reset session. Please try again.');
      navigate('/forgot-password');
      return;
    }

    // Set initial timer (10 minutes = 600 seconds)
    const initialTime = typeof expiresIn === 'string' ? 600 : (expiresIn || 600);
    setTimeLeft(initialTime);
  }, [token, expiresIn, navigate]);

  // Timer for OTP expiration
  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            toast.warning('OTP has expired. Please request a new one.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('📝 ResetPassword: Field changed:', name);
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'OTP must contain only numbers';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 ResetPassword: Form submitted');
    
    if (!validateForm()) {
      console.log('❌ ResetPassword: Form validation failed');
      return;
    }

    // Check if OTP has expired
    if (timeLeft <= 0) {
      toast.error('OTP has expired. Please request a new one.');
      navigate('/forgot-password');
      return;
    }

    setLoading(true);

    console.log('📦 ResetPassword: Sending reset request');

    const result = await resetPassword({
      token: token,
      otp: formData.otp,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    });
    
    if (result.success) {
      console.log('✅ ResetPassword: Password reset successfully');
      toast.success(result.data.message || 'Password reset successfully!');
      
      // Clear form
      setFormData({
        otp: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } else {
      console.log('❌ ResetPassword: Failed:', result.message);
      toast.error(result.message);
      
      // Set specific field errors
      if (result.message.toLowerCase().includes('otp')) {
        setErrors({ otp: result.message });
      }
    }
    
    setLoading(false);
  };

  const handleBackToForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter the 6-digit OTP sent to your email and create a new password</p>
        </div>

        <div className="otp-info">
          <div className="otp-icon">
            <FiMail />
          </div>
          <h3>Check Your Email</h3>
          <p>We've sent a 6-digit OTP to <strong>{email}</strong></p>
          
          {timeLeft > 0 && (
            <div className="otp-timer">
              <FiClock />
              <span>OTP expires in: <strong>{formatTime(timeLeft)}</strong></span>
            </div>
          )}
          
          {timeLeft === 0 && (
            <div className="otp-expired">
              <span>OTP has expired. Please request a new one.</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* OTP Input */}
          <div className="form-group">
            <label htmlFor="otp">Enter 6-Digit OTP</label>
            <div className="input-wrapper">
              <FiShield className="input-icon" />
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="123456"
                required
                maxLength="6"
                pattern="[0-9]{6}"
                className={`otp-input ${errors.otp ? 'error' : ''}`}
                disabled={timeLeft === 0}
              />
            </div>
            {errors.otp && (
              <span className="error-message">{errors.otp}</span>
            )}
            <small className="field-hint">
              Please check your email for the 6-digit verification code
            </small>
          </div>

          {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                required
                minLength="6"
                className={errors.newPassword ? 'error' : ''}
                disabled={timeLeft === 0}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
            <small className="field-hint">
              Password must be at least 6 characters long
            </small>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                required
                minLength="6"
                className={errors.confirmPassword ? 'error' : ''}
                disabled={timeLeft === 0}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Form Actions */}
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading || timeLeft === 0}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Resetting Password...
              </>
            ) : (
              <>
                <FiSave />
                Reset Password
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <button 
              type="button"
              onClick={handleBackToForgotPassword}
              className="link-button"
            >
              <FiArrowLeft />
              Request New OTP
            </button>
          </p>
          <p>
            Remember your password? 
            <Link to="/login" className="auth-link"> Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
