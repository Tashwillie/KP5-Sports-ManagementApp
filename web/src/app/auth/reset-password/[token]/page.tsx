"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { EyeSlash, Eye, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import enhancedApiClient from "@/lib/enhancedApiClient";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setValidating(false);
      setTokenValid(false);
      return;
    }

    const validateToken = async () => {
      try {
        // We can validate the token by making a request to the backend
        // For now, we'll assume it's valid if it exists and has the right format
        if (token.length === 64) { // Standard crypto token length
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate inputs
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(". "));
      setLoading(false);
      return;
    }

    try {
      // Call the backend reset password API via enhanced API client
      const response = await enhancedApiClient.resetPassword(token, password);

      if (response.success) {
        setSuccess(true);
        toast.success("Password reset successfully!");
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      } else {
        throw new Error(response.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      setError(error.message || "Failed to reset password. Please try again.");
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while validating token
  if (validating) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-white">
        <div className="container-fluid h-100">
          <div className="row h-100">
            <div className="col-12 d-flex align-items-center justify-content-center">
              <div className="text-center">
                <Loader2 className="animate-spin mb-3" size={48} />
                <h5>Validating reset token...</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-white">
        <div className="container-fluid h-100">
          <div className="row h-100">
            <div className="col-12 col-md-6 col-lg-4 mx-auto d-flex align-items-center">
              <div className="w-100">
                <div className="text-center mb-4">
                  <XCircle className="text-danger mb-3" size={64} />
                  <h2 className="h4 mb-0">Invalid Reset Link</h2>
                </div>

                <div className="card border-0 shadow">
                  <div className="card-body p-4">
                    <div className="text-center">
                      <p className="text-muted mb-4">
                        This password reset link is invalid or has expired. Please request a new one.
                      </p>
                      
                      <div className="d-grid gap-2">
                        <Link 
                          href="/auth/forgot-password" 
                          className="btn btn-primary"
                        >
                          Request New Reset Link
                        </Link>
                        <Link 
                          href="/auth/signin" 
                          className="btn btn-outline-secondary"
                        >
                          Back to Sign In
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-white">
        <div className="container-fluid h-100">
          <div className="row h-100">
            <div className="col-12 col-md-6 col-lg-4 mx-auto d-flex align-items-center">
              <div className="w-100">
                <div className="text-center mb-4">
                  <CheckCircle className="text-success mb-3" size={64} />
                  <h2 className="h4 mb-0">Password Reset Successfully</h2>
                </div>

                <div className="card border-0 shadow">
                  <div className="card-body p-4">
                    <div className="text-center">
                      <p className="text-muted mb-4">
                        Your password has been reset successfully. You will be redirected to the sign in page shortly.
                      </p>
                      
                      <div className="d-grid">
                        <Link 
                          href="/auth/signin" 
                          className="btn btn-primary"
                        >
                          Go to Sign In
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-vh-100 d-flex flex-column bg-white">
      <div className="container-fluid h-100">
        <div className="row h-100">
          <div className="col-12 col-md-6 col-lg-4 mx-auto d-flex align-items-center">
            <div className="w-100">
              <div className="text-center mb-4">
                <h2 className="h4 mb-0">Reset Your Password</h2>
                <p className="text-muted mt-2">Enter your new password below</p>
              </div>

              <div className="card border-0 shadow">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        New Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your new password"
                          disabled={loading}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="form-text">
                        Password must be at least 8 characters with uppercase, lowercase, and number.
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm New Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                          disabled={loading}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                        >
                          {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin me-2" size={18} />
                            Resetting Password...
                          </>
                        ) : (
                          "Reset Password"
                        )}
                      </button>
                      
                      <Link 
                        href="/auth/signin" 
                        className="btn btn-outline-secondary"
                      >
                        Back to Sign In
                      </Link>
                    </div>
                  </form>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-muted small">
                  Remember your password?{" "}
                  <Link href="/auth/signin" className="text-decoration-none">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
