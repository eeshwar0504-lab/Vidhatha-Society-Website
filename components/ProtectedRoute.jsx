// components/ProtectedRoute.jsx
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 *
 * Wrap admin / protected pages with this component:
 * <ProtectedRoute requiredRoles={['superadmin', 'admin']}> ... </ProtectedRoute>
 *
 * Behavior:
 * - Waits for auth provider to finish loading (prevents flicker/false redirect)
 * - If not authenticated -> redirects to /login and appends ?next=<currentPath>
 * - Optional `requiredRoles` array—if provided, user must have roleKey or role match
 * - Avoids redirect loop if already on /login
 * - Shows accessible loading UI while auth is being determined
 */
export default function ProtectedRoute({ children, requiredRoles = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Role-check helper - attempts to read role key from several possible shapes
  const userRoleKey = React.useMemo(() => {
    if (!user) return null;
    // common shapes: user.roleKey, user.role (string), user.role.key (populated role object)
    if (user.roleKey) return user.roleKey;
    if (typeof user.role === "string") return user.role;
    if (user.role && typeof user.role === "object" && user.role.key) return user.role.key;
    return null;
  }, [user]);

  useEffect(() => {
    // Do nothing while auth provider is still loading
    if (loading) return;

    // If not authenticated, redirect to login (but avoid looping if already on /login)
    if (!user) {
      if (pathname !== "/login") {
        // preserve the attempted path so login can redirect back
        const next = encodeURIComponent(pathname || "/");
        router.replace(`/login?next=${next}`);
      }
      return;
    }

    // If authenticated and requiredRoles supplied, check permission
    if (requiredRoles && Array.isArray(requiredRoles) && requiredRoles.length > 0) {
      // If user role is missing or not included -> show "Access denied" (no redirect)
      const allowed = userRoleKey && requiredRoles.includes(userRoleKey);
      if (!allowed) {
        // We intentionally do not redirect away here (to avoid anti-patterns).
        // Pages can choose to show a specific "no-permission" UI when ProtectedRoute returns null.
        // But to make it easier, we redirect back to / (or customize as needed)
        // Here we redirect to / (home) to avoid leaving user on a blank page.
        router.replace("/");
      }
    }
  }, [loading, user, pathname, router, requiredRoles, userRoleKey]);

  // Render loading placeholder while checking auth
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div>
          <svg className="animate-spin h-6 w-6 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" />
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div className="text-sm text-gray-600 text-center">Checking authentication…</div>
        </div>
      </div>
    );
  }

  // If not authenticated, effect will redirect; avoid rendering children
  if (!user) return null;

  // If role restriction exists and user doesn't have it, we redirected above - render nothing
  if (requiredRoles && Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    const allowed = userRoleKey && requiredRoles.includes(userRoleKey);
    if (!allowed) return null;
  }

  // Authenticated + authorized — render children
  return <>{children}</>;
}
