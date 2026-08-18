import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Clipboard, Download, FileText, Shield, Sparkles } from "lucide-react";
import "./launch-tools.css";

type Context = { name: string; developer?: string; description: string };

type DocType = "privacy" | "terms";

const DATA_TYPES = ["Analytics & Usage Data", "Location Data", "Camera / Photos", "Contacts", "Push Notifications", "Device Identifiers"] as const;

export default function PrivacyPolicyGenerator({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";
  const [companyName, setCompanyName] = useState(context?.developer || "Your Company");
  const [email, setEmail] = useState("privacy@yourapp.com");
  const [activeDoc, setActiveDoc] = useState<DocType>("privacy");
  const [dataCollected, setDataCollected] = useState<Set<string>>(new Set(["Analytics & Usage Data", "Push Notifications"]));

  const toggleData = (d: string) => {
    const next = new Set(dataCollected);
    next.has(d) ? next.delete(d) : next.add(d);
    setDataCollected(next);
  };

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const privacyPolicy = `# Privacy Policy for ${appName}

**Effective Date:** ${today}
**Last Updated:** ${today}

${companyName} ("we," "our," or "us") operates ${appName}. This Privacy Policy explains how we collect, use, and protect your information.

## 1. Information We Collect

${dataCollected.size > 0 ? Array.from(dataCollected).map(d => `- **${d}**: Collected to improve your experience and app functionality.`).join("\n") : "We do not collect personal information beyond basic app functionality."}

## 2. How We Use Your Information

We use collected information to:
- Provide and maintain ${appName}'s core functionality
- Improve user experience and app performance
- Send important notifications (if enabled)
- Analyze usage patterns to fix bugs and improve features

## 3. Third-Party Services

${appName} may use third-party services that collect information:
- **Analytics**: To understand app usage patterns
- **Cloud Services**: To store and sync your data securely
- **Push Notification Services**: To deliver timely updates

Each third-party service has its own privacy policy governing the use of your information.

## 4. Data Security

We implement industry-standard security measures to protect your information, including encryption in transit and at rest. However, no method of electronic transmission is 100% secure.

## 5. Children's Privacy

${appName} is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we discover such data has been collected, we will delete it promptly.

## 6. Your Rights

You have the right to:
- Access the personal data we hold about you
- Request deletion of your data
- Opt out of data collection where applicable
- Export your data in a portable format

## 7. Changes to This Policy

We may update this Privacy Policy periodically. We will notify you of changes by posting the new policy in the app and updating the "Last Updated" date.

## 8. Contact Us

For questions about this Privacy Policy, contact us at:
**Email:** ${email}
**Company:** ${companyName}`;

  const termsOfService = `# Terms of Service for ${appName}

**Effective Date:** ${today}
**Last Updated:** ${today}

## 1. Acceptance of Terms

By downloading, installing, or using ${appName}, you agree to be bound by these Terms of Service. If you do not agree, do not use ${appName}.

## 2. License Grant

${companyName} grants you a limited, non-exclusive, non-transferable, revocable license to use ${appName} for personal or commercial purposes in accordance with these Terms.

## 3. Restrictions

You agree not to:
- Reverse engineer, decompile, or disassemble ${appName}
- Use ${appName} for any unlawful purpose
- Redistribute, sublicense, or resell ${appName} without authorization
- Attempt to gain unauthorized access to our servers or systems

## 4. User Content

You retain ownership of content you create using ${appName}. By using our services, you grant us a limited license to process your content solely for the purpose of providing ${appName}'s functionality.

## 5. Termination

We may suspend or terminate your access to ${appName} at any time, with or without cause, with or without notice. Upon termination, your right to use ${appName} ceases immediately.

## 6. Disclaimer of Warranties

${appName} is provided "AS IS" and "AS AVAILABLE" without warranties of any kind. ${companyName} does not warrant that ${appName} will be uninterrupted, error-free, or free of harmful components.

## 7. Limitation of Liability

To the maximum extent permitted by law, ${companyName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of ${appName}.

## 8. Governing Law

These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which ${companyName} is incorporated.

## 9. Contact Us

For questions about these Terms, contact us at:
**Email:** ${email}
**Company:** ${companyName}`;

  const activeContent = activeDoc === "privacy" ? privacyPolicy : termsOfService;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    toast.success(`Copied ${activeDoc === "privacy" ? "Privacy Policy" : "Terms of Service"} as Markdown!`);
  };

  const handleDownload = () => {
    const blob = new Blob([activeContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${activeDoc === "privacy" ? "privacy-policy" : "terms-of-service"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${activeDoc === "privacy" ? "Privacy Policy" : "Terms of Service"}!`);
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Shield size={18} color="#818cf8" />
          <span>App Privacy Policy & Terms of Service Generator</span>
          <span className="launch-tool-badge">App Store Required</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button size="sm" variant="outline" onClick={handleCopy}><Clipboard size={13} /> Copy Markdown</Button>
          <Button size="sm" variant="outline" onClick={handleDownload}><Download size={13} /> Download .md</Button>
        </div>
      </div>

      <div className="pitch-tabs" style={{ marginBottom: "0.75rem" }}>
        <button type="button" className={`pitch-tab-btn ${activeDoc === "privacy" ? "is-active" : ""}`} onClick={() => setActiveDoc("privacy")}>Privacy Policy</button>
        <button type="button" className={`pitch-tab-btn ${activeDoc === "terms" ? "is-active" : ""}`} onClick={() => setActiveDoc("terms")}>Terms of Service</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1rem" }}>
        {/* Config */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 3 }}>Company / Developer:</label>
            <Input value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 3 }}>Contact Email:</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 3 }}>Data Collected:</label>
            {DATA_TYPES.map(d => (
              <label key={d} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#cbd5e1", cursor: "pointer", marginBottom: 3 }}>
                <input type="checkbox" checked={dataCollected.has(d)} onChange={() => toggleData(d)} style={{ accentColor: "#6366f1" }} />
                {d}
              </label>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", maxHeight: 400, overflow: "auto" }}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.6, fontFamily: "system-ui, sans-serif" }}>{activeContent}</pre>
        </div>
      </div>
    </div>
  );
}
