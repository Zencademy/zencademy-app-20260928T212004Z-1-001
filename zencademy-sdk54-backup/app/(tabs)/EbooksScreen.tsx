import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Dimensions, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { SafeAreaView } from "react-native-safe-area-context";
import { useXP } from "../../components/XPContext";

const EBOOKS = [
  {
    id: "focus-mastery",
    title: "Focus Mastery",
    category: "Focus",
    level: 2,
    xp: 800,
    desc: "Blueprint to unstoppable concentration.",
    link: "https://drive.google.com/your-ebook1",
    paid: false,
  },
  {
    id: "discipline-blueprint",
    title: "Discipline Blueprint",
    category: "Discipline",
    level: 5,
    xp: 2500,
    desc: "Step-by-step guide to high performer discipline.",
    link: "https://drive.google.com/your-ebook2",
    paid: false,
  },
  // Categorie specială:
  {
    id: "elite-mindset",
    title: "Elite Mindset",
    category: "Life-Changing",
    xpUnlock: 7000,
    desc: "Rewire your thinking forever with this legendary ebook.",
    link: "https://drive.google.com/lifechanging1",
    paid: false,
    lifechanging: true,
  },
  {
    id: "resilience-ultimate",
    title: "Ultimate Resilience",
    category: "Life-Changing",
    xpUnlock: 9000,
    desc: "Unlock unstoppable mental power. Life will never be the same.",
    link: "https://drive.google.com/lifechanging2",
    paid: false,
    lifechanging: true,
  },
  // alte ebooks normale...
  {
    id: "productivity-hacks",
    title: "Productivity Hacks",
    category: "Productivity",
    level: 8,
    xp: 4100,
    desc: "Maximize your output with science-backed habits.",
    link: "https://drive.google.com/your-ebook3",
    paid: false,
  },
];

const { width } = Dimensions.get("window");
const CARD_WIDTH = width > 750 ? (width - 100) / 3 : (width - 36);

