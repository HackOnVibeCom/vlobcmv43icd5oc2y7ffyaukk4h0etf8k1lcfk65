import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Clipboard, Code2, Smartphone, Sparkles, Terminal } from "lucide-react";
import "./launch-tools.css";

type Framework = "swift" | "kotlin" | "react_native" | "flutter";
type PromoFeature = "viral_share" | "smart_rate" | "whats_new" | "deep_link";

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  sourceUrl?: string;
};

export default function InAppPromotionSDKPanel({ context }: { context?: Context }) {
  const [framework, setFramework] = useState<Framework>("swift");
  const [feature, setFeature] = useState<PromoFeature>("viral_share");
  const [copied, setCopied] = useState(false);

  const appName = context?.name || "YourApp";
  const safeName = appName.replace(/[^a-zA-Z0-9]/g, "");
  const url = context?.sourceUrl || "https://pitchforge.app/demo";

  const getCodeSnippet = (): string => {
    if (framework === "swift") {
      if (feature === "viral_share") {
        return `// Swift (iOS) — In-App Viral Share Sheet
import SwiftUI

struct ViralShareButton: View {
    let appUrl = URL(string: "${url}")!
    let shareText = "Check out ${appName} — it completely transformed my workflow!"

    var body: some View {
        ShareLink(item: appUrl, message: Text(shareText)) {
            Label("Share ${appName} with Friends", systemImage: "square.and.arrow.up")
                .font(.headline)
                .padding()
                .background(Color.accentColor)
                .foregroundColor(.white)
                .cornerRadius(12)
        }
    }
}`;
      }
      if (feature === "smart_rate") {
        return `// Swift (iOS) — High-Conversion App Store Review Trigger
import StoreKit

class AppRatingManager {
    static let shared = AppRatingManager()
    
    func requestReviewIfAppropriate() {
        let count = UserDefaults.standard.integer(forKey: "successful_actions_count") + 1
        UserDefaults.standard.set(count, forKey: "successful_actions_count")
        
        // Trigger after 3 positive user interactions
        if count == 3 {
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                SKStoreReviewController.requestReview(in: windowScene)
            }
        }
    }
}`;
      }
      if (feature === "whats_new") {
        return `// Swift (iOS) — In-App Release Notes Modal
import SwiftUI

struct WhatsNewSheet: View {
    @Environment(\\.dismiss) var dismiss
    
    var body: some View {
        VStack(spacing: 20) {
            Text("What's New in ${appName}")
                .font(.largeTitle.bold())
            
            FeatureRow(icon: "bolt.fill", title: "Instant Generation", desc: "Launch-ready posts in seconds.")
            FeatureRow(icon: "checkmark.seal.fill", title: "ASO Score Engine", desc: "Rank higher on the App Store.")
            
            Spacer()
            
            Button("Continue") { dismiss() }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
        }
        .padding(24)
    }
}`;
      }
      return `// Swift (iOS) — Universal Deep Link Handler
import SwiftUI

@main
struct ${safeName}App: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    print("Opened via promo campaign: \\(url.absoluteString)")
                    // Track attribution parameter e.g. ref=twitter_launch
                }
        }
    }
}`;
    }

    if (framework === "kotlin") {
      if (feature === "viral_share") {
        return `// Kotlin (Android) — Native Share Intent
import android.content.Context
import android.content.Intent

fun share${safeName}(context: Context) {
    val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, "Check out ${appName}")
        putExtra(Intent.EXTRA_TEXT, "I've been using ${appName} and love it! Download here: ${url}")
    }
    context.startActivity(Intent.createChooser(shareIntent, "Share ${appName}"))
}`;
      }
      if (feature === "smart_rate") {
        return `// Kotlin (Android) — Google Play In-App Review API
import android.app.Activity
import com.google.android.play.core.review.ReviewManagerFactory

fun launchInAppReview(activity: Activity) {
    val manager = ReviewManagerFactory.create(activity)
    val request = manager.requestReviewFlow()
    request.addOnCompleteListener { task ->
        if (task.isSuccessful) {
            val reviewInfo = task.result
            manager.launchReviewFlow(activity, reviewInfo)
        }
    }
}`;
      }
      if (feature === "whats_new") {
        return `// Kotlin (Android / Jetpack Compose) — What's New Dialog
import androidx.compose.material3.*
import androidx.compose.runtime.Composable

@Composable
fun WhatsNewDialog(onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("What's New in ${appName}") },
        text = { Text("• Fresh multi-platform campaign generator\\n• Optimized ASO store ranking\\n• Instant social sharing") },
        confirmButton = { Button(onClick = onDismiss) { Text("Awesome") } }
    )
}`;
      }
      return `// Kotlin (Android) — Deep Link Intent Filter (AndroidManifest.xml)
/*
<activity android:name=".MainActivity" android:exported="true">
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="${appName.toLowerCase().replace(/[^a-z]/g, "")}.app" />
    </intent-filter>
</activity>
*/`;
    }

    if (framework === "react_native") {
      if (feature === "viral_share") {
        return `// React Native — Viral In-App Sharing
import React from 'react';
import { Share, Button } from 'react-native';

export const Share${safeName}Button = () => {
  const onShare = async () => {
    try {
      await Share.share({
        message: 'Check out ${appName} — launch copy & ASO optimizer for indie devs: ${url}',
        url: '${url}',
        title: '${appName}',
      });
    } catch (error) {
      console.error(error);
    }
  };

  return <Button onPress={onShare} title="Invite Friends to ${appName}" />;
};`;
      }
      if (feature === "smart_rate") {
        return `// React Native — In-App Review Trigger
import * as StoreReview from 'expo-store-review'; // or react-native-rate

export const promptAppRating = async () => {
  const isAvailable = await StoreReview.isAvailableAsync();
  if (isAvailable) {
    await StoreReview.requestReview();
  }
};`;
      }
      if (feature === "whats_new") {
        return `// React Native — What's New Bottom Sheet
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

export const WhatsNewModal = ({ visible, onClose }) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.sheet}>
      <Text style={styles.title}>What's New in ${appName}</Text>
      <Text style={styles.item}>🚀 Real-time social preview cards</Text>
      <Text style={styles.item}>🎯 ASO keyword optimizer</Text>
      <TouchableOpacity style={styles.btn} onPress={onClose}>
        <Text style={styles.btnText}>Got it</Text>
      </TouchableOpacity>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#0f172a', padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  item: { fontSize: 16, color: '#94a3b8', marginVertical: 6 },
  btn: { backgroundColor: '#6366f1', padding: 14, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});`;
      }
      return `// React Native — Deep Link Routing (Linking API)
import { useEffect } from 'react';
import { Linking } from 'react-native';

export const usePromoDeepLink = () => {
  useEffect(() => {
    Linking.getInitialURL().then(url => {
      if (url) console.log('App launched via promotion link:', url);
    });
  }, []);
};`;
    }

    // Flutter
    if (feature === "viral_share") {
      return `// Flutter — Share Plus Integration
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

class ViralShareWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      icon: Icon(Icons.share),
      label: Text('Share ${appName}'),
      onPressed: () {
        Share.share(
          'Check out ${appName}! Download here: ${url}',
          subject: 'Check out ${appName}',
        );
      },
    );
  }
}`;
    }
    if (feature === "smart_rate") {
      return `// Flutter — In-App Review API
import 'package:in_app_review/in_app_review.dart';

Future<void> requestAppReview() async {
  final InAppReview inAppReview = InAppReview.instance;
  if (await inAppReview.isAvailable()) {
    await inAppReview.requestReview();
  }
}`;
    }
    return `// Flutter — What's New Dialog
import 'package:flutter/material.dart';

void showWhatsNew(BuildContext context) {
  showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text("What's New in ${appName}"),
      content: Text("• Multi-Platform Launch Copy\\n• 1-Click Social Dispatch\\n• ASO Scoring Engine"),
      actions: [
        TextButton(child: Text("Continue"), onPressed: () => Navigator.pop(ctx)),
      ],
    ),
  );
}`;
  };

  const code = getCodeSnippet();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Copied ${framework.toUpperCase()} integration code!`);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Interactive Device Mockup Visual ── */
  const PhoneMockup = () => {
    const phoneStyle: React.CSSProperties = {
      width: 230,
      minWidth: 230,
      height: 450,
      borderRadius: "30px",
      border: "3px solid rgba(255,255,255,0.2)",
      background: "#080c14",
      padding: "0",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxShadow: "0 25px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.08)",
      position: "relative",
      flexShrink: 0,
    };

    const statusBar: React.CSSProperties = {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 16px",
      fontSize: "0.68rem",
      color: "#fff",
      fontWeight: 600,
    };

    const notchStyle: React.CSSProperties = {
      width: 84,
      height: 22,
      background: "#000",
      borderRadius: "0 0 14px 14px",
      position: "absolute",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 10,
    };

    const screenBody: React.CSSProperties = {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      padding: "12px",
      overflow: "hidden",
    };

    if (feature === "viral_share") {
      return (
        <div style={phoneStyle}>
          <div style={notchStyle} />
          <div style={statusBar}><span>9:41</span><span>📶 🔋</span></div>
          <div style={screenBody}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #6366f1, #818cf8)", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", fontWeight: 800 }}>{appName.charAt(0)}</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem", marginBottom: 4 }}>{appName}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.65rem", marginBottom: 14 }}>Share with friends</div>
              </div>
            </div>
            {/* Share Sheet Bottom */}
            <div style={{ background: "#1e293b", borderRadius: "16px 16px 0 0", padding: "12px", marginBottom: -12, marginLeft: -12, marginRight: -12 }}>
              <div style={{ width: 36, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, margin: "0 auto 10px" }} />
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 10 }}>
                {[{ icon: "💬", label: "Messages", bg: "#22c55e" }, { icon: "📧", label: "Mail", bg: "#3b82f6" }, { icon: "🐦", label: "Twitter", bg: "#0ea5e9" }, { icon: "📋", label: "Copy", bg: "#64748b" }].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 3 }}>{s.icon}</div>
                    <span style={{ fontSize: "0.55rem", color: "#94a3b8" }}>{s.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "6px 8px", fontSize: "0.6rem", color: "#cbd5e1" }}>
                Check out {appName} — it completely transformed my workflow! {url.slice(0, 26)}...
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (feature === "smart_rate") {
      return (
        <div style={phoneStyle}>
          <div style={notchStyle} />
          <div style={statusBar}><span>9:41</span><span>📶 🔋</span></div>
          <div style={screenBody}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Rating Dialog */}
              <div style={{ background: "#1e293b", borderRadius: 16, padding: "18px 14px", textAlign: "center", width: "100%", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>Enjoying {appName}?</div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginBottom: 12 }}>Tap a star to rate your experience</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 14 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} style={{ fontSize: 24, cursor: "pointer", filter: i <= 4 ? "none" : "grayscale(0.5)" }}>{i <= 4 ? "⭐" : "☆"}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "0.7rem", fontWeight: 600, textAlign: "center" }}>Not Now</div>
                  <div style={{ flex: 1, padding: "8px", borderRadius: 8, background: "#6366f1", color: "#fff", fontSize: "0.7rem", fontWeight: 600, textAlign: "center" }}>Submit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (feature === "whats_new") {
      return (
        <div style={phoneStyle}>
          <div style={notchStyle} />
          <div style={statusBar}><span>9:41</span><span>📶 🔋</span></div>
          <div style={screenBody}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              {/* What's New Bottom Sheet */}
              <div style={{ background: "#1e293b", borderRadius: "16px 16px 0 0", padding: "16px 12px", marginBottom: -12, marginLeft: -12, marginRight: -12 }}>
                <div style={{ width: 36, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, margin: "0 auto 12px" }} />
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#fff", marginBottom: 14 }}>What's New in {appName}</div>
                {[
                  { icon: "⚡", title: "Instant Generation", desc: "Launch-ready posts in seconds" },
                  { icon: "✅", title: "ASO Score Engine", desc: "Rank higher on the store" },
                  { icon: "📊", title: "Feed Mockups", desc: "Preview on 6 platforms" },
                ].map(item => (
                  <div key={item.title} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>{item.title}</div>
                      <div style={{ fontSize: "0.62rem", color: "#94a3b8" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
                <div style={{ background: "#6366f1", borderRadius: 10, padding: "10px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: "0.8rem", marginTop: 8 }}>Continue</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // deep_link
    return (
      <div style={phoneStyle}>
        <div style={notchStyle} />
        <div style={statusBar}><span>9:41</span><span>📶 🔋</span></div>
        <div style={screenBody}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            {/* Safari-like URL bar */}
            <div style={{ width: "100%", background: "#1e293b", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.6rem", color: "#22c55e" }}>🔒</span>
              <span style={{ fontSize: "0.62rem", color: "#cbd5e1", fontFamily: "monospace" }}>{appName.toLowerCase().replace(/[^a-z]/g, "")}.app/ref=tw</span>
            </div>
            {/* App Open Banner */}
            <div style={{ width: "100%", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, padding: "10px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{appName.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#fff" }}>{appName}</div>
                <div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>Open in app</div>
              </div>
              <div style={{ background: "#6366f1", borderRadius: 8, padding: "5px 10px", fontSize: "0.65rem", fontWeight: 600, color: "#fff" }}>OPEN</div>
            </div>
            {/* Attribution Arrow */}
            <div style={{ textAlign: "center", marginTop: 6 }}>
              <div style={{ fontSize: "0.6rem", color: "#818cf8" }}>↓ Deep Link Captured</div>
              <div style={{ fontSize: "0.55rem", color: "#64748b", marginTop: 2 }}>source=twitter, campaign=launch</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Code2 size={18} color="#818cf8" />
          <span>In-App Promotion Code Integration SDK</span>
          <span className="launch-tool-badge">Production Code + Device Mockup</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleCopy}>
          {copied ? <Check size={13} /> : <Clipboard size={13} />}
          {copied ? "Copied Snippet" : "Copy Code"}
        </Button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {/* Framework Switcher */}
        <div className="pitch-tabs" style={{ marginBottom: 0 }}>
          {[
            { id: "swift" as const, label: "iOS (Swift / SwiftUI)" },
            { id: "kotlin" as const, label: "Android (Kotlin)" },
            { id: "react_native" as const, label: "React Native" },
            { id: "flutter" as const, label: "Flutter (Dart)" },
          ].map(fw => (
            <button
              key={fw.id}
              type="button"
              className={`pitch-tab-btn ${framework === fw.id ? "is-active" : ""}`}
              onClick={() => setFramework(fw.id)}
            >
              {fw.label}
            </button>
          ))}
        </div>

        {/* Feature Switcher */}
        <div className="pitch-tabs" style={{ marginBottom: 0 }}>
          {[
            { id: "viral_share" as const, label: "🔗 Viral Share Sheet" },
            { id: "smart_rate" as const, label: "⭐ In-App Review Prompt" },
            { id: "whats_new" as const, label: "✨ What's New Sheet" },
            { id: "deep_link" as const, label: "⚡ Campaign Deep Link" },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              className={`pitch-tab-btn ${feature === f.id ? "is-active" : ""}`}
              style={{ fontSize: "0.78rem" }}
              onClick={() => setFeature(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Phone Mockup on Left + Code on Right */}
      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: "1.25rem", alignItems: "flex-start" }}>
        {/* Device Visual */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <PhoneMockup />
          <span style={{ fontSize: "0.7rem", color: "#818cf8", fontWeight: 600 }}>
            {feature === "viral_share" ? "📱 Native Share Sheet" : feature === "smart_rate" ? "⭐ Store Review Prompt" : feature === "whats_new" ? "✨ What's New Modal" : "⚡ Universal Deep Link"}
          </span>
        </div>

        {/* Code Snippet Box */}
        <div className="pitch-body-box" style={{ fontFamily: "monospace", fontSize: "0.82rem", background: "#0b0f19", overflowX: "auto", height: 450, margin: 0 }}>
          {code}
        </div>
      </div>
    </div>
  );
}
