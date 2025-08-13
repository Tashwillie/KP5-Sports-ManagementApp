"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      // TODO: Implement password reset API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setSubmitted(true);
      toast.success("Password reset email sent successfully!");
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to send password reset email. Please try again.");
      toast.error("Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-white">
        {/* Header */}
        <div className="d-flex justify-content-center align-items-center p-4">
          <Link href="/" className="d-flex align-items-center text-decoration-none">
            <img
              src="/images/logo.png"
              alt="KP5 Academy Logo"
              width={120}
              height={45}
              style={{maxWidth: '120px', height: 'auto'}}
            />
          </Link>
        </div>

        {/* Success Content */}
        <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
          <div className="text-center" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="mb-4">
              <CheckCircle size={64} className="text-success mb-3" />
              <h2 className="h4 fw-bold text-dark mb-3">
                Check Your Email
              </h2>
              <p className="text-muted">
                We've sent a password reset link to:
              </p>
              <p className="fw-medium text-dark mb-4">{email}</p>
            </div>

            <div className="alert alert-info text-start">
              <h6 className="fw-bold mb-2">What happens next?</h6>
              <ol className="mb-0 small">
                <li>Check your email for a password reset link</li>
                <li>Click the link to reset your password</li>
                <li>Create a new password for your account</li>
                <li>Sign in with your new password</li>
              </ol>
            </div>

            <div className="mt-4">
              <p className="text-muted small mb-3">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn btn-outline-primary me-2"
              >
                Try Again
              </button>
              <Link href="/auth/signin" className="btn btn-primary">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center p-4 text-muted small">
          <div className="d-flex align-items-center">
            <img
              src="/images/logo.png"
              alt="KP5 Academy Logo"
              width={60}
              height={25}
              className="me-2"
              style={{maxWidth: '60px', height: 'auto'}}
            />
            <span>KP5 Academy © 2024. All rights reserved.</span>
          </div>
          
          <div className="d-flex gap-3">
            <Link href="#" className="text-muted text-decoration-none">Legal notice</Link>
            <Link href="#" className="text-muted text-decoration-none">Cookies policy</Link>
            <Link href="#" className="text-muted text-decoration-none">Privacy policy</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-white">
      {/* Header */}
      <div className="d-flex justify-content-center align-items-center p-4">
        <Link href="/" className="d-flex align-items-center text-decoration-none">
          <img
            src="/images/logo.png"
            alt="KP5 Academy Logo"
            width={120}
            height={45}
            style={{maxWidth: '120px', height: 'auto'}}
          />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div className="text-center" style={{ maxWidth: '400px', width: '100%' }}>
          {/* Welcome Section */}
          <div className="mb-5">
            <div className="mb-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto text-white mb-3"
                   style={{ width: '80px', height: '80px', backgroundColor: '#4169E1' }}>
                <Mail size={40} />
              </div>
            </div>
            <h1 className="display-6 fw-bold text-dark mb-3">
              Forgot Password?
            </h1>
            <p className="text-muted fs-6">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}

          {/* Password Reset Form */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="form-control form-control-lg border-light"
                style={{ 
                  height: '56px', 
                  backgroundColor: '#f8f9fa',
                  fontSize: '1.1rem',
                  borderRadius: '8px'
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn w-100 fw-semibold mb-4 text-white"
              style={{ 
                height: '56px', 
                background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Back to Sign In */}
          <div className="text-center mb-4">
            <Link 
              href="/auth/signin" 
              className="text-decoration-none text-primary fw-medium"
            >
              ← Back to Sign In
            </Link>
          </div>

          {/* Help Text */}
          <div className="alert alert-light border-0">
            <small className="text-muted">
              <strong>Remember your password?</strong> You can always{" "}
              <Link href="/auth/signin" className="text-decoration-none text-primary">
                sign in here
              </Link>
            </small>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="d-flex justify-content-between align-items-center p-4 text-muted small">
        <div className="d-flex align-items-center">
          <img
            src="/images/logo.png"
            alt="KP5 Academy Logo"
            width={60}
            height={25}
            className="me-2"
            style={{maxWidth: '60px', height: 'auto'}}
          />
          <span>KP5 Academy © 2024. All rights reserved.</span>
        </div>
        
        <div className="d-flex gap-3">
          <Link href="#" className="text-muted text-decoration-none">Legal notice</Link>
          <Link href="#" className="text-muted text-decoration-none">Cookies policy</Link>
          <Link href="#" className="text-muted text-decoration-none">Privacy policy</Link>
        </div>
      </div>
    </div>
  );
}
