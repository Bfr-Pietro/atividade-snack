import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import {
  DEFAULT_CATEGORIES,
  deleteProduct,
  saveProduct,
} from "./productsService";
import { compressImageToBase64, formatBytes, MAX_IMAGE_BYTES } from "./imageCompressor";
import { confirmAsync } from "./confirm";

const money = (value) => `R$ ${Number(value || 0).toFixed(2).replace(".", ",")}`;

const parsePrice = (text) => {
  const clean = String(text).replace(/[^\d,.-]/g, "");

  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : NaN;
};

export default function AdminScreen({ user, products, loading, onBack, onLoggedOut }) {
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const categories = useMemo(() => {
    const extra = products.map((p) => p.category).filter(Boolean);
    return [...new Set([...DEFAULT_CATEGORIES, ...extra])];
  }, [products]);

  const handleLogout = async () => {
    await signOut(auth);
    onLoggedOut();
  };

  const handleDelete = async (product) => {
    const ok = await confirmAsync("Excluir item", `Remover "${product.name}" da loja?`);
    if (!ok) return;
    setBusyId(product.id);
    setError("");
    try {
      await deleteProduct(product.id);
    } catch (e) {
      setError(`Não foi possível excluir: ${e?.message || e}`);
    } finally {
      setBusyId(null);
    }
  };

  if (editing) {
    return (
      <ProductForm
        product={editing === "new" ? null : editing}
        categories={categories}
        onCancel={() => setEditing(null)}
        onSaved={() => setEditing(null)}
      />
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={s.topBar}>
        <Pressable onPress={onBack} style={s.topBtn} accessibilityLabel="Voltar para a loja">
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={s.kicker}>PAINEL ADMIN</Text>
          <Text style={s.email} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
        <Pressable onPress={handleLogout} style={s.logout} accessibilityLabel="Sair">
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={s.logoutText}>SAIR</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        <View style={s.listHeader}>
          <Text style={s.sectionTitle}>Itens da loja</Text>
          <Text style={s.counter}>{products.length} itens</Text>
        </View>

        <Pressable style={s.addButton} onPress={() => setEditing("new")}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={s.addText}>NOVO ITEM</Text>
        </Pressable>

        {!!error && <Text style={s.error}>{error}</Text>}

        {loading ? (
          <ActivityIndicator color="#d45c35" style={{ marginTop: 40 }} />
        ) : products.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>Nenhum item cadastrado.</Text>
            <Text style={s.emptyText}>
              Toque em NOVO ITEM para cadastrar o primeiro produto da loja.
            </Text>
          </View>
        ) : (
          products.map((p) => (
            <View key={p.id} style={s.row}>
              {p.image ? (
                <Image source={{ uri: p.image }} style={s.thumb} />
              ) : (
                <View style={[s.thumb, s.thumbEmpty]}>
                  <Ionicons name="image-outline" size={22} color="#555" />
                </View>
              )}
              <View style={s.rowInfo}>
                <Text style={s.rowCategory}>{(p.category || "").toUpperCase()}</Text>
                <Text style={s.rowName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={s.rowPrice}>{money(p.price)}</Text>
              </View>
              {busyId === p.id ? (
                <ActivityIndicator color="#d45c35" />
              ) : (
                <View style={s.rowActions}>
                  <Pressable
                    style={s.iconBtn}
                    onPress={() => setEditing(p)}
                    accessibilityLabel={`Editar ${p.name}`}
                  >
                    <Ionicons name="create-outline" size={20} color="#fff" />
                  </Pressable>
                  <Pressable
                    style={s.iconBtn}
                    onPress={() => handleDelete(p)}
                    accessibilityLabel={`Excluir ${p.name}`}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                  </Pressable>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductForm({ product, categories, onCancel, onSaved }) {
  const isNew = !product;
  const [name, setName] = useState(product?.name || "");
  const [type, setType] = useState(product?.type || "");
  const [category, setCategory] = useState(product?.category || categories[0] || "");
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [price, setPrice] = useState(
    product?.price != null ? String(product.price).replace(".", ",") : "",
  );
  const [detail, setDetail] = useState(product?.detail || "");
  const [image, setImage] = useState(product?.image || "");
  const [imageInfo, setImageInfo] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const pickImage = async () => {
    setError("");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      setCompressing(true);

      const out = await compressImageToBase64(asset.uri, {
        width: asset.width,
        height: asset.height,
      });
      setImage(out.dataUri);
      setImageInfo(out);
    } catch (e) {
      setError(`Não foi possível processar a imagem: ${e?.message || e}`);
    } finally {
      setCompressing(false);
    }
  };

  const submit = async () => {
    if (saving || compressing) return;
    const finalCategory = (addingCategory ? newCategory : category).trim();
    const parsedPrice = parsePrice(price);

    if (!name.trim()) return setError("Informe o nome do item.");
    if (!finalCategory) return setError("Escolha ou crie uma categoria.");
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0)
      return setError("Informe um preço válido (ex.: 289,90).");
    if (!image) return setError("Adicione uma foto do item.");

    setError("");
    setSaving(true);
    try {
      await saveProduct(
        {
          name: name.trim(),
          type: type.trim(),
          category: finalCategory,
          price: Math.round(parsedPrice * 100) / 100,
          detail: detail.trim(),
          image,
        },
        product?.id,
      );
      onSaved();
    } catch (e) {
      setError(`Não foi possível salvar: ${e?.message || e}`);
      setSaving(false);
    }
  };

  const sizeLabel = imageInfo
    ? `Comprimida para ${formatBytes(imageInfo.bytes)} (limite ${formatBytes(MAX_IMAGE_BYTES)}) · ${imageInfo.width}×${imageInfo.height}px${imageInfo.attempts > 1 ? ` · ${imageInfo.attempts} tentativas` : ""}`
    : image && image.startsWith("data:")
      ? `Imagem atual: ${formatBytes(image.length)}`
      : "";

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={s.topBar}>
        <Pressable onPress={onCancel} style={s.topBtn} accessibilityLabel="Cancelar">
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={s.kicker}>{isNew ? "NOVO ITEM" : "EDITAR ITEM"}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.label}>FOTO</Text>
          <Pressable style={s.photoBox} onPress={pickImage} disabled={compressing || saving}>
            {image ? (
              <Image source={{ uri: image }} style={s.photo} resizeMode="cover" />
            ) : (
              <View style={s.photoEmpty}>
                <Ionicons name="camera-outline" size={32} color="#888" />
                <Text style={s.photoHint}>TOCAR PARA ESCOLHER UMA FOTO</Text>
              </View>
            )}
            {compressing && (
              <View style={s.photoOverlay}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={s.overlayText}>Comprimindo imagem…</Text>
              </View>
            )}
          </Pressable>
          {!!image && !compressing && (
            <Pressable onPress={pickImage} style={s.changePhoto}>
              <Text style={s.changePhotoText}>TROCAR FOTO</Text>
            </Pressable>
          )}
          {!!sizeLabel && <Text style={s.sizeInfo}>{sizeLabel}</Text>}

          <Text style={s.label}>NOME</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex.: Street Deck 8.0"
            placeholderTextColor="#555"
          />

          <Text style={s.label}>TIPO (SUBTÍTULO)</Text>
          <TextInput
            style={s.input}
            value={type}
            onChangeText={setType}
            placeholder="Ex.: Shape street"
            placeholderTextColor="#555"
          />

          <Text style={s.label}>CATEGORIA</Text>
          <View style={s.chips}>
            {categories.map((c) => {
              const active = !addingCategory && category === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => {
                    setCategory(c);
                    setAddingCategory(false);
                  }}
                  style={[s.chip, active && s.chipActive]}
                >
                  <Text style={[s.chipText, active && s.chipTextActive]}>{c}</Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setAddingCategory(true)}
              style={[s.chip, addingCategory && s.chipActive]}
            >
              <Text style={[s.chipText, addingCategory && s.chipTextActive]}>+ Nova</Text>
            </Pressable>
          </View>
          {addingCategory && (
            <TextInput
              style={[s.input, { marginTop: 10 }]}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="Nome da nova categoria"
              placeholderTextColor="#555"
              autoFocus
            />
          )}

          <Text style={s.label}>PREÇO (R$)</Text>
          <TextInput
            style={s.input}
            value={price}
            onChangeText={setPrice}
            placeholder="289,90"
            placeholderTextColor="#555"
            keyboardType="decimal-pad"
          />

          <Text style={s.label}>DESCRIÇÃO</Text>
          <TextInput
            style={[s.input, s.textarea]}
            value={detail}
            onChangeText={setDetail}
            placeholder="Detalhes do produto"
            placeholderTextColor="#555"
            multiline
            textAlignVertical="top"
          />

          {!!error && <Text style={s.error}>{error}</Text>}

          <Pressable
            style={[s.addButton, { marginTop: 26 }, (saving || compressing) && { opacity: 0.6 }]}
            onPress={submit}
            disabled={saving || compressing}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.addText}>{isNew ? "ADICIONAR ITEM" : "SALVAR ALTERAÇÕES"}</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#080808" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#252525",
  },
  topBtn: { padding: 6 },
  kicker: { color: "#d45c35", fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  email: { color: "#aaa", fontSize: 12, marginTop: 2 },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  listContent: { padding: 22, paddingBottom: 60, width: "100%", maxWidth: 720, alignSelf: "center" },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  sectionTitle: { color: "#fff", fontSize: 28, fontWeight: "900" },
  counter: { color: "#777", fontSize: 12, marginBottom: 3 },
  addButton: {
    backgroundColor: "#d45c35",
    padding: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 18,
  },
  addText: { color: "#fff", fontWeight: "900", letterSpacing: 1 },
  error: { color: "#ff6b6b", marginTop: 14, fontSize: 14, lineHeight: 20 },
  empty: { paddingVertical: 40, alignItems: "center" },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  emptyText: { color: "#bbb", fontSize: 15, lineHeight: 22, textAlign: "center" },
  ghost: {
    borderWidth: 1,
    borderColor: "#555",
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 22,
  },
  ghostText: { color: "#fff", fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#292929",
  },
  thumb: { width: 64, height: 64, backgroundColor: "#222", borderRadius: 4 },
  thumbEmpty: { alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1, marginLeft: 14, marginRight: 8 },
  rowCategory: { color: "#d45c35", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  rowName: { color: "#fff", fontSize: 16, fontWeight: "800", marginTop: 3 },
  rowPrice: { color: "#ddd", fontSize: 14, fontWeight: "700", marginTop: 4 },
  rowActions: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 9, borderWidth: 1, borderColor: "#333", borderRadius: 4 },

  formContent: { padding: 22, paddingBottom: 60, width: "100%", maxWidth: 560, alignSelf: "center" },
  label: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#333",
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  textarea: { minHeight: 110 },
  photoBox: {
    height: 230,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#333",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  photo: { width: "100%", height: "100%" },
  photoEmpty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  photoHint: { color: "#888", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,.72)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  overlayText: { color: "#fff", fontWeight: "700" },
  changePhoto: { alignSelf: "flex-start", marginTop: 10 },
  changePhotoText: { color: "#d45c35", fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  sizeInfo: { color: "#8a8a8a", fontSize: 12, marginTop: 8, lineHeight: 18 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  chipActive: { backgroundColor: "#d45c35", borderColor: "#d45c35" },
  chipText: { color: "#aaa", fontWeight: "700", fontSize: 12 },
  chipTextActive: { color: "#fff" },
});