export default function EbooksScreen() {
  const router = useRouter();
  const { xp, level, setXP } = useXP();

  // Search & category
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [unlocked, setUnlocked] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [unlocking, setUnlocking] = useState(null);

  // Extrage categorii, cu Life-Changing mereu prima după All:
  const categories = useMemo(() => {
    const all = Array.from(new Set(EBOOKS.map(e => e.category).filter(Boolean)));
    const lcIdx = all.indexOf("Life-Changing");
    if (lcIdx !== -1) all.splice(lcIdx, 1);
    return ["All", "Life-Changing", ...all];
  }, []);

  // Filtrare
  const ebooksFiltered = EBOOKS.filter(e => {
    const matchesCategory = category === "All" || e.category === category;
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || (e.desc && e.desc.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Confetti
  const handleUnlock = (id, xpCost) => {
    if (xpCost && xp < xpCost) {
      return; // Butonul e deja dezactivat când nu ai xp
    }
    if (xpCost) setXP(xp - xpCost);
    setUnlocked(u => ({ ...u, [id]: true }));
    setUnlocking(id);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
    setTimeout(() => setUnlocking(null), 1700);
  };

  // XP Bar (subtil)
  const xpTotal = 20000;
  const xpPercent = Math.min(1, xp / xpTotal);

  return (
    <SafeAreaView style={styles.safe}>
      {showConfetti && (
        <ConfettiCannon
          count={60}
          origin={{ x: width / 2, y: 0 }}
          fadeOut
          explosionSpeed={430}
          fallSpeed={1600}
          colors={["#fbbf24", "#111", "#fff"]}
        />
      )}

      {/* Header: sageata back + titlu + search, aliniate */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={18}>
          <Ionicons name="arrow-back-outline" size={25} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ZENCADEMY</Text>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#111" style={{ marginLeft: 8, marginRight: 3 }} />
          <TextInput
            placeholder="Search ebooks..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#666"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* XP Bar Subtil */}
      <View style={styles.xpBarRow}>
        <Text style={styles.xpBarLabel}>XP</Text>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: `${xpPercent * 100}%` }]} />
        </View>
        <Text style={styles.xpBarVal}>{xp} XP</Text>
      </View>

      {/* Categorii */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: "row" }}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryBtn,
                category === cat && (cat === "Life-Changing" ? styles.catSpecialActive : styles.categoryBtnActive),
                cat === "Life-Changing" && styles.catSpecial,
              ]}
            >
              <Text style={[
                styles.categoryBtnText,
                category === cat && (cat === "Life-Changing" ? styles.catSpecialTextActive : styles.categoryBtnTextActive),
                cat === "Life-Changing" && styles.catSpecialText,
              ]}>
                {cat === "Life-Changing" ? "🌟 Life-Changing" : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista Ebookuri */}
      <ScrollView contentContainerStyle={styles.gridWrap}>
        {ebooksFiltered.length === 0 && (
          <Text style={styles.emptyText}>No ebooks found.</Text>
        )}
        {ebooksFiltered.map(ebook => {
          const isLifeChanging = !!ebook.lifechanging || ebook.category === "Life-Changing";
          const alreadyUnlocked =
            unlocked[ebook.id] ||
            (isLifeChanging
              ? false
              : (level > (ebook.level || 0) || (level === ebook.level && xp >= (ebook.xp || 0)))
            );

          const canUnlock =
            !alreadyUnlocked && (
              isLifeChanging
                ? (xp >= (ebook.xpUnlock || 0))
                : (level > (ebook.level || 0) || (level === ebook.level && xp >= (ebook.xp || 0)))
            );

          return (
            <View
              key={ebook.id}
              style={[
                styles.ebookCard,
                isLifeChanging && styles.specialCard,
                alreadyUnlocked && styles.cardUnlocked,
                !alreadyUnlocked && styles.cardLocked,
                unlocking === ebook.id && { borderColor: "#fbbf24", borderWidth: 2.3, shadowColor: "#fbbf24", shadowOpacity: 0.19 },
              ]}
            >
              {isLifeChanging && (
                <View style={styles.bannerSpecial}>
                  <Text style={styles.specialBannerText}>
                    🌟 Life-Changing Ebook
                  </Text>
                </View>
              )}
              <Text style={styles.ebookTitle}>{ebook.title}</Text>
              <Text style={styles.ebookDesc}>{ebook.desc}</Text>
              {isLifeChanging && (
                <View style={styles.lifechangeBanner}>
                  <Text style={styles.lifechangeBannerText}>
                    Need <Text style={{ fontWeight: "bold" }}>{ebook.xpUnlock} XP</Text> to unlock
                  </Text>
                </View>
              )}

              {!alreadyUnlocked && !isLifeChanging && (
                <View style={styles.progressBarWrap}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, {
                      width:
                        level > (ebook.level || 0)
                          ? "100%"
                          : level < (ebook.level || 0)
                            ? "0%"
                            : `${Math.min(1, xp / (ebook.xp || 1)) * 100}%`
                    }]} />
                  </View>
                  <Text style={styles.progressBarText}>
                    {level < (ebook.level || 0)
                      ? `Level ${ebook.level} required`
                      : level === ebook.level
                        ? `${xp}/${ebook.xp} XP`
                        : "Ready to unlock"}
                  </Text>
                </View>
              )}

              {/* Buton unlock */}
              {!alreadyUnlocked && canUnlock && (
                <TouchableOpacity
                  style={isLifeChanging ? styles.unlockSpecialBtn : styles.unlockBtn}
                  onPress={() => handleUnlock(ebook.id, ebook.xpUnlock)}
                  activeOpacity={0.82}
                >
                  <Ionicons name="lock-open-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.unlockBtnText}>{isLifeChanging ? "Unlock Now" : "Unlock"}</Text>
                </TouchableOpacity>
              )}
              {/* Buton disabled dacă nu ai XP */}
              {!alreadyUnlocked && isLifeChanging && !canUnlock && (
                <View style={styles.disabledUnlockBtn}>
                  <Ionicons name="lock-closed-outline" size={18} color="#fff" style={{ marginRight: 8, opacity: 0.5 }} />
                  <Text style={styles.unlockBtnText}>Not enough XP</Text>
                </View>
              )}
              {alreadyUnlocked && (
                <TouchableOpacity
                  style={styles.downloadBtn}
                  activeOpacity={0.87}
                  onPress={() => Linking.openURL(ebook.link)}
                >
                  <Ionicons name="download-outline" size={18} color="#111" style={{ marginRight: 8 }} />
                  <Text style={styles.downloadBtnText}>Download</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        <Text style={styles.footer}>More books coming soon · © 2025 ZENCADEMY</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingTop: 15,
    paddingBottom: 4,
    backgroundColor: "#fff",
    gap: 11,
  },
  backBtn: {
    backgroundColor: "#f5f5f5",
    borderRadius: 18,
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#111",
    marginRight: 10,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ededed",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: 120,
    maxWidth: 250,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111",
    paddingVertical: 7,
    paddingHorizontal: 3,
    backgroundColor: "transparent",
    fontWeight: "700",
  },
  xpBarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 7,
    marginTop: 2,
    gap: 7,
  },
  xpBarLabel: { fontSize: 13, fontWeight: "700", color: "#aaa", marginRight: 2 },
  xpBarBg: {
    flex: 1,
    height: 7,
    backgroundColor: "#f0f0f0",
    borderRadius: 7,
    marginHorizontal: 3,
    overflow: "hidden",
  },
  xpBarFill: {
    height: 7,
    backgroundColor: "#222",
    borderRadius: 7,
  },
  xpBarVal: { fontSize: 12, fontWeight: "700", color: "#888", minWidth: 68, textAlign: "right" },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 6,
    gap: 8,
    marginTop: 2,
  },
  categoryBtn: {
    backgroundColor: "#f4f4f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 7,
    marginBottom: 2,
    marginTop: 2,
  },
  categoryBtnActive: {
    backgroundColor: "#111",
  },
  categoryBtnText: {
    color: "#222",
    fontWeight: "600",
    fontSize: 14.5,
  },
  categoryBtnTextActive: {
    color: "#fff",
  },
  catSpecial: {
    backgroundColor: "#fff9e7",
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  catSpecialActive: {
    backgroundColor: "#fbbf24",
    borderColor: "#f59e42",
  },
  catSpecialText: {
    color: "#b88711",
    fontWeight: "bold",
  },
  catSpecialTextActive: {
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "#b88711",
    textShadowRadius: 1.5,
  },
  gridWrap: {
    alignItems: "center",
    width: "100%",
    paddingTop: 4,
    paddingBottom: 28,
  },
  ebookCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 19,
    alignItems: "flex-start",
    shadowColor: "#222",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.3,
    borderColor: "#eaeaea",
    width: "95%",
    alignSelf: "center",
    minHeight: 110,
    justifyContent: "center",
    position: "relative",
  },
  specialCard: {
    backgroundColor: "#fff9e7",
    borderWidth: 2,
    borderColor: "#fbbf24",
    shadowColor: "#fbbf24",
    shadowOpacity: 0.10,
    shadowRadius: 9,
  },
  bannerSpecial: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#fbbf24",
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    marginTop: -8,
    shadowColor: "#fbbf24",
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 1,
  },
  specialBannerText: {
    color: "#fff",
    fontSize: 15.5,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.7,
  },
  ebookTitle: {
    fontSize: 17.5,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
    textAlign: "left",
    letterSpacing: 0.13,
    width: "100%",
  },
  ebookDesc: {
    fontSize: 13.5,
    color: "#222",
    opacity: 0.80,
    marginBottom: 6,
    textAlign: "left",
    minHeight: 18,
    width: "100%",
  },
  progressBarWrap: {
    width: "100%",
    marginBottom: 7,
    alignItems: "flex-start",
  },
  progressBarBg: {
    width: "100%",
    height: 7,
    backgroundColor: "#ededed",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 2,
  },
  progressBarFill: {
    height: 7,
    backgroundColor: "#111",
    borderRadius: 6,
  },
  progressBarText: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 0,
    marginBottom: 0,
  },
  lifechangeBanner: {
    backgroundColor: "#fbbf24",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 7,
    marginTop: 2,
  },
  lifechangeBannerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  unlockBtn: {
    marginTop: 2,
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "flex-end",
    shadowColor: "#111",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 1,
  },
  unlockSpecialBtn: {
    marginTop: 6,
    backgroundColor: "#fbbf24",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 36,
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "flex-end",
    shadowColor: "#fbbf24",
    shadowOpacity: 0.10,
    shadowRadius: 7,
    elevation: 1,
  },
  disabledUnlockBtn: {
    marginTop: 6,
    backgroundColor: "#fae1a1",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 36,
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "flex-end",
    opacity: 0.6,
  },
  unlockBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15.5,
    letterSpacing: 0.7,
  },
  downloadBtn: {
    marginTop: 3,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: "#181818",
    paddingVertical: 9,
    paddingHorizontal: 27,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    shadowColor: "#222",
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 1,
  },
  downloadBtnText: {
    color: "#111",
    fontWeight: "bold",
    fontSize: 15.5,
    letterSpacing: 0.6,
  },
  cardLocked: { opacity: 0.72 },
  cardUnlocked: { opacity: 1, borderColor: "#7febb1", borderWidth: 1.6 },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
    marginVertical: 40,
    fontWeight: "700",
    textAlign: "center",
    opacity: 0.7,
  },
  footer: {
    color: "#b2b2b2",
    fontSize: 13,
    marginTop: 16,
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 1,
    width: "100%",
  },
});
