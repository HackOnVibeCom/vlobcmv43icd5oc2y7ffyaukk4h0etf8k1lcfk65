import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Clipboard, Code2, Gift, Share2, Sparkles } from "lucide-react";
import "./launch-tools.css";

type Context = { name: string; description: string; sourceUrl?: string };
type Platform = "swift" | "kotlin" | "react_native" | "flutter";

const CODE: Record<Platform, { label: string; code: string }> = {
  swift: { label: "Swift (iOS)", code: `import FirebaseDynamicLinks
import UIKit

// MARK: - Referral Code Generator
struct ReferralManager {
    static func generateCode(for userId: String) -> String {
        let hash = userId.utf8.reduce(0) { $0 &+ Int($1) }
        return String(format: "REF-%06X", abs(hash) % 0xFFFFFF)
    }

    // MARK: - Create Dynamic Referral Link
    static func createReferralLink(
        userId: String,
        appURL: String,
        completion: @escaping (URL?) -> Void
    ) {
        let code = generateCode(for: userId)
        guard let link = URL(string: "\\(appURL)?ref=\\(code)") else {
            completion(nil); return
        }
        let components = DynamicLinkComponents(
            link: link,
            domainURIPrefix: "https://yourapp.page.link"
        )
        components?.iOSParameters = DynamicLinkIOSParameters(bundleID: "com.yourapp.ios")
        components?.androidParameters = DynamicLinkAndroidParameters(packageName: "com.yourapp.android")
        components?.shorten { shortURL, _, _ in
            completion(shortURL?.url)
        }
    }

    // MARK: - Share Referral
    static func shareReferral(from vc: UIViewController, userId: String, appURL: String) {
        createReferralLink(userId: userId, appURL: appURL) { url in
            guard let url = url else { return }
            let message = "Try this app! Use my referral link: \\(url.absoluteString)"
            let ac = UIActivityViewController(activityItems: [message], applicationActivities: nil)
            vc.present(ac, animated: true)
        }
    }

    // MARK: - Handle Incoming Referral
    static func handleIncomingLink(_ url: URL) -> String? {
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        return components?.queryItems?.first(where: { $0.name == "ref" })?.value
    }

    // MARK: - Track Reward
    static func trackReward(referrerCode: String, newUserId: String) {
        // POST to your backend: /api/referral/reward
        let body: [String: Any] = [
            "referrer_code": referrerCode,
            "new_user_id": newUserId,
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        // URLSession.shared.dataTask(with: request)...
    }
}` },
  kotlin: { label: "Kotlin (Android)", code: `import com.google.firebase.dynamiclinks.ktx.*
import com.google.firebase.ktx.Firebase
import android.content.Intent

object ReferralManager {
    fun generateCode(userId: String): String {
        val hash = userId.toByteArray().fold(0) { acc, b -> acc + b.toInt() }
        return "REF-%06X".format(Math.abs(hash) % 0xFFFFFF)
    }

    fun createReferralLink(userId: String, appUrl: String, onResult: (String?) -> Unit) {
        val code = generateCode(userId)
        val link = "\$appUrl?ref=\$code"

        Firebase.dynamicLinks.shortLinkAsync {
            this.link = android.net.Uri.parse(link)
            domainUriPrefix = "https://yourapp.page.link"
            androidParameters("com.yourapp.android") {}
            iosParameters("com.yourapp.ios") {}
        }.addOnSuccessListener { result ->
            onResult(result.shortLink?.toString())
        }.addOnFailureListener {
            onResult(null)
        }
    }

    fun shareReferral(activity: android.app.Activity, userId: String, appUrl: String) {
        createReferralLink(userId, appUrl) { link ->
            link?.let {
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, "Try this app! Use my link: \$it")
                }
                activity.startActivity(Intent.createChooser(intent, "Share via"))
            }
        }
    }

    fun handleIncomingLink(intent: Intent): String? {
        val data = intent.data ?: return null
        return data.getQueryParameter("ref")
    }

    fun trackReward(referrerCode: String, newUserId: String) {
        // POST to /api/referral/reward
        val body = mapOf(
            "referrer_code" to referrerCode,
            "new_user_id" to newUserId,
            "timestamp" to java.time.Instant.now().toString()
        )
    }
}` },
  react_native: { label: "React Native", code: `import dynamicLinks from '@react-native-firebase/dynamic-links';
import { Share, Platform } from 'react-native';

export const ReferralManager = {
  generateCode(userId: string): string {
    const hash = [...userId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return \`REF-\${(Math.abs(hash) % 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0')}\`;
  },

  async createReferralLink(userId: string, appUrl: string): Promise<string | null> {
    const code = this.generateCode(userId);
    try {
      const link = await dynamicLinks().buildShortLink({
        link: \`\${appUrl}?ref=\${code}\`,
        domainUriPrefix: 'https://yourapp.page.link',
        android: { packageName: 'com.yourapp.android' },
        ios: { bundleId: 'com.yourapp.ios' },
      });
      return link;
    } catch { return null; }
  },

  async shareReferral(userId: string, appUrl: string) {
    const link = await this.createReferralLink(userId, appUrl);
    if (!link) return;
    await Share.share({
      message: \`Try this app! Use my referral link: \${link}\`,
    });
  },

  handleIncomingLink(url: string): string | null {
    const match = url.match(/[?&]ref=([^&]+)/);
    return match ? match[1] : null;
  },

  async trackReward(referrerCode: string, newUserId: string) {
    await fetch('/api/referral/reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrer_code: referrerCode, new_user_id: newUserId }),
    });
  },
};` },
  flutter: { label: "Flutter (Dart)", code: `import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:share_plus/share_plus.dart';

class ReferralManager {
  static String generateCode(String userId) {
    final hash = userId.codeUnits.fold<int>(0, (acc, c) => acc + c);
    return 'REF-\${(hash.abs() % 0xFFFFFF).toRadixString(16).toUpperCase().padLeft(6, '0')}';
  }

  static Future<String?> createReferralLink(String userId, String appUrl) async {
    final code = generateCode(userId);
    final params = DynamicLinkParameters(
      link: Uri.parse('\$appUrl?ref=\$code'),
      uriPrefix: 'https://yourapp.page.link',
      androidParameters: const AndroidParameters(packageName: 'com.yourapp.android'),
      iosParameters: const IOSParameters(bundleId: 'com.yourapp.ios'),
    );
    final shortLink = await FirebaseDynamicLinks.instance.buildShortLink(params);
    return shortLink.shortUrl.toString();
  }

  static Future<void> shareReferral(String userId, String appUrl) async {
    final link = await createReferralLink(userId, appUrl);
    if (link != null) {
      await Share.share('Try this app! Use my referral link: \$link');
    }
  }

  static String? handleIncomingLink(Uri uri) {
    return uri.queryParameters['ref'];
  }

  static Future<void> trackReward(String referrerCode, String newUserId) async {
    // POST to /api/referral/reward
  }
}` },
};

