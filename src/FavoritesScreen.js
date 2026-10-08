import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, MAX_W, money } from "./theme";
import { FadeIn, HeartButton, PressableScale, RemoteImage } from "./ui";

function Row({ product, index, onOpen, onToggleFav, onAdd }) {
  return (
    <FadeIn delay={Math.min(index, 8) * 60}>
      <PressableScale onPress={onOpen} scaleTo={0.98} style={s.row}>
        <RemoteImage uri={product.image} style={s.image} />
        <View style={s.info}>
          <Text style={s.type} numberOfLines={1}>
            {(product.type || product.category || "").toUpperCase()}
          </Text>
          <Text style={s.name} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={s.bottom}>
            <Text style={s.price}>{money(product.price)}</Text>
            <PressableScale
              onPress={onAdd}
              scaleTo={0.9}
              style={s.addBtn}
              accessibilityLabel={`Adicionar ${product.name} à sacola`}
            >
              <Ionicons name="bag-add-outline" size={16} color="#fff" />
              <Text style={s.addText}>SACOLA</Text>
            </PressableScale>
          </View>
        </View>
        <HeartButton
          active
          onPress={onToggleFav}
          style={s.heartPos}
        />
      </PressableScale>
    </FadeIn>
  );
}

export default function FavoritesScreen({
  items,
  onToggleFav,
  onAdd,
  onAddAll,
  onOpenProduct,
  onExplore,
  bottomSpace,
}) {
  const { width } = useWindowDimensions();
  const W = Math.min(width, MAX_W);
  const total = items.reduce((n, p) => n + p.price, 0);

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center", paddingBottom: bottomSpace }}
      >
        <View style={{ width: W, paddingHorizontal: 16 }}>
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.kicker}>SUA LISTA</Text>
              <Text style={s.title}>FAVORITOS</Text>
            </View>
            <View style={s.countPill}>
              <Ionicons name="heart" size={14} color={C.accent} />
              <Text style={s.countText}>{items.length}</Text>
            </View>
          </View>

          {items.length === 0 ? (
            <FadeIn>
              <View style={s.empty}>
                <View style={s.emptyIcon}>
                  <Ionicons name="heart-outline" size={44} color={C.accent} />
                </View>
                <Text style={s.emptyTitle}>Nenhum favorito ainda</Text>
                <Text style={s.emptyText}>
                  Toque no coração dos produtos que você curtir e eles ficam
                  guardados aqui para depois.
                </Text>
                <PressableScale
                  onPress={onExplore}
                  style={s.cta}
                  containerStyle={{ alignSelf: "stretch", marginTop: 26 }}
                >
                  <Ionicons name="storefront-outline" size={18} color="#fff" />
                  <Text style={s.ctaText}>EXPLORAR A LOJA</Text>
                </PressableScale>
              </View>
            </FadeIn>
          ) : (
            <>
              <FadeIn>
                <View style={s.summary}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sumLabel}>
                      {items.length} {items.length === 1 ? "item" : "itens"} · somados
                    </Text>
                    <Text style={s.sumValue}>{money(total)}</Text>
                  </View>
                  <PressableScale onPress={onAddAll} style={s.allBtn} scaleTo={0.94}>
                    <Ionicons name="bag-add" size={17} color="#fff" />
                    <Text style={s.allText}>ADICIONAR TODOS</Text>
                  </PressableScale>
                </View>
              </FadeIn>

              <View style={{ gap: 12, marginTop: 14 }}>
                {items.map((p, i) => (
                  <Row
                    key={p.id}
                    product={p}
                    index={i}
                    onOpen={() => onOpenProduct(p)}
                    onToggleFav={() => onToggleFav(p.id)}
                    onAdd={() => onAdd(p.id, 1)}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 22,
    paddingHorizontal: 6,
    paddingBottom: 18,
  },
  kicker: { color: C.accent, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  title: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 4,
  },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.accentSoft,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
  },
  countText: { color: C.accent, fontWeight: "900", fontSize: 14 },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 16,
  },
  sumLabel: { color: C.muted, fontSize: 12, fontWeight: "700" },
  sumValue: { color: "#fff", fontSize: 22, fontWeight: "900", marginTop: 2 },
  allBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.accent,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
  },
  allText: { color: "#fff", fontWeight: "900", fontSize: 11, letterSpacing: 0.8 },

  row: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 10,
  },
  image: { width: 108, height: 108, borderRadius: 14, backgroundColor: C.surface2 },
  info: { flex: 1, marginLeft: 14, paddingRight: 34 },
  type: { color: C.accent, fontSize: 9, fontWeight: "800", letterSpacing: 1.2, marginTop: 2 },
  name: { color: "#fff", fontSize: 16, fontWeight: "800", marginTop: 4, lineHeight: 20 },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  price: { color: "#fff", fontSize: 16, fontWeight: "900" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
  },
  addText: { color: "#fff", fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  heartPos: { position: "absolute", right: 10, top: 10, backgroundColor: "rgba(255,255,255,0.06)" },

  empty: { alignItems: "center", paddingTop: 50, paddingHorizontal: 10 },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  emptyTitle: { color: "#fff", fontSize: 22, fontWeight: "900" },
  emptyText: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 300,
  },
  cta: {
    height: 54,
    borderRadius: 27,
    backgroundColor: C.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: { color: "#fff", fontWeight: "900", letterSpacing: 1, fontSize: 13 },
});
