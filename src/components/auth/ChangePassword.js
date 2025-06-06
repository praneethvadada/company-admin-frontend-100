import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiEye, FiEyeOff, FiSave, FiArrowLeft, FiShield, FiMail } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [currentStep, setCurrentStep] = useState('password'); // 'password' or 'otp'
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [otpData, setOtpData] = useState({
    otp: '',
    otpToken: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpSentTo, setOtpSentTo] = useState('');
  
  const { changePassword, verifyPasswordChangeOTP, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('📝 ChangePassword: Field changed:', name);
    
    if (name === 'otp') {
      setOtpData({
        ...otpData,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

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

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters long';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'New passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtpForm = () => {
    const newErrors = {};

    if (!otpData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (otpData.otp.length < 4) {
      newErrors.otp = 'Please enter a valid OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 ChangePassword: Password form submitted');
    
    if (!validatePasswordForm()) {
      console.log('❌ ChangePassword: Password form validation failed');
      return;
    }

    setLoading(true);

    console.log('📦 ChangePassword: Sending password change request');

    const result = await changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    });
    
    if (result.success) {
      console.log('✅ ChangePassword: OTP sent successfully');
      console.log('✅ Received token:', result.data.token ? 'Present' : 'Missing');
      
      // Store the token for OTP verification
      setOtpData({
        ...otpData,
        otpToken: result.data.token || ''
      });
      
      setOtpSentTo(result.data.sentTo || user?.email || 'your registered email');
      
      toast.success('OTP sent successfully! Please check your email.');
      setCurrentStep('otp');
      
    } else {
      console.log('❌ ChangePassword: Failed:', result.message);
      toast.error(result.message);
      
      if (result.message.toLowerCase().includes('current') || 
          result.message.toLowerCase().includes('incorrect') ||
          result.message.toLowerCase().includes('wrong')) {
        setErrors({ currentPassword: result.message });
      }
    }
    
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 ChangePassword: OTP form submitted');
    
    if (!validateOtpForm()) {
      console.log('❌ ChangePassword: OTP form validation failed');
      return;
    }

    // Double-check that we have the token before proceeding
    if (!otpData.otpToken) {
      console.error('❌ ChangePassword: Missing OTP token');
      toast.error('Session expired. Please start over.');
      setCurrentStep('password');
      return;
    }

    setLoading(true);

    console.log('📦 ChangePassword: Verifying OTP with data:', {
      hasOtp: !!otpData.otp,
      hasToken: !!otpData.otpToken,
      tokenPreview: otpData.otpToken ? otpData.otpToken.substring(0, 20) + '...' : 'None'
    });

    const result = await verifyPasswordChangeOTP({
      otp: otpData.otp,
      token: otpData.otpToken,
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
    
    if (result.success) {
      console.log('✅ ChangePassword: Password changed successfully');
      toast.success('Password changed successfully!');
      
      // Clear forms
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setOtpData({
        otp: '',
        otpToken: ''
      });
      
      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } else {
      console.log('❌ ChangePassword: OTP verification failed:', result.message);
      toast.error(result.message);
      setErrors({ otp: result.message });
    }
    
    setLoading(false);
  };

  const handleResendOtp = async () => {
    console.log('🔄 ChangePassword: Resending OTP');
    setLoading(true);

    const result = await changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    });
    
    if (result.success) {
      setOtpData({
        ...otpData,
        otpToken: result.data.token || ''
      });
      toast.success('OTP resent successfully!');
    } else {
      toast.error('Failed to resend OTP. Please try again.');
    }
    
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleBackToPassword = () => {
    setCurrentStep('password');
    setOtpData({ otp: '', otpToken: '' });
    setErrors({});
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <button 
            onClick={handleCancel}
            className="back-button"
          >
            <FiArrowLeft />
            Back to Dashboard
          </button>
          <div>
            <h1>Change Password</h1>
            <p>
              {currentStep === 'password' 
                ? `Update your account password for ${user?.email || 'your account'}`
                : 'Enter the OTP sent to your email to confirm password change'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="change-password-container">
        <div className="change-password-card">
          
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${currentStep === 'password' ? 'active' : 'completed'}`}>
              <div className="step-icon">
                <FiLock />
              </div>
              <span>Enter Passwords</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${currentStep === 'otp' ? 'active' : ''}`}>
              <div className="step-icon">
                <FiShield />
              </div>
              <span>Verify OTP</span>
            </div>
          </div>

          {/* Debug Info (remove in production) */}
          {process.env.NODE_ENV === 'development' && currentStep === 'otp' && (
            <div style={{
              background: '#f0f0f0',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              <strong>Debug Info:</strong><br />
              Token: {otpData.otpToken ? 'Present' : 'Missing'}<br />
              Token Preview: {otpData.otpToken ? otpData.otpToken.substring(0, 20) + '...' : 'None'}
            </div>
          )}

          {/* Password Form */}
          {currentStep === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="change-password-form">
              
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    required
                    className={errors.currentPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <span className="error-message">{errors.currentPassword}</span>
                )}
              </div>

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

              <div className="form-actions">
                <button 
                  type="button"
                  onClick={handleCancel}
                  className="secondary-button"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-button" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="button-spinner"></div>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <FiMail />
                      Send OTP
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* OTP Form */}
          {currentStep === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="change-password-form">
              
              <div className="otp-info">
                <div className="otp-icon">
                  <FiMail />
                </div>
                <h3>Check Your Email</h3>
                <p>We've sent a verification code to <strong>{otpSentTo}</strong></p>
              </div>

              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <div className="input-wrapper">
                  <FiShield className="input-icon" />
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={otpData.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit OTP"
                    required
                    maxLength="6"
                    className={`otp-input ${errors.otp ? 'error' : ''}`}
                  />
                </div>
                {errors.otp && (
                  <span className="error-message">{errors.otp}</span>
                )}
                <small className="field-hint">
                  Please check your email for the verification code
                </small>
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  onClick={handleBackToPassword}
                  className="secondary-button"
                  disabled={loading}
                >
                  <FiArrowLeft />
                  Back
                </button>
                <button 
                  type="submit" 
                  className="primary-button" 
                  disabled={loading || !otpData.otpToken}
                >
                  {loading ? (
                    <>
                      <div className="button-spinner"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Change Password
                    </>
                  )}
                </button>
              </div>

              <div className="otp-actions">
                <p>Didn't receive the code?</p>
                <button 
                  type="button"
                  onClick={handleResendOtp}
                  className="resend-button"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
