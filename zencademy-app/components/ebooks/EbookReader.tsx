import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type EbookChapter = {
  id: number;
  title: string;
  content: string;
};

type Props = {
  title: string;
  chapters: EbookChapter[];
};

type Block =
  | { type: 'heading'; text: string; level: 1 | 2 }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'steps'; items: string[] }
  | { type: 'callout'; kind: 'practice' | 'tips' | 'takeaways' | 'prompt'; title: string; items: string[] };

type ThemePack = {
  bg: string;
  canvas: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  calloutBg: string;
  calloutBorder: string;
  bullet: string;
};

const WORDS_PER_PAGE = 220;

function stripInlineMarkers(text: string) {
  return text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function blockWords(block: Block): number {
  if (block.type === 'heading' || block.type === 'paragraph') return wordCount(block.text);
  if (block.type === 'callout') return wordCount(block.title) + block.items.reduce((s, i) => s + wordCount(i), 0);
  return block.items.reduce((s, i) => s + wordCount(i), 0);
}

function detectCallout(title: string): 'practice' | 'tips' | 'takeaways' | 'prompt' | null {
  const t = title.toLowerCase();
  if (t.includes('practice')) return 'practice';
  if (t.includes('takeaway') || t.includes('key takeaway')) return 'takeaways';
  if (t.includes('reflection') || t.includes('prompt') || t.includes('intention')) return 'prompt';
  if (t.includes('weekly') || t.includes('integration') || t.includes('tip') || t.includes('connect')) return 'tips';
  return null;
}

/** Parse markdown-ish chapter text into typed layout blocks. */
export function parseEbookBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    const text = buf.join(' ').replace(/\s+/g, ' ').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    buf.length = 0;
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i += 1;
      continue;
    }

    // Heading: **Title** alone, or **1. Title**
    const headingMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch && !line.includes('•')) {
      const title = headingMatch[1].trim();
      const calloutKind = detectCallout(title);
      // Peek following list items for callout grouping
      if (calloutKind) {
        const items: string[] = [];
        let j = i + 1;
        while (j < lines.length) {
          const next = lines[j].trim();
          if (!next) {
            j += 1;
            if (items.length && lines[j]?.trim().match(/^\*\*.+\*\*$/)) break;
            continue;
          }
          if (/^\*\*.+\*\*$/.test(next)) break;
          if (next.startsWith('•') || /^\d+\.\s/.test(next)) {
            items.push(next.replace(/^•\s*/, '').replace(/^\d+\.\s*/, '').trim());
            j += 1;
            continue;
          }
          // continuation paragraph under callout
          items.push(next);
          j += 1;
        }
        if (items.length) {
          blocks.push({ type: 'callout', kind: calloutKind, title, items });
          i = j;
          continue;
        }
      }
      const level: 1 | 2 = /^\d+\./.test(title) ? 2 : 1;
      blocks.push({ type: 'heading', text: title, level });
      i += 1;
      continue;
    }

    // Bullet cluster
    if (line.startsWith('•')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('•')) {
        items.push(lines[i].trim().replace(/^•\s*/, ''));
        i += 1;
      }
      blocks.push({ type: 'bullets', items });
      continue;
    }

    // Numbered cluster
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s*/, ''));
        i += 1;
      }
      blocks.push({ type: 'steps', items });
      continue;
    }

    // Paragraph (may span blank-free lines until blank or special)
    const buf: string[] = [line];
    i += 1;
    while (i < lines.length) {
      const n = lines[i].trim();
      if (!n || n.startsWith('•') || /^\d+\.\s/.test(n) || /^\*\*.+\*\*$/.test(n)) break;
      buf.push(n);
      i += 1;
    }
    flushParagraph(buf);
  }

  return blocks;
}

function paginateBlocks(blocks: Block[]): Block[][] {
  const pages: Block[][] = [];
  let current: Block[] = [];
  let words = 0;

  const pushPage = () => {
    if (current.length) pages.push(current);
    current = [];
    words = 0;
  };

  for (const block of blocks) {
    const w = blockWords(block);
    // Keep heading with following content when possible
    if (current.length && words + w > WORDS_PER_PAGE && block.type !== 'heading') {
      pushPage();
    }
    if (block.type === 'heading' && current.length && words > WORDS_PER_PAGE * 0.65) {
      pushPage();
    }
    current.push(block);
    words += w;
    if (words >= WORDS_PER_PAGE && block.type !== 'heading') {
      pushPage();
    }
  }
  pushPage();
  return pages.length ? pages : [[]];
}

