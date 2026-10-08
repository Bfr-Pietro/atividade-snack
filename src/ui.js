import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, MAX_W, ND } from "./theme";

export function RemoteImage({ uri, style, resizeMode = "cover" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  if (failed || !uri) {
    return (
      <View style={[style, ui.imageFallback]}>
        <Ionicons name="image-outline" size={24} color="#444" />
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}

export function PressableScale({
  children,
  style,
  containerStyle,
  scaleTo = 0.96,
  ...rest
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (value) =>
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: ND,
      speed: 40,
      bounciness: 6,
    }).start();
  return (
    <Pressable
      onPressIn={() => to(scaleTo)}
      onPressOut={() => to(1)}
      style={containerStyle}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function FadeIn({ children, delay = 0, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: ND,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [
            {
              translateY: v.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function HeartButton({ active, onPress, size = 20, style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (active) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.45,
          duration: 120,
          useNativeDriver: ND,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: ND,
        }),
      ]).start();
    }
  }, [active, scale]);
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={active ? "Remover dos favoritos" : "Favoritar"}
      style={[ui.heart, style]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={active ? "heart" : "heart-outline"}
          size={size}
          color={active ? C.accent : "#fff"}
        />
      </Animated.View>
    </Pressable>
  );
}

export function BottomSheet({ visible, onClose, children }) {
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: ND,
      }).start();
    } else if (mounted) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: ND,
      }).start(({ finished }) => finished && setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;
  return (
    <Modal
      transparent
      visible
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={ui.sheetRoot}>
        <Animated.View
          style={[StyleSheet.absoluteFill, ui.backdrop, { opacity: anim }]}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={{
            width: "100%",
            maxWidth: MAX_W,
            alignSelf: "center",
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              },
            ],
          }}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

export function Toast({ toast, bottom }) {
  const v = useRef(new Animated.Value(0)).current;
  const running = useRef(null);
  useEffect(() => {
    if (!toast) return;
    running.current?.stop();
    v.setValue(0);
    running.current = Animated.sequence([
      Animated.timing(v, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: ND,
      }),
      Animated.delay(1700),
      Animated.timing(v, { toValue: 0, duration: 220, useNativeDriver: ND }),
    ]);
    running.current.start();
  }, [toast, v]);
  if (!toast) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        ui.toastWrap,
        {
          bottom,
          opacity: v,
          transform: [
            {
              translateY: v.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={ui.toast}>
        <Ionicons
          name={toast.icon || "checkmark-circle"}
          size={20}
          color={toast.color || C.success}
        />
        <Text style={ui.toastText} numberOfLines={1}>
          {toast.text}
        </Text>
      </View>
    </Animated.View>
  );
}

export function Skeleton({ style }) {
  const v = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 0.8, duration: 700, useNativeDriver: ND }),
        Animated.timing(v, { toValue: 0.35, duration: 700, useNativeDriver: ND }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return <Animated.View style={[ui.skeleton, style, { opacity: v }]} />;
}

export const ui = StyleSheet.create({
  imageFallback: {
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  heart: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { backgroundColor: "rgba(0,0,0,0.72)" },
  toastWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1f1f1f",
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 30,
    maxWidth: 420,
  },
  toastText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  skeleton: { backgroundColor: "#222", borderRadius: 16 },
});
