import { UserRole, UserRoleInfo, UserRoleChecker } from '@/c-types/user-roles';
import { useUserStore } from '@/c-store/useUserStore';
import { tokenTool } from '@/c-service/storeUtil';

/**
 * User Role Checker - Provides unified user role detection interface
 */
class UserRoleCheckerImpl implements UserRoleChecker {
  
  /**
   * Get current user role
   */
  getUserRole(): UserRole {
    const { hasLogin, userInfo } = useUserStore.getState();
    const tokenInfo = tokenTool.get();
    
    // Check if user is guest
    if (!hasLogin || !userInfo || tokenInfo.faked) {
      return UserRole.GUEST;
    }
    
    // Check if user is admin
    if (userInfo.role === 'admin' || userInfo.is_admin) {
      return UserRole.ADMIN;
    }
    
    // Check if user is creator
    if (userInfo.role === 'creator' || userInfo.is_creator || userInfo.can_create) {
      return UserRole.CREATOR;
    }
    
    // Default to registered user
    return UserRole.REGISTERED;
  }
  
  /**
   * Get complete user role information
   */
  getUserRoleInfo(): UserRoleInfo {
    const role = this.getUserRole();
    const tokenInfo = tokenTool.get();
    const { userInfo } = useUserStore.getState();
    
    return {
      role,
      isGuest: role === UserRole.GUEST,
      isRegistered: role === UserRole.REGISTERED,
      isCreator: role === UserRole.CREATOR,
      isAdmin: role === UserRole.ADMIN,
      hasValidToken: !!tokenInfo.token && !tokenInfo.faked,
      permissions: this.getUserPermissions(role, userInfo)
    };
  }
  
  /**
   * Check if user is guest
   */
  isGuest(): boolean {
    return this.getUserRole() === UserRole.GUEST;
  }
  
  /**
   * Check if user is registered
   */
  isRegistered(): boolean {
    const role = this.getUserRole();
    return role === UserRole.REGISTERED || role === UserRole.CREATOR || role === UserRole.ADMIN;
  }
  
  /**
   * Check if user is creator
   */
  isCreator(): boolean {
    const role = this.getUserRole();
    return role === UserRole.CREATOR || role === UserRole.ADMIN;
  }
  
  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.getUserRole() === UserRole.ADMIN;
  }
  
  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const roleInfo = this.getUserRoleInfo();
    return roleInfo.permissions.includes(permission);
  }
  
  /**
   * Check if user can access features requiring specific role
   */
  canAccess(requiredRole: UserRole): boolean {
    const currentRole = this.getUserRole();
    const roleHierarchy = {
      [UserRole.GUEST]: 0,
      [UserRole.REGISTERED]: 1,
      [UserRole.CREATOR]: 2,
      [UserRole.ADMIN]: 3
    };
    
    return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
  }
  
  /**
   * Get user permissions list
   */
  private getUserPermissions(role: UserRole, userInfo: any): string[] {
    const basePermissions = {
      [UserRole.GUEST]: ['view:public'],
      [UserRole.REGISTERED]: ['view:public', 'view:user', 'edit:profile'],
      [UserRole.CREATOR]: ['view:public', 'view:user', 'edit:profile', 'create:content', 'edit:content'],
      [UserRole.ADMIN]: ['view:public', 'view:user', 'edit:profile', 'create:content', 'edit:content', 'admin:users', 'admin:content']
    };
    
    const permissions = [...basePermissions[role]];
    
    // Add additional permissions based on user info
    if (userInfo?.premium) {
      permissions.push('view:premium');
    }
    
    return permissions;
  }
}

// Export singleton instance
export const userRoleChecker = new UserRoleCheckerImpl();

/**
 * React Hook for using user role detection in components
 */
export function useUserRole() {
  const { hasLogin, userInfo, hasCheckLogin } = useUserStore();
  
  // Ensure login status has been checked
  if (!hasCheckLogin) {
    useUserStore.getState().checkLogin();
  }
  
  const roleChecker = userRoleChecker;
  
  return {
    ...roleChecker,
    // Add reactive state
    hasLogin,
    userInfo,
    hasCheckLogin
  };
}