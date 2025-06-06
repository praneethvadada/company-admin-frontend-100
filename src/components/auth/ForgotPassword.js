import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    console.log('📧 ForgotPassword: Sending OTP request for:', email);

    const result = await forgotPassword(email);
    
    if (result.success) {
      console.log('✅ ForgotPassword: OTP sent successfully');
      toast.success('OTP sent to your email! Please check your inbox.');
      
      // Navigate to reset password page with token
      navigate('/reset-password', { 
        state: { 
          token: result.data.token,
          email: email,
          expiresIn: result.data.expiresIn
        }
      });
    } else {
      console.log('❌ ForgotPassword: Failed:', result.message);
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your email address and we'll send you a 6-digit OTP to reset your password</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Sending OTP...
              </>
            ) : (
              <>
                <FiSend />
                Send OTP
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password? 
            <Link to="/login" className="auth-link">
              <FiArrowLeft />
              Back to Login
            </Link>
          </p>
          <p>
            Don't have an account? 
            <Link to="/signup" className="auth-link"> Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { useAuth } from '../../context/AuthContext';
// import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [emailSent, setEmailSent] = useState(false);
  
//   const { forgotPassword } = useAuth();

//   const handleChange = (e) => {
//     setEmail(e.target.value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!email.trim()) {
//       toast.error('Please enter your email address');
//       return;
//     }

//     // Basic email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       toast.error('Please enter a valid email address');
//       return;
//     }

//     setLoading(true);
//     console.log('📧 ForgotPassword: Sending reset request for:', email);

//     const result = await forgotPassword(email);
    
//     if (result.success) {
//       console.log('✅ ForgotPassword: Reset email sent successfully');
//       toast.success('Password reset email sent! Please check your inbox.');
//       setEmailSent(true);
//     } else {
//       console.log('❌ ForgotPassword: Failed:', result.message);
//       toast.error(result.message);
//     }
    
//     setLoading(false);
//   };

//   if (emailSent) {
//     return (
//       <div className="auth-container">
//         <div className="auth-card">
//           <div className="auth-header">
//             <div className="success-icon">
//               <FiMail />
//             </div>
//             <h1>Check Your Email</h1>
//             <p>We've sent a password reset link to <strong>{email}</strong></p>
//           </div>
          
//           <div className="email-sent-content">
//             <div className="instructions">
//               <h3>What's next?</h3>
//               <ol>
//                 <li>Check your email inbox</li>
//                 <li>Click the password reset link</li>
//                 <li>Create a new password</li>
//                 <li>Sign in with your new password</li>
//               </ol>
//             </div>
            
//             <div className="help-text">
//               <p>Didn't receive the email? Check your spam folder or contact support.</p>
//             </div>
//           </div>

//           <div className="auth-footer">
//             <Link to="/login" className="auth-link">
//               <FiArrowLeft />
//               Back to Login
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <div className="auth-header">
//           <h1>Forgot Password</h1>
//           <p>Enter your email address and we'll send you a link to reset your password</p>
//         </div>
        
//         <form onSubmit={handleSubmit} className="auth-form">
//           <div className="form-group">
//             <label htmlFor="email">Email Address</label>
//             <div className="input-wrapper">
//               <FiMail className="input-icon" />
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={email}
//                 onChange={handleChange}
//                 placeholder="Enter your email address"
//                 required
//               />
//             </div>
//           </div>

//           <button 
//             type="submit" 
//             className="auth-button" 
//             disabled={loading}
//           >
//             {loading ? (
//               <>
//                 <div className="button-spinner"></div>
//                 Sending...
//               </>
//             ) : (
//               <>
//                 <FiSend />
//                 Send Reset Link
//               </>
//             )}
//           </button>
//         </form>

//         <div className="auth-footer">
//           <p>
//             Remember your password? 
//             <Link to="/login" className="auth-link"> Sign in</Link>
//           </p>
//           <p>
//             Don't have an account? 
//             <Link to="/signup" className="auth-link"> Sign up</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;
