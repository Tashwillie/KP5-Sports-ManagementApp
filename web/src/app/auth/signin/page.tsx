"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocalAuth } from "@/hooks/useLocalApi";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { signIn } = useLocalAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(error.message || "Failed to sign in. Please check your credentials.");
      toast.error("Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    
    try {
      // TODO: Implement Google sign-in
      toast.info("Google sign-in coming soon!");
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google.");
      toast.error("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="display-6 fw-bold text-dark mb-3">
              Welcome!
            </h1>
            <p className="text-muted fs-6">
              Sign in to your account:
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
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

            <div className="mb-4">
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="form-control form-control-lg border-light pe-5"
                  style={{ 
                    height: '56px', 
                    backgroundColor: '#f8f9fa',
                    fontSize: '1.1rem',
                    borderRadius: '8px'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-2"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
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
                  Signing in...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mb-4">
            <Link 
              href="/auth/forgot-password" 
              className="text-decoration-none text-primary fw-medium"
            >
              Can't log in?
            </Link>
          </div>

          {/* Divider */}
          <div className="position-relative my-4">
            <div className="position-absolute top-50 start-0 end-0 border-top"></div>
            <div className="position-relative text-center">
              <span className="bg-white px-3 text-muted">OR</span>
            </div>
          </div>

          {/* Social Login Icons */}
          <div className="d-flex justify-content-center gap-3 mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn btn-outline-light d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid #e9ecef' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>

            <button
              type="button"
              className="btn btn-outline-light d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid #e9ecef' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            <button
              type="button"
              className="btn btn-outline-light d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid #e9ecef' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>

            <button
              type="button"
              className="btn btn-outline-light d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid #e9ecef' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#333">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
          </div>

          {/* Create Account Link */}
          <div className="text-center">
            <p className="text-muted mb-0">
              New on our platform?{" "}
              <Link 
                href="/auth/signup" 
                className="text-decoration-none text-primary fw-medium"
              >
                Create an account
              </Link>
            </p>
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