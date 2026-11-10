import { useCallback, useState } from 'react';
import { SCENES, type SceneId } from '../content';
import { useWindowEvent } from './useWindowEvent';

const sceneFromHash = (): SceneId | null => {
  const id = location.hash.slice(1);
  return SCENES.find((s) => s.id === id)?.id ?? null;
};

/**
 * The open building lives in the URL hash (#projects). Walking in from the
 * campus pushes a history entry so Back walks out again; hopping between
 * buildings replaces it.
 */
export function useSceneRoute() {
  const [scene, setScene] = useState(sceneFromHash);

  const openScene = useCallback((id: SceneId) => {
    setScene((current) => {
      if (current) history.replaceState(null, '', `#${id}`);
      else history.pushState(null, '', `#${id}`);
      return id;
    });
  }, []);

  const goHome = useCallback(() => {
    setScene(null);
    history.replaceState(null, '', location.pathname + location.search);
  }, []);

  const sync = () => setScene(sceneFromHash());
  useWindowEvent('popstate', sync);
  useWindowEvent('hashchange', sync);

  return { scene, openScene, goHome };
}
