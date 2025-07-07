import React from 'react';
import { useUserRole } from '@/c-hooks/useUserRole';
import { RoleGuard, CreatorGuard, AdminGuard, RegisteredGuard } from '@/c-components/auth';
import { UserRole } from '@/c-types/user-roles';

/**
 * User Role Usage Example
 */
export function UserRoleUsageExample() {
  const { 
    currentRole, 
    isGuest, 
    isRegistered, 
    isCreator, 
    isAdmin,
    canAccess,
    hasPermission
  } = useUserRole();

  return (
    <div className="user-role-example">
      <h2>User Role Status</h2>
      <div>
        <p>Current Role: {currentRole}</p>
        <p>Is Guest: {isGuest() ? 'Yes' : 'No'}</p>
        <p>Is Registered: {isRegistered() ? 'Yes' : 'No'}</p>
        <p>Is Creator: {isCreator() ? 'Yes' : 'No'}</p>
        <p>Is Admin: {isAdmin() ? 'Yes' : 'No'}</p>
      </div>

      <h3>Permission Check Examples</h3>
      <div>
        <p>Can Access Creator Features: {canAccess(UserRole.CREATOR) ? 'Yes' : 'No'}</p>
        <p>Can Edit Content: {hasPermission('edit:content') ? 'Yes' : 'No'}</p>
        <p>Can Manage Users: {hasPermission('admin:users') ? 'Yes' : 'No'}</p>
      </div>

      <h3>Role Guard Examples</h3>
      
      {/* Only visible to registered users */}
      <RegisteredGuard fallback={<p>Please login first</p>}>
        <div className="registered-content">
          <h4>Registered User Exclusive Content</h4>
          <p>This content is only visible to registered users</p>
        </div>
      </RegisteredGuard>

      {/* Only visible to creators */}
      <CreatorGuard fallback={<p>You need creator permissions to view this content</p>}>
        <div className="creator-content">
          <h4>Creator Tools</h4>
          <button>Create New Content</button>
          <button>Edit Existing Content</button>
        </div>
      </CreatorGuard>

      {/* Only visible to admins */}
      <AdminGuard fallback={<p>Admin-only features</p>}>
        <div className="admin-content">
          <h4>Admin Panel</h4>
          <button>User Management</button>
          <button>Content Moderation</button>
        </div>
      </AdminGuard>

      {/* Custom role guard */}
      <RoleGuard 
        allowedRoles={[UserRole.CREATOR, UserRole.ADMIN]}
        fallback={<p>Requires creator or admin permissions</p>}
      >
        <div className="special-content">
          <h4>Special Features</h4>
          <p>Content visible to both creators and admins</p>
        </div>
      </RoleGuard>

      {/* Permission-based guard */}
      <RoleGuard 
        requiredPermission="edit:content"
        fallback={<p>You don't have edit permissions</p>}
      >
        <div className="edit-tools">
          <h4>Edit Tools</h4>
          <button>Edit</button>
          <button>Save</button>
        </div>
      </RoleGuard>
    </div>
  );
}

/**
 * Navigation Menu Example - Display different menu items based on user role
 */
export function NavigationExample() {
  const { isGuest, isRegistered, isCreator, isAdmin } = useUserRole();

  return (
    <nav className="navigation">
      <ul>
        <li><a href="/">Home</a></li>
        
        {isGuest() && (
          <>
            <li><a href="/login">Login</a></li>
            <li><a href="/register">Register</a></li>
          </>
        )}
        
        {isRegistered() && (
          <>
            <li><a href="/profile">Profile</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </>
        )}
        
        {isCreator() && (
          <>
            <li><a href="/create">Create Center</a></li>
            <li><a href="/my-content">My Content</a></li>
          </>
        )}
        
        {isAdmin() && (
          <>
            <li><a href="/admin">Admin Panel</a></li>
            <li><a href="/admin/users">User Management</a></li>
          </>
        )}
      </ul>
    </nav>
  );
}