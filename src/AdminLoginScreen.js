import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const authMessage = (code) => {
  switch (code) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha incorretos.";
    case "auth/user-disabled":
      return "Esta conta foi desativada.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde um pouco e tente novamente.";
    case "auth/network-request-failed":
      return "Sem conexão. Verifique sua internet.";
    case "auth/operation-not-allowed":
      return "Login por e-mail/senha não está ativado no Firebase.";
    default:
      return "Não foi possível entrar. Tente novamente.";
  }
};

export default function AdminLoginScreen({ onBack, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (loading) return;
    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onSuccess();
    } catch (e) {
      setError(authMessage(e?.code));
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable onPress={onBack} style={s.back} accessibilityLabel="Voltar para a loja">
          <Ionicons name="arrow-back" size={22} color="#fff" />
          <Text style={s.backText}>LOJA</Text>
        </Pressable>

        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.kicker}>ÁREA RESTRITA</Text>
          <Text style={s.title}>LOGIN{"\n"}ADMIN.</Text>
          <Text style={s.subtitle}>
            Entre com o e-mail e a senha cadastrados para gerenciar os produtos da loja.
          </Text>

          <Text style={s.label}>E-MAIL</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="admin@email.com"
            placeholderTextColor="#555"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            editable={!loading}
          />

          <Text style={s.label}>SENHA</Text>
          <View style={s.passwordRow}>
            <TextInput
              style={[s.input, { flex: 1, borderWidth: 0 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#555"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              editable={!loading}
              onSubmitEditing={submit}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={s.eye}
              accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#aaa"
              />
            </Pressable>
          </View>

          {!!error && <Text style={s.error}>{error}</Text>}

          <Pressable
            onPress={submit}
            disabled={loading}
            style={[s.button, loading && { opacity: 0.6 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.buttonText}>ENTRAR</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#080808" },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 18,
    alignSelf: "flex-start",
  },
  backText: { color: "#fff", fontWeight: "800", fontSize: 12, letterSpacing: 2 },
  content: { paddingHorizontal: 22, paddingBottom: 40, width: "100%", maxWidth: 520, alignSelf: "center" },
  kicker: { color: "#d45c35", fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  title: {
    color: "#fff",
    fontSize: 45,
    lineHeight: 48,
    fontWeight: "900",
    marginTop: 12,
    letterSpacing: -1,
  },
  subtitle: { color: "#bdbdbd", fontSize: 15, lineHeight: 22, marginTop: 16, marginBottom: 28 },
  label: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 8,
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
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#333",
  },
  eye: { padding: 14 },
  error: { color: "#ff6b6b", marginTop: 14, fontSize: 14 },
  button: { backgroundColor: "#d45c35", padding: 17, alignItems: "center", marginTop: 26 },
  buttonText: { color: "#fff", fontWeight: "900", letterSpacing: 1 },
});
