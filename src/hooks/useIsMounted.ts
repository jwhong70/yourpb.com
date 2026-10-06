import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * React 18/19 및 Next.js 클라이언트 사이드 마운트 감지 훅
 * useEffect + setState를 사용하지 않아 cascading render 및 SSR mismatch 경고 없이 안전하게 클라이언트 마운트 여부를 반환합니다.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
