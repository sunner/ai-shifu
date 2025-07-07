import { create } from 'zustand';
import { getUserInfo, registerTmp } from '@/c-api/user';
import { userInfoStore, tokenTool } from '@/c-service/storeUtil';
import { genUuid } from '@/c-utils/common';
import { verifySmsCode } from '@/c-api/user';
import { subscribeWithSelector } from 'zustand/middleware';

import { removeParamFromUrl } from '@/c-utils/urlUtils';
import i18n from '@/i18n';
import { UserStoreState } from '@/c-types/store';
import { useEnvStore } from './envStore';
import api from '@/api';

// Auto-initialize flag
let isInitialized = false;

export const useUserStore = create<UserStoreState, [["zustand/subscribeWithSelector", never]]>(
  subscribeWithSelector((set, get) => ({
    hasCheckLogin: false,
    hasLogin: false,
    userInfo: null,
    profile: null,
    login: async ({ mobile, smsCode }) => {
      const courseId = useEnvStore.getState().courseId;
      const res = await verifySmsCode({ mobile, sms_code: smsCode, course_id: courseId });
      const { userInfo, token } = res.data;
      await tokenTool.set({ token, faked: false });

      set(() => ({
        hasLogin: true,
        userInfo,
      }));
      i18n.changeLanguage(userInfo.language);

    },

    checkLoginForce: async () => {
      if (!tokenTool.get().token) {
        const res = await registerTmp({ temp_id: genUuid() });
        const token = res.data.token;
        await tokenTool.set({ token, faked: true });
        set(() => ({
          hasLogin: false,
          userInfo: null,
          hasCheckLogin: true,
        }));
        return;
      }

      if (userInfoStore.get()) {
        set(() => ({
          userInfo: userInfoStore.get(),
        }));
      }

      try {
        const res = await getUserInfo();
        const userInfo = res.data;
        await tokenTool.set({ token: tokenTool.get().token, faked: false });
        await userInfoStore.set(userInfo);
        if (userInfo.mobile) {
          set(() => ({
            hasCheckLogin: true,
            hasLogin: true,
            userInfo,
          }));
        } else {
          await tokenTool.set({ token: tokenTool.get().token, faked: true });
          set(() => ({
            hasCheckLogin: true,
            hasLogin: false,
            userInfo: userInfo,
          }));
        }
        i18n.changeLanguage(userInfo.language);
      } catch (err) {
        // @ts-expect-error EXPECT
        if ((err.status && err.status === 403) || (err.code && err.code === 1005) || (err.code && err.code === 1001)) {
          const res = await registerTmp({ temp_id: genUuid() });
          const token = res.data.token;
          await tokenTool.set({ token, faked: true });

          set(() => ({
            hasCheckLogin: true,
            hasLogin: false,
            userInfo: null,
          }));
        }
      }
    },

    // Check login status through API
    checkLogin: () => {
      const state = useUserStore.getState();
      if (state.hasCheckLogin) {
        return;
      }
      state.checkLoginForce();
    },

    logout: async (reload = true) => {
      const res = await registerTmp({ temp_id: genUuid() });
      const token = res.data.token;
      await tokenTool.set({ token, faked: true });
      await userInfoStore.remove();

      set(() => {
        return {
          hasLogin: false,
          userInfo: null,
        };
      });

      if (reload) {
        const url = removeParamFromUrl(window.location.href, ['code', 'state']);
        window.location.assign(url);
      }
    },

    // Update user information
    updateUserInfo: (userInfo) => {
      set((state) => {
        return {
          userInfo: {
            ...state.userInfo,
            ...userInfo,
          }
        };
      });
    },

    refreshUserInfo: async () => {
      const res = await getUserInfo();
      set(() => ({
        userInfo: {
          ...res.data
        }
      }));
      await userInfoStore.set(res.data);
      i18n.changeLanguage(res.data.language);

    },

    updateHasCheckLogin: (hasCheckLogin) => set(() => ({ hasCheckLogin })),

    // TODO: FIXME
    // Added temporarily. Please refine and organize user-related logic later.
    _setHasLogin: (v: boolean) => set({ hasLogin: v }),

    // Profile management (merged from useAuth)
    setProfile: (profile: any) => set({ profile }),

    fetchProfile: async () => {
      const { profile } = get();
      if (!profile) {
        try {
          const userInfo = await api.getUserInfo({});
          set({ profile: userInfo });
          get().updateUserInfo(userInfo);
          get()._setHasLogin(true);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    },

    // Initialize profile fetch automatically
    initProfileFetch: () => {
      const state = get();
      if (!state.profile && !isInitialized) {
        isInitialized = true;
        state.fetchProfile();
      }
    },

    // Role detection methods
    getUserRole: () => {
      const state = get();
      const tokenInfo = tokenTool.get();
      
      // Check if user is guest
      if (!state.hasLogin || !state.userInfo || tokenInfo.faked) {
        return 'guest';
      }
      
      // Check if user is admin
      if (state.userInfo.role === 'admin' || state.userInfo.is_admin) {
        return 'admin';
      }
      
      // Check if user is creator
      if (state.userInfo.role === 'creator' || state.userInfo.is_creator || state.userInfo.can_create) {
        return 'creator';
      }
      
      // Default to registered user
      return 'registered';
    },

    isGuest: () => get().getUserRole() === 'guest',
    isRegistered: () => ['registered', 'creator', 'admin'].includes(get().getUserRole()),
    isCreator: () => ['creator', 'admin'].includes(get().getUserRole()),
    isAdmin: () => get().getUserRole() === 'admin',
  }))
);
