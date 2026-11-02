import { useEffect } from 'react';

import { useUiStore } from '../stores/uiStore';
import type { LayoutMode } from '../domain/types';
import { LANDSCAPE_QUERY } from '../lib/layout';

/** Subscribes to orientation changes and keeps the UI store in sync. */
export function useLayoutMode(): LayoutMode {
  const layoutMode = useUiStore((state) => state.layoutMode);
  const setLayoutMode = useUiStore((state) => state.setLayoutMode);

  useEffect(() => {
    const media = window.matchMedia(LANDSCAPE_QUERY);
    const update = () => setLayoutMode(media.matches ? 'broad' : 'phone');

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [setLayoutMode]);

  return layoutMode;
}
