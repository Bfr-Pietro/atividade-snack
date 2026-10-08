import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C } from "./theme";
import { PressableScale } from "./ui";

export const TAB_BAR_HEIGHT = 68;

function Badge({ count }) {
  if (!count) return null;
  return (
    <View style={s.badge}>
      <Text style={s.badgeText}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

function Item({ icon, iconActive, label, active, onPress, badge }) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.9}
      containerStyle={s.itemWrap}
      style={[s.item, active && s.itemActive]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View>
        <Ionicons
          name={active ? iconActive : icon}
          size={22}
          color={active ? C.accent : C.muted}
        />
        <Badge count={badge} />
      </View>
      {active && <Text style={s.label}>{label}</Text>}
    </PressableScale>
  );
}

export default function TabBar({
  tab,
  onChange,
  favCount,
  cartCount,
  onOpenCart,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={[s.wrap, { bottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={s.bar}>
        <Item
          icon="storefront-outline"
          iconActive="storefront"
          label="Loja"
          active={tab === "shop"}
          onPress={() => onChange("shop")}
        />
        <Item
          icon="heart-outline"
          iconActive="heart"
          label="Favoritos"
          active={tab === "favorites"}
          onPress={() => onChange("favorites")}
          badge={favCount}
        />
        <Item
          icon="bag-handle-outline"
          iconActive="bag-handle"
          label="Sacola"
          active={false}
          onPress={onOpenCart}
          badge={cartCount}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  bar: {
    width: "92%",
    maxWidth: 460,
    height: TAB_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    borderRadius: 34,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  itemWrap: { flex: 1, alignItems: "center" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
  },
  itemActive: { backgroundColor: C.accentSoft },
  label: { color: C.accent, fontWeight: "800", fontSize: 13 },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#151515",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "900" },
});
