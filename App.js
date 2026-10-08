import React, { useEffect, useRef, useState } from "react";
import { BackHandler, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/firebase";
import { subscribeProducts } from "./src/productsService";
import AdminLoginScreen from "./src/AdminLoginScreen";
import AdminScreen from "./src/AdminScreen";
import Main from "./src/Main";

const CART_KEY = "@cbs/cart";
const FAV_KEY = "@cbs/favorites";

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

function Root() {
  const [screen, setScreen] = useState("shop");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const hydrated = useRef(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    const unsubscribe = subscribeProducts(
      (list) => {
        setProducts(list);
        setProductsError("");
        setLoadingProducts(false);
      },
      (error) => {
        setProductsError(error?.message || "Falha ao carregar os produtos.");
        setLoadingProducts(false);
      },
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [c, f] = await Promise.all([
          AsyncStorage.getItem(CART_KEY),
          AsyncStorage.getItem(FAV_KEY),
        ]);
        const cartSaved = c ? JSON.parse(c) : [];
        const favSaved = f ? JSON.parse(f) : [];
        if (Array.isArray(cartSaved)) setCart(cartSaved);
        if (Array.isArray(favSaved)) setFavorites(favSaved);
      } catch (e) {

      } finally {
        hydrated.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (hydrated.current)
      AsyncStorage.setItem(CART_KEY, JSON.stringify(cart)).catch(() => {});
  }, [cart]);
  useEffect(() => {
    if (hydrated.current)
      AsyncStorage.setItem(FAV_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites]);

  useEffect(() => {
    if (Platform.OS === "web") return undefined;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen !== "shop") {
        setScreen("shop");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [screen]);

  const openAdmin = () => setScreen(user ? "admin" : "login");

  if (screen === "login" && !user) {
    return (
      <AdminLoginScreen
        onBack={() => setScreen("shop")}
        onSuccess={() => setScreen("admin")}
      />
    );
  }
  if (screen === "admin" && user) {
    return (
      <AdminScreen
        user={user}
        products={products}
        loading={loadingProducts}
        onBack={() => setScreen("shop")}
        onLoggedOut={() => setScreen("shop")}
      />
    );
  }
  return (
    <Main
      products={products}
      loading={loadingProducts}
      loadError={productsError}
      cart={cart}
      setCart={setCart}
      favorites={favorites}
      setFavorites={setFavorites}
      onOpenAdmin={openAdmin}
      isAdmin={!!user}
    />
  );
}
