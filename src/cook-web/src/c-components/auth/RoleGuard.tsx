import React from 'react';
import { useUserRole } from '@/c-hooks/useUserRole';
import { UserRole } from '@/c-types/user-roles';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
  fallback?: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Role Guard Component
 * Controls component rendering based on user role or permissions
 */
export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  fallback = null,
  allowedRoles
}: RoleGuardProps) {
  const { canAccess, hasPermission, currentRole } = useUserRole();
  
  // Check if role requirements are met
  const hasRoleAccess = () => {
    if (requiredRole) {
      return canAccess(requiredRole);
    }
    
    if (allowedRoles) {
      return allowedRoles.includes(currentRole as UserRole);
    }
    
    return true;
  };
  
  // Check if permission requirements are met
  const hasPermissionAccess = () => {
    if (requiredPermission) {
      return hasPermission(requiredPermission);
    }
    
    return true;
  };
  
  const shouldRender = hasRoleAccess() && hasPermissionAccess();
  
  return shouldRender ? <>{children}</> : <>{fallback}</>;
}

/**
 * Creator-specific guard
 */
export function CreatorGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requiredRole={UserRole.CREATOR} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Admin-specific guard
 */
export function AdminGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requiredRole={UserRole.ADMIN} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Registered user guard
 */
export function RegisteredGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requiredRole={UserRole.REGISTERED} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}