import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { DEFAULT_CATEGORIES } from "./productsService";
import { BANNER, C, LOGO, MAX_W, ND, norm } from "./theme";
import ProductCard from "./ProductCard";
import { FadeIn, PressableScale, RemoteImage, Skeleton } from "./ui";

const SORTS = [
  { key: "recent", label: "Recentes", icon: "time-outline" },
  { key: "low", label: "Menor preço", icon: "arrow-down-outline" },
  { key: "high", label: "Maior preço", icon: "arrow-up-outline" },
  { key: "az", label: "A–Z", icon: "text-outline" },
];

const PERKS = [
  { icon: "cube-outline", title: "Frete grátis", sub: "acima de R$ 500" },
  { icon: "refresh-outline", title: "Troca fácil", sub: "em até 30 dias" },
  { icon: "shield-checkmark-outline", title: "Compra segura", sub: "dados protegidos" },
];

export default function ShopScreen({
  products,
  loading,
  loadError,
  favorites,
  onToggleFav,
  onAdd,
  onOpenProduct,
  onOpenAdmin,
  isAdmin,
  bottomSpace,
}) {
  const { width } = useWindowDimensions();
  const W = Math.min(width, MAX_W);
  const cardWidth = (W - 16 * 2 - 12) / 2;

  const scrollRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const catalogY = useRef(0);

  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");

  const categories = useMemo(() => {
    const extra = products.map((p) => p.category).filter(Boolean);
    return ["Todos", ...new Set([...DEFAULT_CATEGORIES, ...extra])];
  }, [products]);

  const visible = useMemo(() => {
    const q = norm(query.trim());
    let list = products.filter((p) => {
      if (category !== "Todos" && p.category !== category) return false;
      if (!q) return true;
      return norm(`${p.name} ${p.type} ${p.category} ${p.detail}`).includes(q);
    });
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "az")
      list = [...list].sort((a, b) => norm(a.name).localeCompare(norm(b.name)));
    return list;
  }, [products, category, query, sort]);

  const scrollToCatalog = () =>
    scrollRef.current?.scrollTo({ y: catalogY.current - 8, animated: true });

  const heroTranslate = scrollY.interpolate({
    inputRange: [-200, 0, 360],
    outputRange: [-60, 0, 110],
    extrapolate: "clamp",
  });
  const heroScale = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [1.4, 1],
    extrapolate: "clamp",
  });

  const filtering = query.trim() !== "" || category !== "Todos";

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <View style={s.headerWrap}>
        <View style={[s.header, { width: W }]}>
          <RemoteImage uri={LOGO} style={s.logo} resizeMode="contain" />
          <View style={{ marginLeft: 10 }}>
            <Text style={s.brand}>CHARLIE BROWN</Text>
            <Text style={s.brandSub}>SKATES</Text>
          </View>
          <PressableScale
            onPress={onOpenAdmin}
            scaleTo={0.9}
            containerStyle={{ marginLeft: "auto" }}
            style={[s.adminBtn, isAdmin && s.adminBtnOn]}
            accessibilityLabel="Área do administrador"
          >
            <Ionicons
              name={isAdmin ? "shield-checkmark" : "lock-closed-outline"}
              size={19}
              color={isAdmin ? C.accent : C.muted}
            />
          </PressableScale>
        </View>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: ND },
        )}
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: bottomSpace,
        }}
      >
        <View style={{ width: W }}>
          <View style={s.hero}>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { transform: [{ translateY: heroTranslate }, { scale: heroScale }] },
              ]}
            >
              <RemoteImage uri={BANNER} style={{ width: "100%", height: "100%" }} />
            </Animated.View>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.25)" }]} />
            <View style={s.heroShade1} />
            <View style={s.heroShade2} />
            <View style={s.heroContent}>
              <View style={s.heroPill}>
                <View style={s.dot} />
                <Text style={s.heroPillText}>DESDE 1994 · SÃO PAULO</Text>
              </View>
              <Text style={s.heroTitle}>FEITO{"\n"}PARA ANDAR.</Text>
              <Text style={s.heroDesc}>
                Equipamentos, peças e atitude para quem transforma a rua em pista.
              </Text>
              <PressableScale
                onPress={scrollToCatalog}
                style={s.heroCta}
                containerStyle={{ alignSelf: "flex-start", marginTop: 16 }}
              >
                <Text style={s.heroCtaText}>VER COLEÇÃO</Text>
                <Ionicons name="arrow-down" size={16} color="#fff" />
              </PressableScale>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.perks}
          >
            {PERKS.map((p) => (
              <View key={p.title} style={s.perk}>
                <View style={s.perkIcon}>
                  <Ionicons name={p.icon} size={18} color={C.accent} />
                </View>
                <View>
                  <Text style={s.perkTitle}>{p.title}</Text>
                  <Text style={s.perkSub}>{p.sub}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View
            style={s.catalogHeader}
            onLayout={(e) => (catalogY.current = e.nativeEvent.layout.y)}
          >
            <Text style={s.kicker}>SELEÇÃO DA CASA</Text>
            <Text style={s.sectionTitle}>O essencial para o rolê.</Text>
          </View>

          <View style={s.search}>
            <Ionicons name="search" size={18} color={C.dim} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar shape, rodas, truck..."
              placeholderTextColor={C.dim}
              style={s.searchInput}
              returnKeyType="search"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color={C.dim} />
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chips}
          >
            {categories.map((item) => {
              const on = category === item;
              return (
                <PressableScale
                  key={item}
                  onPress={() => setCategory(item)}
                  scaleTo={0.93}
                  style={[s.chip, on && s.chipOn]}
                >
                  <Text style={[s.chipText, on && s.chipTextOn]}>{item}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>

          <View style={s.sortRow}>
            <Text style={s.counter}>
              {visible.length} {visible.length === 1 ? "produto" : "produtos"}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}
              style={{ flexGrow: 0 }}
            >
              {SORTS.map((o) => {
                const on = sort === o.key;
                return (
                  <Pressable
                    key={o.key}
                    onPress={() => setSort(o.key)}
                    style={[s.sortBtn, on && s.sortBtnOn]}
                  >
                    <Text style={[s.sortText, on && s.sortTextOn]}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {loading && (
            <View style={s.grid}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ width: cardWidth }}>
                  <Skeleton style={{ height: cardWidth * 1.12 }} />
                  <Skeleton style={{ height: 12, width: "60%", marginTop: 12, borderRadius: 6 }} />
                  <Skeleton style={{ height: 16, marginTop: 8, borderRadius: 6 }} />
                </View>
              ))}
            </View>
          )}

          {!loading && !!loadError && (
            <View style={s.state}>
              <Ionicons name="cloud-offline-outline" size={40} color={C.dim} />
              <Text style={s.stateTitle}>Não foi possível carregar</Text>
              <Text style={s.stateText}>
                Verifique sua conexão e as regras do Firestore.
              </Text>
            </View>
          )}

          {!loading && !loadError && visible.length === 0 && (
            <View style={s.state}>
              <Ionicons name="search-outline" size={40} color={C.dim} />
              <Text style={s.stateTitle}>
                {filtering ? "Nada encontrado" : "Nenhum produto por aqui ainda."}
              </Text>
              {filtering && (
                <>
                  <Text style={s.stateText}>
                    Tente outro termo ou categoria.
                  </Text>
                  <PressableScale
                    onPress={() => {
                      setQuery("");
                      setCategory("Todos");
                    }}
                    style={s.clearBtn}
                  >
                    <Text style={s.clearText}>LIMPAR FILTROS</Text>
                  </PressableScale>
                </>
              )}
            </View>
          )}

          {!loading && (
            <View style={s.grid} key={`${category}-${sort}-${query}`}>
              {visible.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  width={cardWidth}
                  fav={favorites.includes(product.id)}
                  onToggleFav={() => onToggleFav(product.id)}
                  onAdd={() => onAdd(product.id, 1)}
                  onOpen={() => onOpenProduct(product)}
                />
              ))}
            </View>
          )}

          <FadeIn>
            <View style={s.manifesto}>
              <Text style={s.kicker}>CHARLIE BROWN SKATES</Text>
              <Text style={s.manifestoText}>
                Não é só sobre chegar. É sobre{" "}
                <Text style={{ color: C.accent }}>como você anda.</Text>
              </Text>
            </View>
          </FadeIn>

          <View style={s.footer}>
            <RemoteImage uri={LOGO} style={s.footerLogo} resizeMode="contain" />
            <Text style={s.footerText}>Rua Augusta, 1274 · São Paulo, SP</Text>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  headerWrap: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c1c",
    backgroundColor: C.bg,
    zIndex: 5,
  },
  header: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: { width: 48, height: 48 },
  brand: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  brandSub: { color: C.accent, fontSize: 14, fontWeight: "900", letterSpacing: 3 },
  adminBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  adminBtnOn: { borderColor: C.accent, backgroundColor: C.accentSoft },

  hero: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 400,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: C.surface,
  },
  heroShade1: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  heroShade2: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "42%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  heroContent: { position: "absolute", left: 22, right: 22, bottom: 22 },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent },
  heroPillText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  heroTitle: {
    color: "#fff",
    fontSize: 44,
    lineHeight: 46,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 14,
  },
  heroDesc: {
    color: "#d4d4d4",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 300,
  },
  heroCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.accent,
    paddingHorizontal: 22,
    height: 46,
    borderRadius: 23,
  },
  heroCtaText: { color: "#fff", fontWeight: "900", letterSpacing: 1.2, fontSize: 12 },

  perks: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  perk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  perkIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  perkTitle: { color: "#fff", fontSize: 13, fontWeight: "800" },
  perkSub: { color: C.muted, fontSize: 11, marginTop: 1 },

  catalogHeader: { paddingHorizontal: 22, paddingTop: 22 },
  kicker: { color: C.accent, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  sectionTitle: { color: "#fff", fontSize: 28, fontWeight: "900", marginTop: 8 },

  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 15, ...Platform.select({ web: { outlineStyle: "none" } }) },
  chips: { paddingHorizontal: 16, paddingTop: 14, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: C.surface,
  },
  chipOn: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { color: "#aaa", fontWeight: "800", fontSize: 12 },
  chipTextOn: { color: "#fff" },

  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 10,
  },
  counter: { color: C.muted, fontSize: 12, fontWeight: "700" },
  sortBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
  },
  sortBtnOn: { backgroundColor: C.surface2 },
  sortText: { color: C.dim, fontSize: 11, fontWeight: "800" },
  sortTextOn: { color: "#fff" },

  grid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    rowGap: 14,
  },
  state: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 30 },
  stateTitle: { color: "#fff", fontSize: 18, fontWeight: "900", marginTop: 14 },
  stateText: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 6,
  },
  clearBtn: {
    marginTop: 18,
    paddingHorizontal: 20,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: { color: C.accent, fontWeight: "900", fontSize: 12, letterSpacing: 1 },

  manifesto: {
    margin: 16,
    marginTop: 28,
    padding: 24,
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  manifestoText: {
    color: "#fff",
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
    marginTop: 12,
  },
  footer: { padding: 25, alignItems: "center" },
  footerLogo: { width: 64, height: 64, opacity: 0.9 },
  footerText: { color: "#777", marginTop: 10, fontSize: 12 },
});
