import { useState } from "react";
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

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Code2 size={18} color="#818cf8" />
          <span>In-App Promotion Code Integration SDK</span>
          <span className="launch-tool-badge">Production Code</span>
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

      <div className="pitch-body-box" style={{ fontFamily: "monospace", fontSize: "0.82rem", background: "#0b0f19", overflowX: "auto" }}>
        {code}
      </div>
    </div>
  );
}
