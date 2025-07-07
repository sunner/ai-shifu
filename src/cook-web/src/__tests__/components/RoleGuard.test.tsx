import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserRole } from '@/c-types/user-roles';
import { mockUserData, createMockUserStore } from '../mocks/user-data';

// Mock the useUserRole hook
const mockUseUserRole = jest.fn();
jest.mock('@/c-hooks/useUserRole', () => ({
  useUserRole: mockUseUserRole
}));

// Import after mocking
import { RoleGuard, CreatorGuard, AdminGuard, RegisteredGuard } from '@/c-components/auth/RoleGuard';

describe('RoleGuard Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockUseUserRole = (currentRole: string) => ({
    currentRole,
    canAccess: jest.fn((requiredRole: UserRole) => {
      const roleHierarchy = {
        [UserRole.GUEST]: 0,
        [UserRole.REGISTERED]: 1,
        [UserRole.CREATOR]: 2,
        [UserRole.ADMIN]: 3
      };
      const currentLevel = roleHierarchy[currentRole as UserRole] || 0;
      const requiredLevel = roleHierarchy[requiredRole];
      return currentLevel >= requiredLevel;
    }),
    hasPermission: jest.fn((permission: string) => {
      const rolePermissions = {
        guest: ['view:public'],
        registered: ['view:public', 'view:user', 'edit:profile'],
        creator: ['view:public', 'view:user', 'edit:profile', 'create:content', 'edit:content'],
        admin: ['view:public', 'view:user', 'edit:profile', 'create:content', 'edit:content', 'admin:users', 'admin:content']
      };
      const permissions = rolePermissions[currentRole as keyof typeof rolePermissions] || [];
      return permissions.includes(permission);
    })
  });

  describe('RoleGuard', () => {
    it('should render children when user has required role', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('registered'));

      render(
        <RoleGuard requiredRole={UserRole.REGISTERED}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render fallback when user does not have required role', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('guest'));

      render(
        <RoleGuard requiredRole={UserRole.REGISTERED} fallback={<div>Access Denied</div>}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render children when user has required permission', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('creator'));

      render(
        <RoleGuard requiredPermission="create:content">
          <div>Creator Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Creator Content')).toBeInTheDocument();
    });

    it('should render fallback when user does not have required permission', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('registered'));

      render(
        <RoleGuard requiredPermission="create:content" fallback={<div>No Permission</div>}>
          <div>Creator Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('No Permission')).toBeInTheDocument();
      expect(screen.queryByText('Creator Content')).not.toBeInTheDocument();
    });

    it('should render children when user role is in allowed roles', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('creator'));

      render(
        <RoleGuard allowedRoles={[UserRole.CREATOR, UserRole.ADMIN]}>
          <div>Special Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Special Content')).toBeInTheDocument();
    });

    it('should render fallback when user role is not in allowed roles', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('registered'));

      render(
        <RoleGuard allowedRoles={[UserRole.CREATOR, UserRole.ADMIN]} fallback={<div>Not Allowed</div>}>
          <div>Special Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Not Allowed')).toBeInTheDocument();
      expect(screen.queryByText('Special Content')).not.toBeInTheDocument();
    });

    it('should render nothing when no fallback is provided', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('guest'));

      const { container } = render(
        <RoleGuard requiredRole={UserRole.REGISTERED}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render children when no restrictions are specified', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('guest'));

      render(
        <RoleGuard>
          <div>Public Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });
  });

  describe('CreatorGuard', () => {
    it('should render children when user is creator', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('creator'));

      render(
        <CreatorGuard>
          <div>Creator Tools</div>
        </CreatorGuard>
      );

      expect(screen.getByText('Creator Tools')).toBeInTheDocument();
    });

    it('should render children when user is admin (higher than creator)', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('admin'));

      render(
        <CreatorGuard>
          <div>Creator Tools</div>
        </CreatorGuard>
      );

      expect(screen.getByText('Creator Tools')).toBeInTheDocument();
    });

    it('should render fallback when user is registered but not creator', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('registered'));

      render(
        <CreatorGuard fallback={<div>Need Creator Access</div>}>
          <div>Creator Tools</div>
        </CreatorGuard>
      );

      expect(screen.getByText('Need Creator Access')).toBeInTheDocument();
      expect(screen.queryByText('Creator Tools')).not.toBeInTheDocument();
    });

    it('should render fallback when user is guest', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('guest'));

      render(
        <CreatorGuard fallback={<div>Login Required</div>}>
          <div>Creator Tools</div>
        </CreatorGuard>
      );

      expect(screen.getByText('Login Required')).toBeInTheDocument();
      expect(screen.queryByText('Creator Tools')).not.toBeInTheDocument();
    });
  });

  describe('AdminGuard', () => {
    it('should render children when user is admin', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('admin'));

      render(
        <AdminGuard>
          <div>Admin Panel</div>
        </AdminGuard>
      );

      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    it('should render fallback when user is creator but not admin', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('creator'));

      render(
        <AdminGuard fallback={<div>Admin Only</div>}>
          <div>Admin Panel</div>
        </AdminGuard>
      );

      expect(screen.getByText('Admin Only')).toBeInTheDocument();
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    });

    it('should render fallback when user is registered but not admin', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('registered'));

      render(
        <AdminGuard fallback={<div>Admin Only</div>}>
          <div>Admin Panel</div>
        </AdminGuard>
      );

      expect(screen.getByText('Admin Only')).toBeInTheDocument();
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    });

    it('should render fallback when user is guest', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('guest'));

      render(
        <AdminGuard fallback={<div>Login Required</div>}>
          <div>Admin Panel</div>
        </AdminGuard>
      );

      expect(screen.getByText('Login Required')).toBeInTheDocument();
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    });
  });

  describe('RegisteredGuard', () => {
    it('should render children when user is registered', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('registered'));

      render(
        <RegisteredGuard>
          <div>Member Content</div>
        </RegisteredGuard>
      );

      expect(screen.getByText('Member Content')).toBeInTheDocument();
    });

    it('should render children when user is creator (higher than registered)', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('creator'));

      render(
        <RegisteredGuard>
          <div>Member Content</div>
        </RegisteredGuard>
      );

      expect(screen.getByText('Member Content')).toBeInTheDocument();
    });

    it('should render children when user is admin (higher than registered)', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('admin'));

      render(
        <RegisteredGuard>
          <div>Member Content</div>
        </RegisteredGuard>
      );

      expect(screen.getByText('Member Content')).toBeInTheDocument();
    });

    it('should render fallback when user is guest', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('guest'));

      render(
        <RegisteredGuard fallback={<div>Please Login</div>}>
          <div>Member Content</div>
        </RegisteredGuard>
      );

      expect(screen.getByText('Please Login')).toBeInTheDocument();
      expect(screen.queryByText('Member Content')).not.toBeInTheDocument();
    });
  });

  describe('Complex Role and Permission Combinations', () => {
    it('should handle both role and permission requirements', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('creator'));

      render(
        <RoleGuard requiredRole={UserRole.CREATOR} requiredPermission="create:content">
          <div>Creator Content Creation</div>
        </RoleGuard>
      );

      expect(screen.getByText('Creator Content Creation')).toBeInTheDocument();
    });

    it('should render fallback when role requirement is met but permission is not', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('registered'));

      render(
        <RoleGuard requiredRole={UserRole.REGISTERED} requiredPermission="create:content" fallback={<div>No Create Permission</div>}>
          <div>Creator Content Creation</div>
        </RoleGuard>
      );

      expect(screen.getByText('No Create Permission')).toBeInTheDocument();
      expect(screen.queryByText('Creator Content Creation')).not.toBeInTheDocument();
    });

    it('should render fallback when permission requirement is met but role is not', () => {
      mockUseUserRole.mockReturnValue(createMockUseUserRole('guest'));

      render(
        <RoleGuard requiredRole={UserRole.REGISTERED} requiredPermission="view:public" fallback={<div>Login Required</div>}>
          <div>Protected Public Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Login Required')).toBeInTheDocument();
      expect(screen.queryByText('Protected Public Content')).not.toBeInTheDocument();
    });
  });
});