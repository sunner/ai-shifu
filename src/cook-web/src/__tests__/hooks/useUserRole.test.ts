import { renderHook, act } from '@testing-library/react';
import { UserRole } from '@/c-types/user-roles';
import { mockUserData, createMockUserStore } from '../mocks/user-data';

// Mock the useUserStore
const mockUseUserStore = jest.fn();
jest.mock('@/c-store/useUserStore', () => ({
  useUserStore: mockUseUserStore
}));

// Import after mocking
import { useUserRole } from '@/c-hooks/useUserRole';

describe('useUserRole Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct state for guest user', () => {
    const mockStore = createMockUserStore(mockUserData.guestUser);
    mockStore.getUserRole.mockReturnValue('guest');
    mockStore.isGuest.mockReturnValue(true);
    mockStore.isRegistered.mockReturnValue(false);
    mockStore.isCreator.mockReturnValue(false);
    mockStore.isAdmin.mockReturnValue(false);
    mockUseUserStore.mockReturnValue(mockStore);

    const { result } = renderHook(() => useUserRole());

    expect(result.current.hasLogin).toBe(false);
    expect(result.current.hasCheckLogin).toBe(true);
    expect(result.current.userInfo).toBeNull();
    expect(result.current.currentRole).toBe('guest');
    expect(result.current.isGuest()).toBe(true);
    expect(result.current.isRegistered()).toBe(false);
    expect(result.current.isCreator()).toBe(false);
    expect(result.current.isAdmin()).toBe(false);
  });

  it('should return correct state for registered user', () => {
    const mockStore = createMockUserStore(mockUserData.registeredUser);
    mockStore.getUserRole.mockReturnValue('registered');
    mockStore.isGuest.mockReturnValue(false);
    mockStore.isRegistered.mockReturnValue(true);
    mockStore.isCreator.mockReturnValue(false);
    mockStore.isAdmin.mockReturnValue(false);
    mockUseUserStore.mockReturnValue(mockStore);

    const { result } = renderHook(() => useUserRole());

    expect(result.current.hasLogin).toBe(true);
    expect(result.current.hasCheckLogin).toBe(true);
    expect(result.current.userInfo).toBe(mockUserData.registeredUser.userInfo);
    expect(result.current.currentRole).toBe('registered');
    expect(result.current.isGuest()).toBe(false);
    expect(result.current.isRegistered()).toBe(true);
    expect(result.current.isCreator()).toBe(false);
    expect(result.current.isAdmin()).toBe(false);
  });

  it('should return correct state for creator user', () => {
    const mockStore = createMockUserStore(mockUserData.creatorUser);
    mockStore.getUserRole.mockReturnValue('creator');
    mockStore.isGuest.mockReturnValue(false);
    mockStore.isRegistered.mockReturnValue(true);
    mockStore.isCreator.mockReturnValue(true);
    mockStore.isAdmin.mockReturnValue(false);
    mockUseUserStore.mockReturnValue(mockStore);

    const { result } = renderHook(() => useUserRole());

    expect(result.current.hasLogin).toBe(true);
    expect(result.current.hasCheckLogin).toBe(true);
    expect(result.current.userInfo).toBe(mockUserData.creatorUser.userInfo);
    expect(result.current.currentRole).toBe('creator');
    expect(result.current.isGuest()).toBe(false);
    expect(result.current.isRegistered()).toBe(true);
    expect(result.current.isCreator()).toBe(true);
    expect(result.current.isAdmin()).toBe(false);
  });

  it('should return correct state for admin user', () => {
    const mockStore = createMockUserStore(mockUserData.adminUser);
    mockStore.getUserRole.mockReturnValue('admin');
    mockStore.isGuest.mockReturnValue(false);
    mockStore.isRegistered.mockReturnValue(true);
    mockStore.isCreator.mockReturnValue(true);
    mockStore.isAdmin.mockReturnValue(true);
    mockUseUserStore.mockReturnValue(mockStore);

    const { result } = renderHook(() => useUserRole());

    expect(result.current.hasLogin).toBe(true);
    expect(result.current.hasCheckLogin).toBe(true);
    expect(result.current.userInfo).toBe(mockUserData.adminUser.userInfo);
    expect(result.current.currentRole).toBe('admin');
    expect(result.current.isGuest()).toBe(false);
    expect(result.current.isRegistered()).toBe(true);
    expect(result.current.isCreator()).toBe(true);
    expect(result.current.isAdmin()).toBe(true);
  });

  it('should call checkLogin when hasCheckLogin is false', () => {
    const mockStore = createMockUserStore({
      ...mockUserData.guestUser,
      hasCheckLogin: false
    });
    mockStore.getUserRole.mockReturnValue('guest');
    mockStore.isGuest.mockReturnValue(true);
    mockStore.isRegistered.mockReturnValue(false);
    mockStore.isCreator.mockReturnValue(false);
    mockStore.isAdmin.mockReturnValue(false);
    mockUseUserStore.mockReturnValue(mockStore);

    renderHook(() => useUserRole());

    expect(mockStore.checkLogin).toHaveBeenCalled();
  });

  describe('canAccess method', () => {
    it('should correctly check access for guest user', () => {
      const mockStore = createMockUserStore(mockUserData.guestUser);
      mockStore.getUserRole.mockReturnValue('guest');
      mockUseUserStore.mockReturnValue(mockStore);

      const { result } = renderHook(() => useUserRole());

      expect(result.current.canAccess(UserRole.GUEST)).toBe(true);
      expect(result.current.canAccess(UserRole.REGISTERED)).toBe(false);
      expect(result.current.canAccess(UserRole.CREATOR)).toBe(false);
      expect(result.current.canAccess(UserRole.ADMIN)).toBe(false);
    });

    it('should correctly check access for registered user', () => {
      const mockStore = createMockUserStore(mockUserData.registeredUser);
      mockStore.getUserRole.mockReturnValue('registered');
      mockUseUserStore.mockReturnValue(mockStore);

      const { result } = renderHook(() => useUserRole());

      expect(result.current.canAccess(UserRole.GUEST)).toBe(true);
      expect(result.current.canAccess(UserRole.REGISTERED)).toBe(true);
      expect(result.current.canAccess(UserRole.CREATOR)).toBe(false);
      expect(result.current.canAccess(UserRole.ADMIN)).toBe(false);
    });

    it('should correctly check access for creator user', () => {
      const mockStore = createMockUserStore(mockUserData.creatorUser);
      mockStore.getUserRole.mockReturnValue('creator');
      mockUseUserStore.mockReturnValue(mockStore);

      const { result } = renderHook(() => useUserRole());

      expect(result.current.canAccess(UserRole.GUEST)).toBe(true);
      expect(result.current.canAccess(UserRole.REGISTERED)).toBe(true);
      expect(result.current.canAccess(UserRole.CREATOR)).toBe(true);
      expect(result.current.canAccess(UserRole.ADMIN)).toBe(false);
    });

    it('should correctly check access for admin user', () => {
      const mockStore = createMockUserStore(mockUserData.adminUser);
      mockStore.getUserRole.mockReturnValue('admin');
      mockUseUserStore.mockReturnValue(mockStore);

      const { result } = renderHook(() => useUserRole());

      expect(result.current.canAccess(UserRole.GUEST)).toBe(true);
      expect(result.current.canAccess(UserRole.REGISTERED)).toBe(true);
      expect(result.current.canAccess(UserRole.CREATOR)).toBe(true);
      expect(result.current.canAccess(UserRole.ADMIN)).toBe(true);
    });
  });

  describe('hasPermission method', () => {
    it('should correctly check permissions for guest user', () => {
      const mockStore = createMockUserStore(mockUserData.guestUser);
      mockStore.getUserRole.mockReturnValue('guest');
      mockUseUserStore.mockReturnValue(mockStore);

      const { result } = renderHook(() => useUserRole());

      expect(result.current.hasPermission('view:public')).toBe(true);
      expect(result.current.hasPermission('view:user')).toBe(false);
      expect(result.current.hasPermission('edit:profile')).toBe(false);
      expect(result.current.hasPermission('create:content')).toBe(false);
      expect(result.current.hasPermission('admin:users')).toBe(false);
    });

    it('should correctly check permissions for registered user', () => {
      const mockStore = createMockUserStore(mockUserData.registeredUser);
      mockStore.getUserRole.mockReturnValue('registered');
      mockUseUserStore.mockReturnValue(mockStore);

      const { result } = renderHook(() => useUserRole());

      expect(result.current.hasPermission('view:public')).toBe(true);
      expect(result.current.hasPermission('view:user')).toBe(true);
      expect(result.current.hasPermission('edit:profile')).toBe(true);
      expect(result.current.hasPermission('create:content')).toBe(false);
      expect(result.current.hasPermission('admin:users')).toBe(false);
    });

    it('should correctly check permissions for creator user', () => {
      const mockStore = createMockUserStore(mockUserData.creatorUser);
      mockStore.getUserRole.mockReturnValue('creator');
      mockUseUserStore.mockReturnValue(mockStore);

      const { result } = renderHook(() => useUserRole());

      expect(result.current.hasPermission('view:public')).toBe(true);
      expect(result.current.hasPermission('view:user')).toBe(true);
      expect(result.current.hasPermission('edit:profile')).toBe(true);
      expect(result.current.hasPermission('create:content')).toBe(true);
      expect(result.current.hasPermission('edit:content')).toBe(true);
      expect(result.current.hasPermission('admin:users')).toBe(false);
    });

    it('should correctly check permissions for admin user', () => {
      const mockStore = createMockUserStore(mockUserData.adminUser);
      mockStore.getUserRole.mockReturnValue('admin');
      mockUseUserStore.mockReturnValue(mockStore);

      const { result } = renderHook(() => useUserRole());

      expect(result.current.hasPermission('view:public')).toBe(true);
      expect(result.current.hasPermission('view:user')).toBe(true);
      expect(result.current.hasPermission('edit:profile')).toBe(true);
      expect(result.current.hasPermission('create:content')).toBe(true);
      expect(result.current.hasPermission('edit:content')).toBe(true);
      expect(result.current.hasPermission('admin:users')).toBe(true);
      expect(result.current.hasPermission('admin:content')).toBe(true);
    });
  });
});