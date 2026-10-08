import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BackHandler, Platform, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C } from "./theme";
import ShopScreen from "./ShopScreen";
import FavoritesScreen from "./FavoritesScreen";
import ProductSheet from "./ProductSheet";
import CartSheet from "./CartSheet";
import TabBar, { TAB_BAR_HEIGHT } from "./TabBar";
import { Toast } from "./ui";

export default function Main({
  products,
  loading,
  loadError,
  cart,
  setCart,
  favorites,
  setFavorites,
  onOpenAdmin,
  isAdmin,
}) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState("shop");
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback(
    (text, icon, color) =>
      setToast({ id: Date.now() + Math.random(), text, icon, color }),
    [],
  );

  useEffect(() => {
    if (Platform.OS === "web") return undefined;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (tab === "favorites") {
        setTab("shop");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [tab]);

  const byId = useMemo(() => {
    const map = {};
    products.forEach((p) => (map[p.id] = p));
    return map;
  }, [products]);

  const lines = useMemo(
    () =>
      cart
        .map((c) => ({ product: byId[c.id], quantity: c.quantity }))
        .filter((l) => l.product),
    [cart, byId],
  );
  const cartCount = lines.reduce((n, l) => n + l.quantity, 0);
  const cartTotal = lines.reduce(
    (n, l) => n + l.product.price * l.quantity,
    0,
  );

  const favItems = useMemo(
    () => favorites.map((id) => byId[id]).filter(Boolean),
    [favorites, byId],
  );

  const addToCart = useCallback(
    (id, qty = 1) => {
      setCart((current) =>
        current.some((c) => c.id === id)
          ? current.map((c) =>
              c.id === id ? { ...c, quantity: c.quantity + qty } : c,
            )
          : [...current, { id, quantity: qty }],
      );
      setSelected(null);
      notify("Adicionado à sacola", "bag-check");
    },
    [setCart, notify],
  );

  const changeQty = (id, amount) =>
    setCart((current) =>
      current.flatMap((c) => {
        if (c.id !== id) return [c];
        const quantity = c.quantity + amount;
        return quantity > 0 ? [{ ...c, quantity }] : [];
      }),
    );
  const removeFromCart = (id) =>
    setCart((current) => current.filter((c) => c.id !== id));

  const toggleFavorite = useCallback(
    (id) => {
      const isFav = favorites.includes(id);
      setFavorites((current) =>
        current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      );
      notify(
        isFav ? "Removido dos favoritos" : "Salvo nos favoritos",
        isFav ? "heart-dislike" : "heart",
        C.accent,
      );
    },
    [favorites, setFavorites, notify],
  );

  const addAllFavorites = () => {
    setCart((current) => {
      const next = [...current];
      favItems.forEach((p) => {
        const i = next.findIndex((c) => c.id === p.id);
        if (i >= 0) next[i] = { ...next[i], quantity: next[i].quantity + 1 };
        else next.push({ id: p.id, quantity: 1 });
      });
      return next;
    });
    notify(`${favItems.length} itens na sacola`, "bag-check");
  };

  const bottomSpace = TAB_BAR_HEIGHT + Math.max(insets.bottom, 12) + 28;
  const toastBottom = TAB_BAR_HEIGHT + Math.max(insets.bottom, 12) + 14;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />

      {tab === "shop" ? (
        <ShopScreen
          products={products}
          loading={loading}
          loadError={loadError}
          favorites={favorites}
          onToggleFav={toggleFavorite}
          onAdd={addToCart}
          onOpenProduct={setSelected}
          onOpenAdmin={onOpenAdmin}
          isAdmin={isAdmin}
          bottomSpace={bottomSpace}
        />
      ) : (
        <FavoritesScreen
          items={favItems}
          onToggleFav={toggleFavorite}
          onAdd={addToCart}
          onAddAll={addAllFavorites}
          onOpenProduct={setSelected}
          onExplore={() => setTab("shop")}
          bottomSpace={bottomSpace}
        />
      )}

      <TabBar
        tab={tab}
        onChange={setTab}
        favCount={favItems.length}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <Toast toast={toast} bottom={toastBottom} />

      <ProductSheet
        product={selected}
        onClose={() => setSelected(null)}
        fav={selected ? favorites.includes(selected.id) : false}
        onToggleFav={() => selected && toggleFavorite(selected.id)}
        onAdd={addToCart}
      />

      <CartSheet
        visible={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={lines}
        total={cartTotal}
        onChangeQty={changeQty}
        onRemove={removeFromCart}
        onCheckout={() => setCart([])}
      />
    </View>
  );
}
