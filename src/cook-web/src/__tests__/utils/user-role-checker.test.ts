import { UserRole } from '@/c-types/user-roles';
import { mockUserData, mockTokenTool } from '../mocks/user-data';

// Mock dependencies
jest.mock('@/c-store/useUserStore', () => ({
  useUserStore: {
    getState: jest.fn()
  }
}));

jest.mock('@/c-service/storeUtil', () => ({
  tokenTool: mockTokenTool
}));

// Import after mocking
import { userRoleChecker } from '@/c-utils/user-role-checker';
import { useUserStore } from '@/c-store/useUserStore';

describe('UserRoleChecker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserRole', () => {
    it('should return GUEST for user without login', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.guestUser);
      mockTokenTool.get.mockReturnValue(mockUserData.guestUser.token);

      const role = userRoleChecker.getUserRole();
      expect(role).toBe(UserRole.GUEST);
    });

    it('should return GUEST for user with faked token', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue({
        hasLogin: true,
        userInfo: mockUserData.registeredUser.userInfo
      });
      mockTokenTool.get.mockReturnValue({ token: 'fake-token', faked: true });

      const role = userRoleChecker.getUserRole();
      expect(role).toBe(UserRole.GUEST);
    });

    it('should return REGISTERED for regular user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.registeredUser);
      mockTokenTool.get.mockReturnValue(mockUserData.registeredUser.token);

      const role = userRoleChecker.getUserRole();
      expect(role).toBe(UserRole.REGISTERED);
    });

    it('should return CREATOR for creator user with role field', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.creatorUser);
      mockTokenTool.get.mockReturnValue(mockUserData.creatorUser.token);

      const role = userRoleChecker.getUserRole();
      expect(role).toBe(UserRole.CREATOR);
    });

    it('should return CREATOR for creator user with is_creator flag', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.creatorUserAlt);
      mockTokenTool.get.mockReturnValue(mockUserData.creatorUserAlt.token);

      const role = userRoleChecker.getUserRole();
      expect(role).toBe(UserRole.CREATOR);
    });

    it('should return ADMIN for admin user with role field', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.adminUser);
      mockTokenTool.get.mockReturnValue(mockUserData.adminUser.token);

      const role = userRoleChecker.getUserRole();
      expect(role).toBe(UserRole.ADMIN);
    });

    it('should return ADMIN for admin user with is_admin flag', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.adminUserAlt);
      mockTokenTool.get.mockReturnValue(mockUserData.adminUserAlt.token);

      const role = userRoleChecker.getUserRole();
      expect(role).toBe(UserRole.ADMIN);
    });
  });

  describe('Role Check Methods', () => {
    it('should correctly identify guest user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.guestUser);
      mockTokenTool.get.mockReturnValue(mockUserData.guestUser.token);

      expect(userRoleChecker.isGuest()).toBe(true);
      expect(userRoleChecker.isRegistered()).toBe(false);
      expect(userRoleChecker.isCreator()).toBe(false);
      expect(userRoleChecker.isAdmin()).toBe(false);
    });

    it('should correctly identify registered user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.registeredUser);
      mockTokenTool.get.mockReturnValue(mockUserData.registeredUser.token);

      expect(userRoleChecker.isGuest()).toBe(false);
      expect(userRoleChecker.isRegistered()).toBe(true);
      expect(userRoleChecker.isCreator()).toBe(false);
      expect(userRoleChecker.isAdmin()).toBe(false);
    });

    it('should correctly identify creator user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.creatorUser);
      mockTokenTool.get.mockReturnValue(mockUserData.creatorUser.token);

      expect(userRoleChecker.isGuest()).toBe(false);
      expect(userRoleChecker.isRegistered()).toBe(true);
      expect(userRoleChecker.isCreator()).toBe(true);
      expect(userRoleChecker.isAdmin()).toBe(false);
    });

    it('should correctly identify admin user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.adminUser);
      mockTokenTool.get.mockReturnValue(mockUserData.adminUser.token);

      expect(userRoleChecker.isGuest()).toBe(false);
      expect(userRoleChecker.isRegistered()).toBe(true);
      expect(userRoleChecker.isCreator()).toBe(true);
      expect(userRoleChecker.isAdmin()).toBe(true);
    });
  });

  describe('getUserRoleInfo', () => {
    it('should return complete role info for guest user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.guestUser);
      mockTokenTool.get.mockReturnValue(mockUserData.guestUser.token);

      const roleInfo = userRoleChecker.getUserRoleInfo();
      
      expect(roleInfo.role).toBe(UserRole.GUEST);
      expect(roleInfo.isGuest).toBe(true);
      expect(roleInfo.isRegistered).toBe(false);
      expect(roleInfo.isCreator).toBe(false);
      expect(roleInfo.isAdmin).toBe(false);
      expect(roleInfo.hasValidToken).toBe(false);
      expect(roleInfo.permissions).toContain('view:public');
    });

    it('should return complete role info for registered user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.registeredUser);
      mockTokenTool.get.mockReturnValue(mockUserData.registeredUser.token);

      const roleInfo = userRoleChecker.getUserRoleInfo();
      
      expect(roleInfo.role).toBe(UserRole.REGISTERED);
      expect(roleInfo.isGuest).toBe(false);
      expect(roleInfo.isRegistered).toBe(true);
      expect(roleInfo.isCreator).toBe(false);
      expect(roleInfo.isAdmin).toBe(false);
      expect(roleInfo.hasValidToken).toBe(true);
      expect(roleInfo.permissions).toContain('view:public');
      expect(roleInfo.permissions).toContain('view:user');
      expect(roleInfo.permissions).toContain('edit:profile');
    });

    it('should return complete role info for premium user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.premiumUser);
      mockTokenTool.get.mockReturnValue(mockUserData.premiumUser.token);

      const roleInfo = userRoleChecker.getUserRoleInfo();
      
      expect(roleInfo.permissions).toContain('view:premium');
    });
  });

  describe('Permission Checks', () => {
    it('should correctly check permissions for guest user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.guestUser);
      mockTokenTool.get.mockReturnValue(mockUserData.guestUser.token);

      expect(userRoleChecker.hasPermission('view:public')).toBe(true);
      expect(userRoleChecker.hasPermission('view:user')).toBe(false);
      expect(userRoleChecker.hasPermission('edit:profile')).toBe(false);
      expect(userRoleChecker.hasPermission('create:content')).toBe(false);
      expect(userRoleChecker.hasPermission('admin:users')).toBe(false);
    });

    it('should correctly check permissions for registered user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.registeredUser);
      mockTokenTool.get.mockReturnValue(mockUserData.registeredUser.token);

      expect(userRoleChecker.hasPermission('view:public')).toBe(true);
      expect(userRoleChecker.hasPermission('view:user')).toBe(true);
      expect(userRoleChecker.hasPermission('edit:profile')).toBe(true);
      expect(userRoleChecker.hasPermission('create:content')).toBe(false);
      expect(userRoleChecker.hasPermission('admin:users')).toBe(false);
    });

    it('should correctly check permissions for creator user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.creatorUser);
      mockTokenTool.get.mockReturnValue(mockUserData.creatorUser.token);

      expect(userRoleChecker.hasPermission('view:public')).toBe(true);
      expect(userRoleChecker.hasPermission('view:user')).toBe(true);
      expect(userRoleChecker.hasPermission('edit:profile')).toBe(true);
      expect(userRoleChecker.hasPermission('create:content')).toBe(true);
      expect(userRoleChecker.hasPermission('edit:content')).toBe(true);
      expect(userRoleChecker.hasPermission('admin:users')).toBe(false);
    });

    it('should correctly check permissions for admin user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.adminUser);
      mockTokenTool.get.mockReturnValue(mockUserData.adminUser.token);

      expect(userRoleChecker.hasPermission('view:public')).toBe(true);
      expect(userRoleChecker.hasPermission('view:user')).toBe(true);
      expect(userRoleChecker.hasPermission('edit:profile')).toBe(true);
      expect(userRoleChecker.hasPermission('create:content')).toBe(true);
      expect(userRoleChecker.hasPermission('edit:content')).toBe(true);
      expect(userRoleChecker.hasPermission('admin:users')).toBe(true);
      expect(userRoleChecker.hasPermission('admin:content')).toBe(true);
    });
  });

  describe('Access Control', () => {
    it('should correctly check access levels for guest user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.guestUser);
      mockTokenTool.get.mockReturnValue(mockUserData.guestUser.token);

      expect(userRoleChecker.canAccess(UserRole.GUEST)).toBe(true);
      expect(userRoleChecker.canAccess(UserRole.REGISTERED)).toBe(false);
      expect(userRoleChecker.canAccess(UserRole.CREATOR)).toBe(false);
      expect(userRoleChecker.canAccess(UserRole.ADMIN)).toBe(false);
    });

    it('should correctly check access levels for registered user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.registeredUser);
      mockTokenTool.get.mockReturnValue(mockUserData.registeredUser.token);

      expect(userRoleChecker.canAccess(UserRole.GUEST)).toBe(true);
      expect(userRoleChecker.canAccess(UserRole.REGISTERED)).toBe(true);
      expect(userRoleChecker.canAccess(UserRole.CREATOR)).toBe(false);
      expect(userRoleChecker.canAccess(UserRole.ADMIN)).toBe(false);
    });

    it('should correctly check access levels for creator user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.creatorUser);
      mockTokenTool.get.mockReturnValue(mockUserData.creatorUser.token);

      expect(userRoleChecker.canAccess(UserRole.GUEST)).toBe(true);
      expect(userRoleChecker.canAccess(UserRole.REGISTERED)).toBe(true);
      expect(userRoleChecker.canAccess(UserRole.CREATOR)).toBe(true);
      expect(userRoleChecker.canAccess(UserRole.ADMIN)).toBe(false);
    });

    it('should correctly check access levels for admin user', () => {
      (useUserStore.getState as jest.Mock).mockReturnValue(mockUserData.adminUser);
      mockTokenTool.get.mockReturnValue(mockUserData.adminUser.token);

      expect(userRoleChecker.canAccess(UserRole.GUEST)).toBe(true);
      expect(userRoleChecker.canAccess(UserRole.REGISTERED)).toBe(true);
      expect(userRoleChecker.canAccess(UserRole.CREATOR)).toBe(true);
      expect(userRoleChecker.canAccess(UserRole.ADMIN)).toBe(true);
    });
  });
});