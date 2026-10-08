import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, money } from "./theme";
import { FadeIn, HeartButton, PressableScale, RemoteImage } from "./ui";

export default function ProductCard({
  product,
  width,
  index = 0,
  fav,
  onToggleFav,
  onAdd,
  onOpen,
}) {
  return (
    <FadeIn delay={Math.min(index, 10) * 55} style={{ width }}>
      <PressableScale onPress={onOpen} scaleTo={0.97} style={s.card}>
        <View style={[s.imageWrap, { height: width * 1.12 }]}>
          <RemoteImage uri={product.image} style={s.image} />
          {!!product.category && (
            <View style={s.pill}>
              <Text style={s.pillText}>{product.category.toUpperCase()}</Text>
            </View>
          )}
          <HeartButton
            active={fav}
            onPress={onToggleFav}
            style={s.heartPos}
          />
        </View>
        <View style={s.body}>
          <Text style={s.type} numberOfLines={1}>
            {(product.type || product.category || "").toUpperCase()}
          </Text>
          <Text style={s.name} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={s.row}>
            <Text style={s.price}>{money(product.price)}</Text>
            <PressableScale
              onPress={onAdd}
              scaleTo={0.85}
              style={s.addBtn}
              accessibilityLabel={`Adicionar ${product.name} à sacola`}
              hitSlop={6}
            >
              <Ionicons name="add" size={22} color="#fff" />
            </PressableScale>
          </View>
        </View>
      </PressableScale>
    </FadeIn>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  imageWrap: { backgroundColor: C.surface2 },
  image: { width: "100%", height: "100%" },
  pill: {
    position: "absolute",
    left: 10,
    top: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  pillText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  heartPos: { position: "absolute", right: 10, top: 10 },
  body: { padding: 12, paddingTop: 11 },
  type: { color: C.accent, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  name: {
    color: C.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
    minHeight: 38,
    lineHeight: 19,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  price: { color: "#fff", fontSize: 16, fontWeight: "900" },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
