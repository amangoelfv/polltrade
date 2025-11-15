import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Login.module.css';

type LoginStep = 'mobile' | 'otp' | 'profile';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { returnUrl } = router.query;
  const [step, setStep] = useState<LoginStep>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [developmentOtp, setDevelopmentOtp] = useState('');

  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const formatMobileNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 10);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMobileNumber(e.target.value);
    setMobileNumber(formatted);
    setError('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      // For development, store the OTP
      if (data.otp) {
        setDevelopmentOtp(data.otp);
      }

      setStep('otp');
      setResendCountdown(30);
      
      // Focus first OTP input
      setTimeout(() => {
        otpInputRefs[0].current?.focus();
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Move to next input
    if (value && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newOtp = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
    setOtp(newOtp);
    
    if (pastedData.length === 4) {
      otpInputRefs[3].current?.focus();
    } else if (pastedData.length > 0) {
      otpInputRefs[Math.min(pastedData.length, 3)].current?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mobileNumber, 
          otp: otpValue 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      // Check if user needs to complete profile
      if (data.needsProfile && data.tempToken) {
        setTempToken(data.tempToken);
        setStep('profile');
      } else if (data.token && data.user) {
        // Existing user - login directly
        login(data.user, data.token);
        const redirectUrl = typeof returnUrl === 'string' ? returnUrl : '/';
        router.push(redirectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          tempToken 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create profile');
      }

      // Login with new profile
      if (data.token && data.user) {
        login(data.user, data.token);
        const redirectUrl = typeof returnUrl === 'string' ? returnUrl : '/';
        router.push(redirectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;

    try {
      setLoading(true);
      setError('');
      setOtp(['', '', '', '']);

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      // For development, store the OTP
      if (data.otp) {
        setDevelopmentOtp(data.otp);
      }

      setResendCountdown(30);
      otpInputRefs[0].current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMobile = () => {
    setStep('mobile');
    setOtp(['', '', '', '']);
    setError('');
    setDevelopmentOtp('');
  };

  return (
    <>
      <Head>
        <title>Login - PollTrade</title>
        <meta name="description" content="Login to PollTrade" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.logoSection}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoText}>PollTrade</span>
            </Link>
          </div>

          {step === 'mobile' && (
            <div className={styles.formSection}>
              <h1 className={styles.title}>Welcome to PollTrade</h1>
              <p className={styles.subtitle}>Enter your mobile number to continue</p>

              <form onSubmit={handleSendOtp} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="mobile" className={styles.label}>
                    Mobile Number
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.prefix}>+91</span>
                    <input
                      id="mobile"
                      type="tel"
                      className={styles.input}
                      placeholder="Enter 10-digit number"
                      value={mobileNumber}
                      onChange={handleMobileChange}
                      maxLength={10}
                      autoComplete="tel"
                      autoFocus
                    />
                  </div>
                  <p className={styles.helperText}>
                    We'll send you a 4-digit OTP for verification
                  </p>
                </div>

                {error && (
                  <div className={styles.error}>
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loading || mobileNumber.length !== 10}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>

              <p className={styles.terms}>
                By continuing, you agree to our{' '}
                <Link href="/terms" className={styles.link}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
              </p>
            </div>
          )}

          {step === 'otp' && (
            <div className={styles.formSection}>
              <h1 className={styles.title}>Verify OTP</h1>
              <p className={styles.subtitle}>
                Enter the 4-digit code sent to <strong>+91 {mobileNumber}</strong>
              </p>

              <form onSubmit={handleVerifyOtp} className={styles.form}>
                <div className={styles.otpInputGroup}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpInputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      className={styles.otpInput}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      maxLength={1}
                      autoComplete="off"
                    />
                  ))}
                </div>

                {developmentOtp && (
                  <div className={styles.devOtp}>
                    <strong>Development OTP</strong>
                    {developmentOtp}
                  </div>
                )}

                {error && (
                  <div className={styles.error}>
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loading || otp.some(d => !d)}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className={styles.resendSection}>
                  {resendCountdown > 0 ? (
                    <p className={styles.resendText}>
                      Didn't receive the code? Resend in {resendCountdown}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className={styles.resendButton}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleBackToMobile}
                  className={styles.backButton}
                >
                  ← Change Mobile Number
                </button>
              </form>
            </div>
          )}

          {step === 'profile' && (
            <div className={styles.formSection}>
              <h1 className={styles.title}>Complete Your Profile</h1>
              <p className={styles.subtitle}>Please enter your name to continue</p>

              <form onSubmit={handleCompleteProfile} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={styles.inputField}
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    autoComplete="name"
                    autoFocus
                  />
                  <p className={styles.helperText}>
                    This will be displayed on your profile
                  </p>
                </div>

                {error && (
                  <div className={styles.error}>
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loading || !name.trim()}
                >
                  {loading ? 'Creating Profile...' : 'Complete Profile'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
