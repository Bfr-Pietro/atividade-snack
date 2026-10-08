import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, FREE_SHIPPING_FROM, money, ND } from "./theme";
import { BottomSheet, PressableScale, RemoteImage } from "./ui";

function ShippingBar({ total }) {
  const pct = Math.min(1, total / FREE_SHIPPING_FROM);
  const v = useRef(new Animated.Value(pct)).current;
  useEffect(() => {

    Animated.timing(v, { toValue: pct, duration: 400, useNativeDriver: false }).start();
  }, [pct, v]);
  const missing = FREE_SHIPPING_FROM - total;
  return (
    <View style={s.ship}>
      <View style={s.shipRow}>
        <Ionicons
          name={missing <= 0 ? "checkmark-circle" : "cube-outline"}
          size={18}
          color={missing <= 0 ? C.success : C.accent}
        />
        <Text style={s.shipText}>
          {missing <= 0
            ? "Você ganhou frete grátis!"
            : `Faltam ${money(missing)} para o frete grátis`}
        </Text>
      </View>
      <View style={s.track}>
        <Animated.View
          style={[
            s.fill,
            {
              backgroundColor: missing <= 0 ? C.success : C.accent,
              width: v.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

function SuccessView({ onClose }) {
  const sc = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(sc, { toValue: 1, friction: 5, useNativeDriver: ND }).start();
  }, [sc]);
  return (
    <View style={s.center}>
      <Animated.View style={[s.successIcon, { transform: [{ scale: sc }] }]}>
        <Ionicons name="checkmark" size={44} color="#fff" />
      </Animated.View>
      <Text style={s.emptyTitle}>Pedido finalizado!</Text>
      <Text style={s.emptyText}>
        Obrigado pela compra. Agora é só aguardar e bora pro rolê.
      </Text>
      <PressableScale onPress={onClose} style={s.cta} containerStyle={s.ctaWrap}>
        <Text style={s.ctaText}>CONTINUAR COMPRANDO</Text>
      </PressableScale>
    </View>
  );
}

export default function CartSheet({
  visible,
  onClose,
  lines,
  total,
  onChangeQty,
  onRemove,
  onCheckout,
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => setDone(false), 300);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const count = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View
        style={[
          s.sheet,
          { maxHeight: height * 0.88, paddingBottom: 18 + insets.bottom },
        ]}
      >
        <View style={s.grabber} />
        <View style={s.header}>
          <View>
            <Text style={s.kicker}>MINHA</Text>
            <Text style={s.title}>SACOLA{count > 0 ? ` (${count})` : ""}</Text>
          </View>
          <PressableScale
            onPress={onClose}
            scaleTo={0.9}
            style={s.closeBtn}
            accessibilityLabel="Fechar sacola"
          >
            <Ionicons name="close" size={22} color="#fff" />
          </PressableScale>
        </View>

        {done ? (
          <SuccessView onClose={onClose} />
        ) : lines.length === 0 ? (
          <View style={s.center}>
            <View style={s.emptyIcon}>
              <Ionicons name="bag-handle-outline" size={40} color={C.accent} />
            </View>
            <Text style={s.emptyTitle}>Sua sacola está vazia.</Text>
            <Text style={s.emptyText}>
              Adicione um produto para começar o rolê.
            </Text>
            <PressableScale onPress={onClose} style={s.cta} containerStyle={s.ctaWrap}>
              <Text style={s.ctaText}>VER PRODUTOS</Text>
            </PressableScale>
          </View>
        ) : (
          <>
            <ShippingBar total={total} />
            <ScrollView
              style={{ flexGrow: 0 }}
              showsVerticalScrollIndicator={false}
            >
              {lines.map(({ product: p, quantity }) => (
                <View key={p.id} style={s.item}>
                  <RemoteImage uri={p.image} style={s.itemImage} />
                  <View style={s.itemInfo}>
                    <Text style={s.itemName} numberOfLines={2}>
                      {p.name}
                    </Text>
                    <Text style={s.itemPrice}>{money(p.price)}</Text>
                    <View style={s.stepper}>
                      <PressableScale
                        onPress={() => onChangeQty(p.id, -1)}
                        scaleTo={0.85}
                        style={s.stepBtn}
                        hitSlop={6}
                      >
                        <Ionicons name="remove" size={16} color="#fff" />
                      </PressableScale>
                      <Text style={s.qty}>{quantity}</Text>
                      <PressableScale
                        onPress={() => onChangeQty(p.id, 1)}
                        scaleTo={0.85}
                        style={s.stepBtn}
                        hitSlop={6}
                      >
                        <Ionicons name="add" size={16} color="#fff" />
                      </PressableScale>
                    </View>
                  </View>
                  <PressableScale
                    onPress={() => onRemove(p.id)}
                    scaleTo={0.85}
                    style={s.trash}
                    accessibilityLabel={`Remover ${p.name}`}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={20} color={C.dim} />
                  </PressableScale>
                </View>
              ))}
            </ScrollView>

            <View style={s.summary}>
              <View style={s.sumRow}>
                <Text style={s.sumLabel}>Frete</Text>
                <Text style={s.sumValue}>
                  {total >= FREE_SHIPPING_FROM ? "Grátis" : "Calculado depois"}
                </Text>
              </View>
              <View style={s.sumRow}>
                <Text style={s.totalLabel}>TOTAL</Text>
                <Text style={s.total}>{money(total)}</Text>
              </View>
              <PressableScale
                onPress={() => {
                  onCheckout();
                  setDone(true);
                }}
                style={s.cta}
                containerStyle={{ marginTop: 6 }}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#fff" />
                <Text style={s.ctaText}>FINALIZAR PEDIDO</Text>
              </PressableScale>
            </View>
          </>
        )}
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  grabber: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#333",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  kicker: { color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#fff", fontSize: 26, fontWeight: "900", marginTop: 2 },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { alignItems: "center", paddingVertical: 36 },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },
  emptyText: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
    maxWidth: 280,
  },
  ctaWrap: { alignSelf: "stretch", marginTop: 24 },
  ship: {
    backgroundColor: C.surface2,
    borderRadius: 16,
    padding: 14,
    marginBottom: 6,
  },
  shipRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  shipText: { color: "#ddd", fontSize: 13, fontWeight: "700", flex: 1 },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2c2c2c",
    marginTop: 10,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 3 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  itemImage: { width: 76, height: 76, borderRadius: 14, backgroundColor: C.surface2 },
  itemInfo: { flex: 1, marginLeft: 14 },
  itemName: { color: "#fff", fontSize: 15, fontWeight: "800" },
  itemPrice: { color: C.accent, fontSize: 14, fontWeight: "800", marginTop: 3 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: C.surface2,
    borderRadius: 20,
    padding: 3,
    marginTop: 8,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  qty: {
    color: "#fff",
    width: 30,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 14,
  },
  trash: { padding: 8, marginLeft: 4 },
  summary: { paddingTop: 14 },
  sumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sumLabel: { color: C.muted, fontSize: 13, fontWeight: "700" },
  sumValue: { color: "#ddd", fontSize: 13, fontWeight: "700" },
  totalLabel: { color: C.muted, fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  total: { color: "#fff", fontSize: 26, fontWeight: "900" },
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
