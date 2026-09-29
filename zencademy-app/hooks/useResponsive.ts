import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type Breakpoint = 'phoneSmall' | 'phone' | 'tablet' | 'largeTablet';

export default function useResponsive() {
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState(Dimensions.get('window'));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setSize(window));
    return () => { (sub as any)?.remove?.(); };
  }, []);

  const breakpoint: Breakpoint = useMemo(() => {
    const w = Math.min(size.width, size.height);
    if (w >= 900) return 'largeTablet';
    if (w >= 720) return 'tablet';
    if (w <= 340) return 'phoneSmall';
    return 'phone';
  }, [size]);

  return {
    width: size.width,
    height: size.height,
    insets,
    breakpoint,
    isTablet: breakpoint === 'tablet' || breakpoint === 'largeTablet',
    isSmallPhone: breakpoint === 'phoneSmall',
    platform: Platform.OS,
  };
}




