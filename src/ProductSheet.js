import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, money } from "./theme";
import {
  BottomSheet,
  HeartButton,
  PressableScale,
  RemoteImage,
} from "./ui";

export default function ProductSheet({
  product,
  onClose,
  fav,
  onToggleFav,
  onAdd,
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [qty, setQty] = useState(1);

  const last = useRef(product);
  if (product) last.current = product;
  const p = product || last.current;

  useEffect(() => setQty(1), [product?.id]);

  return (
    <BottomSheet visible={!!product} onClose={onClose}>
      {p && (
        <View
          style={[
            s.sheet,
            { maxHeight: height * 0.92, paddingBottom: 18 + insets.bottom },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View style={s.imageWrap}>
              <RemoteImage uri={p.image} style={s.image} />
              <View style={s.shade} />
              <View style={s.grabber} />
              <HeartButton
                active={fav}
                onPress={onToggleFav}
                size={22}
                style={s.heartPos}
              />
              <PressableScale
                onPress={onClose}
                scaleTo={0.9}
                style={s.closeBtn}
                containerStyle={s.closePos}
                accessibilityLabel="Fechar"
              >
                <Ionicons name="close" size={22} color="#fff" />
              </PressableScale>
            </View>

            <View style={s.body}>
              <View style={s.tags}>
                {!!p.category && (
                  <View style={s.tag}>
                    <Text style={s.tagText}>{p.category.toUpperCase()}</Text>
                  </View>
                )}
                {!!p.type && <Text style={s.type}>{p.type.toUpperCase()}</Text>}
              </View>
              <Text style={s.title}>{p.name}</Text>
              <Text style={s.price}>{money(p.price)}</Text>
              {!!p.detail && <Text style={s.detail}>{p.detail}</Text>}
            </View>
          </ScrollView>

          <View style={s.footer}>
            <View style={s.stepper}>
              <PressableScale
                onPress={() => setQty((q) => Math.max(1, q - 1))}
                scaleTo={0.85}
                style={s.stepBtn}
                hitSlop={6}
              >
                <Ionicons name="remove" size={18} color="#fff" />
              </PressableScale>
              <Text style={s.qty}>{qty}</Text>
              <PressableScale
                onPress={() => setQty((q) => Math.min(99, q + 1))}
                scaleTo={0.85}
                style={s.stepBtn}
                hitSlop={6}
              >
                <Ionicons name="add" size={18} color="#fff" />
              </PressableScale>
            </View>
            <PressableScale
              onPress={() => onAdd(p.id, qty)}
              containerStyle={{ flex: 1 }}
              style={s.cta}
            >
              <Ionicons name="bag-add-outline" size={20} color="#fff" />
              <Text style={s.ctaText}>
                ADICIONAR · {money(p.price * qty)}
              </Text>
            </PressableScale>
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  imageWrap: { height: 300, backgroundColor: C.surface2 },
  image: { width: "100%", height: "100%" },
  shade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    backgroundColor: "rgba(19,19,19,0.7)",
  },
  grabber: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  heartPos: { position: "absolute", left: 16, top: 22 },
  closePos: { position: "absolute", right: 16, top: 22 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 22, paddingBottom: 10 },
  tags: { flexDirection: "row", alignItems: "center", gap: 10 },
  tag: {
    backgroundColor: C.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagText: { color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  type: { color: C.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: "#fff", fontSize: 28, fontWeight: "900", marginTop: 12 },
  price: { color: C.accent, fontSize: 24, fontWeight: "900", marginTop: 6 },
  detail: { color: "#bdbdbd", fontSize: 15, lineHeight: 23, marginTop: 14 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface2,
    borderRadius: 28,
    padding: 4,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: {
    color: "#fff",
    width: 28,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
  cta: {
    height: 52,
    borderRadius: 26,
    backgroundColor: C.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: { color: "#fff", fontWeight: "900", letterSpacing: 0.8, fontSize: 13 },
});