export default function ReferralCodeGenerator({ context }: { context?: Context }) {
  const [platform, setPlatform] = useState<Platform>("swift");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied code!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Gift size={18} color="#818cf8" />
          <span>Referral Program & Deep Link Code Generator</span>
          <span className="launch-tool-badge">Firebase Dynamic Links</span>
        </div>
      </div>

      {/* Referral Funnel Visual */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: "1rem", padding: "0.5rem 1rem", background: "rgba(0,0,0,0.2)", borderRadius: "10px" }}>
        {["Share Link", "Friend Clicks", "App Install", "Attribution", "Reward"].map((step, i) => (
          <div key={step} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${240 + i * 25}, 70%, 60%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.75rem", margin: "0 auto" }}>{i + 1}</div>
              <span style={{ fontSize: "0.68rem", color: "#94a3b8", whiteSpace: "nowrap" }}>{step}</span>
            </div>
            {i < 4 && <div style={{ width: 40, height: 2, background: "rgba(255,255,255,0.1)", margin: "0 0.25rem", marginBottom: "1rem" }} />}
          </div>
        ))}
      </div>

      <div className="pitch-tabs" style={{ marginBottom: "0.75rem" }}>
        {(Object.keys(CODE) as Platform[]).map(p => (
          <button key={p} type="button" className={`pitch-tab-btn ${platform === p ? "is-active" : ""}`} onClick={() => setPlatform(p)}>{CODE[p].label}</button>
        ))}
      </div>

      <div style={{ position: "relative" }}>
        <pre style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1rem", fontSize: "0.78rem", color: "#e2e8f0", overflow: "auto", maxHeight: 400, lineHeight: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>{CODE[platform].code}</pre>
        <Button size="sm" variant="outline" onClick={() => handleCopy(platform, CODE[platform].code)} style={{ position: "absolute", top: 8, right: 8 }}>
          {copiedId === platform ? <Check size={12} /> : <Clipboard size={12} />}
          {copiedId === platform ? "Copied" : "Copy Code"}
        </Button>
      </div>
    </div>
  );
}