function InlineText({
  text,
  color,
  accent,
  size,
  lineHeight,
  weight,
}: {
  text: string;
  color: string;
  accent: string;
  size: number;
  lineHeight: number;
  weight?: '400' | '500' | '600' | '700';
}) {
  const parts = text.split(/(\*\*.*?\*\*|\*[^*]+\*)/g);
  return (
    <Text style={{ color, fontSize: size, lineHeight, fontWeight: weight ?? '400' }}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={index} style={{ color: accent, fontWeight: '700' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return (
            <Text key={index} style={{ fontStyle: 'italic', color }}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
}

const CALLOUT_META: Record<
  'practice' | 'tips' | 'takeaways' | 'prompt',
  { icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  practice: { icon: 'fitness-outline', label: 'Practice' },
  tips: { icon: 'calendar-outline', label: 'Plan' },
  takeaways: { icon: 'bookmark-outline', label: 'Takeaways' },
  prompt: { icon: 'help-circle-outline', label: 'Reflect' },
};

export function EbookReader({ title, chapters }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(17);
  const [showControls, setShowControls] = useState(false);

  const palette: ThemePack = isDarkMode
    ? {
        bg: '#0C0C0C',
        canvas: '#121212',
        surface: '#1A1A1A',
        border: '#2A2A2A',
        text: '#F2F0EA',
        muted: '#A3A099',
        accent: '#E8C547',
        accentSoft: 'rgba(232,197,71,0.14)',
        accentText: '#0C0C0C',
        calloutBg: '#1A1810',
        calloutBorder: 'rgba(232,197,71,0.35)',
        bullet: '#E8C547',
      }
    : {
        bg: '#F3EFE6',
        canvas: '#FFFCF7',
        surface: '#FFFFFF',
        border: '#E6E0D4',
        text: '#1C1915',
        muted: '#6F6A60',
        accent: '#1F4B3A',
        accentSoft: 'rgba(31,75,58,0.10)',
        accentText: '#FFFCF7',
        calloutBg: '#F0F5F2',
        calloutBorder: 'rgba(31,75,58,0.22)',
        bullet: '#1F4B3A',
      };

  const chapterPages = useMemo(() => {
    return chapters.map((ch) => paginateBlocks(parseEbookBlocks(ch.content)));
  }, [chapters]);

  const pages = chapterPages[currentChapter] ?? [[]];
  const pageBlocks = pages[currentPage] ?? [];
  const currentChapterData = chapters[currentChapter] ?? chapters[0];
  const totalBookPages = chapterPages.reduce((s, p) => s + p.length, 0);
  const pagesBefore = chapterPages.slice(0, currentChapter).reduce((s, p) => s + p.length, 0);
  const progressPct = Math.round(((pagesBefore + currentPage + 1) / Math.max(1, totalBookPages)) * 100);
  const lineHeight = Math.round(fontSize * 1.65);

  const nextPage = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
    else if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentPage(0);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
    else if (currentChapter > 0) {
      const prevLen = chapterPages[currentChapter - 1].length;
      setCurrentChapter(currentChapter - 1);
      setCurrentPage(Math.max(0, prevLen - 1));
    }
  };

  const atStart = currentChapter === 0 && currentPage === 0;
  const atEnd = currentChapter === chapters.length - 1 && currentPage === pages.length - 1;

  const renderBlock = (block: Block, index: number) => {
    if (block.type === 'heading') {
      return (
        <View key={index} style={[styles.headingWrap, block.level === 1 && styles.headingWrapPrimary]}>
          {block.level === 2 ? (
            <View style={[styles.sectionIndex, { backgroundColor: palette.accentSoft }]}>
              <Text style={[styles.sectionIndexText, { color: palette.accent }]}>
                {stripInlineMarkers(block.text).match(/^\d+/)?.[0] ?? '•'}
              </Text>
            </View>
          ) : null}
          <Text
            style={[
              block.level === 1 ? styles.h1 : styles.h2,
              { color: palette.text, flex: 1 },
            ]}
          >
            {stripInlineMarkers(block.text).replace(/^\d+\.\s*/, '')}
          </Text>
        </View>
      );
    }

    if (block.type === 'paragraph') {
      return (
        <View key={index} style={styles.paragraphWrap}>
          <InlineText text={block.text} color={palette.text} accent={palette.accent} size={fontSize} lineHeight={lineHeight} />
        </View>
      );
    }

    if (block.type === 'bullets') {
      return (
        <View key={index} style={styles.listWrap}>
          {block.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: palette.bullet }]} />
              <View style={styles.bulletText}>
                <InlineText text={item} color={palette.text} accent={palette.accent} size={fontSize} lineHeight={lineHeight} />
              </View>
            </View>
          ))}
        </View>
      );
    }

    if (block.type === 'steps') {
      return (
        <View key={index} style={styles.listWrap}>
          {block.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: palette.accent }]}>
                <Text style={[styles.stepBadgeText, { color: palette.accentText }]}>{itemIndex + 1}</Text>
              </View>
              <View style={styles.bulletText}>
                <InlineText text={item} color={palette.text} accent={palette.accent} size={fontSize} lineHeight={lineHeight} />
              </View>
            </View>
          ))}
        </View>
      );
    }

    const meta = CALLOUT_META[block.kind];
    return (
      <View
        key={index}
        style={[
          styles.callout,
          { backgroundColor: palette.calloutBg, borderColor: palette.calloutBorder },
        ]}
      >
        <View style={styles.calloutHeader}>
          <View style={[styles.calloutIcon, { backgroundColor: palette.accentSoft }]}>
            <Ionicons name={meta.icon} size={16} color={palette.accent} />
          </View>
          <Text style={[styles.calloutLabel, { color: palette.accent }]}>{meta.label}</Text>
        </View>
        <Text style={[styles.calloutTitle, { color: palette.text }]}>{stripInlineMarkers(block.title)}</Text>
        {block.items.map((item, itemIndex) => (
          <View key={itemIndex} style={styles.calloutItem}>
            <Text style={[styles.calloutBullet, { color: palette.accent }]}>•</Text>
            <View style={{ flex: 1 }}>
              <InlineText
                text={item}
                color={palette.text}
                accent={palette.accent}
                size={Math.max(14, fontSize - 1)}
                lineHeight={Math.round((fontSize - 1) * 1.55)}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={palette.bg} />

      <View style={[styles.header, { borderBottomColor: palette.border, backgroundColor: palette.bg }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={palette.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerEyebrow, { color: palette.muted }]}>READING</Text>
          <Text style={[styles.headerTitle, { color: palette.text }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowControls((v) => !v)} hitSlop={10}>
            <Ionicons name="text" size={20} color={palette.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setIsDarkMode((v) => !v)} hitSlop={10}>
            <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={20} color={palette.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {showControls ? (
        <View style={[styles.controlsPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.controlsLabel, { color: palette.muted }]}>Text size</Text>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlChip, { borderColor: palette.border, backgroundColor: palette.canvas }]}
              onPress={() => fontSize > 14 && setFontSize(fontSize - 1)}
            >
              <Text style={{ color: palette.text, fontWeight: '700' }}>A−</Text>
            </TouchableOpacity>
            <Text style={[styles.controlValue, { color: palette.text }]}>{fontSize}</Text>
            <TouchableOpacity
              style={[styles.controlChip, { borderColor: palette.border, backgroundColor: palette.canvas }]}
              onPress={() => fontSize < 22 && setFontSize(fontSize + 1)}
            >
              <Text style={{ color: palette.text, fontWeight: '700' }}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View style={styles.chapterNavWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chapterNavContent}>
          {chapters.map((chapter, index) => {
            const active = currentChapter === index;
            return (
              <Pressable
                key={chapter.id}
                onPress={() => {
                  setCurrentChapter(index);
                  setCurrentPage(0);
                }}
                style={[
                  styles.chapterChip,
                  {
                    backgroundColor: active ? palette.accent : palette.surface,
                    borderColor: active ? palette.accent : palette.border,
                  },
                ]}
              >
                <Text style={[styles.chapterChipIndex, { color: active ? palette.accentText : palette.muted }]}>
                  {index + 1}
                </Text>
                <Text
                  style={[styles.chapterChipText, { color: active ? palette.accentText : palette.text }]}
                  numberOfLines={1}
                >
                  {chapter.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.progressTrackWrap}>
        <View style={[styles.progressTrack, { backgroundColor: palette.border }]}>
          <View style={[styles.progressFill, { backgroundColor: palette.accent, width: `${progressPct}%` }]} />
        </View>
        <Text style={[styles.progressMeta, { color: palette.muted }]}>
          Ch {currentChapter + 1}/{chapters.length} · p. {currentPage + 1}/{pages.length} · {progressPct}%
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageCard, { backgroundColor: palette.canvas, borderColor: palette.border }]}>
          <View style={styles.pageKicker}>
            <Text style={[styles.pageKickerText, { color: palette.accent }]}>
              Chapter {currentChapter + 1}
            </Text>
            <View style={[styles.pageKickerDot, { backgroundColor: palette.border }]} />
            <Text style={[styles.pageKickerText, { color: palette.muted }]} numberOfLines={1}>
              {currentChapterData.title}
            </Text>
          </View>

          {currentPage === 0 ? (
            <Text style={[styles.pageTitle, { color: palette.text }]}>{currentChapterData.title}</Text>
          ) : null}

          {pageBlocks.map(renderBlock)}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: palette.bg,
            borderTopColor: palette.border,
            paddingBottom: Math.max(12, insets.bottom),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.navBtn,
            { backgroundColor: palette.surface, borderColor: palette.border },
            atStart && styles.navDisabled,
          ]}
          onPress={prevPage}
          disabled={atStart}
        >
          <Feather name="chevron-left" size={18} color={palette.text} />
          <Text style={[styles.navBtnText, { color: palette.text }]}>Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtnPrimary, { backgroundColor: palette.accent }, atEnd && styles.navDisabled]}
          onPress={nextPage}
          disabled={atEnd}
        >
          <Text style={[styles.navBtnPrimaryText, { color: palette.accentText }]}>
            {atEnd ? 'Done' : currentPage === pages.length - 1 ? 'Next chapter' : 'Next'}
          </Text>
          {!atEnd ? <Feather name="chevron-right" size={18} color={palette.accentText} /> : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  iconBtn: { padding: 8, borderRadius: 10 },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  headerEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  headerTitle: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  controlsPanel: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlsLabel: { fontSize: 13, fontWeight: '600' },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  controlChip: {
    minWidth: 40,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  controlValue: { fontSize: 15, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  chapterNavWrap: { paddingTop: 10 },
  chapterNavContent: { paddingHorizontal: 16, gap: 8 },
  chapterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 200,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    gap: 8,
  },
  chapterChipIndex: { fontSize: 11, fontWeight: '800' },
  chapterChipText: { fontSize: 12, fontWeight: '600', flexShrink: 1 },
  progressTrackWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4, gap: 6 },
  progressTrack: { height: 4, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  progressMeta: { fontSize: 11, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 24 },
  pageCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    minHeight: 420,
  },
  pageKicker: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  pageKickerText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, flexShrink: 1 },
  pageKickerDot: { width: 4, height: 4, borderRadius: 2 },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.3,
    marginBottom: 18,
  },
  headingWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 18, marginBottom: 10 },
  headingWrapPrimary: { marginTop: 8 },
  sectionIndex: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sectionIndexText: { fontSize: 12, fontWeight: '800' },
  h1: { fontSize: 20, fontWeight: '800', lineHeight: 26, letterSpacing: -0.2 },
  h2: { fontSize: 17, fontWeight: '700', lineHeight: 24 },
  paragraphWrap: { marginBottom: 14 },
  listWrap: { marginBottom: 14, gap: 10 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletDot: { width: 7, height: 7, borderRadius: 4, marginTop: 8 },
  bulletText: { flex: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBadgeText: { fontSize: 12, fontWeight: '800' },
  callout: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
    marginBottom: 14,
  },
  calloutHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  calloutIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  calloutTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  calloutItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  calloutBullet: { fontSize: 14, fontWeight: '800', marginTop: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  navBtnText: { fontSize: 14, fontWeight: '700' },
  navBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  navBtnPrimaryText: { fontSize: 14, fontWeight: '800' },
  navDisabled: { opacity: 0.4 },
});
