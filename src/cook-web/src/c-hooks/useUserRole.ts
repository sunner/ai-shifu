import { useUserStore } from '@/c-store/useUserStore';
import { UserRole } from '@/c-types/user-roles';

/**
 * User Role Detection Hook
 * Provides reactive user role state and detection methods
 */
export function useUserRole() {
  const { 
    hasLogin, 
    userInfo, 
    hasCheckLogin,
    getUserRole,
    isGuest,
    isRegistered,
    isCreator,
    isAdmin,
    checkLogin
  } = useUserStore();
  
  // Ensure login status has been checked
  if (!hasCheckLogin) {
    checkLogin();
  }
  
  const currentRole = getUserRole();
  
  return {
    // Basic state
    hasLogin,
    userInfo,
    hasCheckLogin,
    
    // Role information
    currentRole,
    
    // Role detection methods
    isGuest,
    isRegistered,
    isCreator,
    isAdmin,
    
    // Convenience methods
    canAccess: (requiredRole: UserRole) => {
      const roleHierarchy = {
        [UserRole.GUEST]: 0,
        [UserRole.REGISTERED]: 1,
        [UserRole.CREATOR]: 2,
        [UserRole.ADMIN]: 3
      };
      
      const currentLevel = roleHierarchy[currentRole as UserRole] || 0;
      const requiredLevel = roleHierarchy[requiredRole];
      
      return currentLevel >= requiredLevel;
    },
    
    // Permission check
    hasPermission: (permission: string) => {
      const rolePermissions = {
        guest: ['view:public'],
        registered: ['view:public', 'view:user', 'edit:profile'],
        creator: ['view:public', 'view:user', 'edit:profile', 'create:content', 'edit:content'],
        admin: ['view:public', 'view:user', 'edit:profile', 'create:content', 'edit:content', 'admin:users', 'admin:content']
      };
      
      const permissions = rolePermissions[currentRole as keyof typeof rolePermissions] || [];
      return permissions.includes(permission);
    }
  };
}