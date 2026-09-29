import { TextStyle } from 'react-native';

/** Sharp, athletic type — no playful weights. */
export const type: Record<'brand' | 'title' | 'subtitle' | 'card' | 'body' | 'label' | 'button', TextStyle> = {
  brand: { fontSize: 15, fontWeight: '800', letterSpacing: 2.2 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { fontSize: 14, fontWeight: '500', lineHeight: 20, letterSpacing: 0.2 },
  card: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 21 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  button: { fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
};
