import { useCallback } from 'react';
import { EVENT_NAMES, tracking } from 'common/tools/tracking';
import { useUserStore } from 'stores/useUserStore';
import { useUiLayoutStore } from 'stores/useUiLayoutStore';
import { FRAME_LAYOUT_MOBILE } from 'constants/uiConstants';
import { getScriptInfo } from 'Api/lesson';
export { EVENT_NAMES } from 'common/tools/tracking';

export const useTracking = () => {
  const { frameLayout } = useUiLayoutStore((state) => state);
  const { userInfo } = useUserStore((state) => state);

  const getEventBasicData = useCallback(() => {
    return {
      user_type: userInfo?.mobile ? 'user' : 'guest',
      user_id: userInfo?.user_id || 0,
      device: frameLayout === FRAME_LAYOUT_MOBILE ? 'H5' : 'Web',
    };
  }, [frameLayout, userInfo?.mobile, userInfo?.user_id]);

  const trackEvent = useCallback(async (eventName, eventData) => {
    try {
      const basicData = getEventBasicData();
      const data = {
        ...eventData,
        ...basicData
      };
      tracking(eventName, data);
    } catch { }
  }, [getEventBasicData]);


  const trackTrailProgress = useCallback(async (scriptId) => {
    try {
      const { data: scriptInfo } = await getScriptInfo(scriptId);

      // 是否体验课
      if (!scriptInfo?.is_trial_lesson) {
        return;
      }

      trackEvent(EVENT_NAMES.TRIAL_PROGRESS, {
        progress_no: scriptInfo.script_index,
        progress_desc: scriptInfo.script_name,
      });
    } catch { }
  }, [trackEvent]);

  return { trackEvent, trackTrailProgress, EVENT_NAMES };
};
