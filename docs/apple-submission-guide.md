# Apple App Store Submission Guide — Challenge Forge

> Comprehensive briefing for submitting a React Native/Expo fitness & habit tracker app.
> Last updated: 2026-02-10

---

## Table of Contents

1. [Common Rejection Reasons & How to Avoid Them](#1-common-rejection-reasons--how-to-avoid-them)
2. [Required Assets](#2-required-assets-icons-screenshots-descriptions)
3. [Apple Human Interface Guidelines for Habit Trackers](#3-apple-human-interface-guidelines-for-habit-trackers)
4. [Privacy Policy Requirements](#4-privacy-policy-requirements)
5. [In-App Purchase Setup ($14.99 Lifetime Unlock)](#5-in-app-purchase-setup-1499-lifetime-unlock)
6. [Expo EAS Build & Submission Workflow](#6-expo-eas-build--submission-workflow)

---

## 1. Common Rejection Reasons & How to Avoid Them

### Top Rejection Categories

| # | Guideline | Issue | How to Avoid |
|---|-----------|-------|--------------|
| 1 | **2.1 — Performance: App Completeness** | Crashes, placeholder content, "coming soon" features, broken flows | Test on a clean device/simulator with no cached data. Remove all placeholder screens. Every button must work. |
| 2 | **2.3 — Accurate Metadata** | Screenshots don't match app, misleading descriptions, wrong category | Screenshots must show *actual app UI*. Description claims must be verifiable in 60 seconds. |
| 3 | **3.1.1 — In-App Purchase** | Digital unlocks outside IAP, missing "Restore Purchases", subscription info unclear | All digital feature unlocks via StoreKit IAP. Add a visible Restore Purchases button. |
| 4 | **5.1.1 — Privacy** | Missing or hard-to-find privacy policy, collecting data without disclosure | Link privacy policy in App Store Connect metadata AND inside the app (Settings screen). |
| 5 | **4.0 — Design: Minimum Functionality** | App is too simple / a thin wrapper around a website | Ensure native feel — local notifications, offline support, haptic feedback, animations. |
| 6 | **5.1.1 — Account Deletion** | No way for users to delete their account | If you offer account creation, provide in-app account deletion (Settings → Delete Account). |
| 7 | **2.3.3 — Screenshots** | Status bars showing wrong time, low-res images, non-device frames | Use clean status bars (9:41 AM convention), proper device frames, high-res assets. |

### Pre-Submission "Reviewer Run" Checklist

Do this on a **clean device** (or fresh simulator) before every submission:

- [ ] Fresh install → open → complete main onboarding flow
- [ ] Create a challenge / log a habit (core functionality works)
- [ ] Hit the paywall → purchase → verify unlock
- [ ] Uninstall → reinstall → Restore Purchases → verify unlock restored
- [ ] Find privacy policy (in-app, < 2 taps from Settings)
- [ ] Delete account flow works (if applicable)
- [ ] Test on airplane mode (graceful offline behavior)
- [ ] No crashes in the last 50 sessions (check Xcode Organizer / EAS crash logs)

### App Review Notes

Always fill in the **App Review Notes** field in App Store Connect:
- Demo account credentials (if login required)
- How to trigger key features
- Explain any hardware requirements
- Note if the app uses HealthKit / notifications

---

## 2. Required Assets (Icons, Screenshots, Descriptions)

### App Icon

| Requirement | Spec |
|-------------|------|
| Size | 1024 × 1024 px (single asset, Apple auto-generates all sizes) |
| Format | PNG, no alpha/transparency |
| Shape | Square — Apple applies the rounded rect mask |
| Content | No screenshots of UI inside the icon, avoid text unless it's your logo |

In `app.json` / `app.config.js`:
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "ios": {
      "icon": "./assets/ios-icon.png"
    }
  }
}
```

### Screenshots

**Required sizes (minimum — provide at least the 6.7" set):**

| Device Class | Portrait (px) | Landscape (px) | Required? |
|-------------|---------------|-----------------|-----------|
| iPhone 6.9" (16 Pro Max) | 1320 × 2868 | 2868 × 1320 | Optional (recommended) |
| **iPhone 6.7" (15 Pro Max / 16 Plus)** | **1290 × 2796** | **2796 × 1290** | **Yes — primary** |
| iPhone 6.5" (legacy) | 1284 × 2778 | 2778 × 1284 | Auto-scaled from 6.7" |
| iPhone 5.5" (legacy) | 1242 × 2208 | 2208 × 1242 | Auto-scaled from 6.7" |
| iPad Pro 13" (if supporting iPad) | 2048 × 2732 | 2732 × 2048 | Required if iPad supported |

**Screenshot guidelines:**
- 1–10 screenshots per localization (first 3 are most important — shown in search)
- Format: PNG or JPEG, no alpha
- Show real app UI (no misleading mockups)
- Recommended: use device frames + captions highlighting key features
- Suggested sequence for a habit tracker:
  1. Dashboard / today view ("Track your daily challenges")
  2. Challenge creation ("Create custom 30-day challenges")
  3. Streak / progress view ("Watch your streaks grow")
  4. Achievement / milestone screen ("Celebrate every win")
  5. Settings / customization ("Make it yours")

### App Store Listing Text

| Field | Limit | Tips |
|-------|-------|------|
| **App Name** | 30 chars | "Challenge Forge" — include a keyword if space allows |
| **Subtitle** | 30 chars | "Daily Habits & Fitness Tracker" |
| **Description** | 4000 chars | First 1–3 lines most important (visible before "more"). Lead with value prop, use line breaks & emoji sparingly. |
| **Keywords** | 100 chars | Comma-separated, no spaces after commas. Use all 100 chars. Don't repeat words from app name. |
| **Promotional Text** | 170 chars | Can be updated without a new build — use for seasonal messaging |
| **What's New** | 4000 chars | Required for updates. Keep concise. |
| **Support URL** | Required | Link to support page or email |
| **Marketing URL** | Optional | Landing page |

### Additional Required Info

- **Category:** Health & Fitness (primary), Lifestyle (secondary)
- **Age Rating:** fill out the questionnaire honestly (likely 4+)
- **Copyright:** "© 2026 [Your Name/Company]"

---

## 3. Apple Human Interface Guidelines for Habit Trackers

### Key HIG Principles for Challenge Forge

**Navigation:**
- Use a **Tab Bar** for top-level navigation (Today, Challenges, Progress, Settings)
- Max 5 tabs — keep it simple
- Use SF Symbols for tab icons for native feel

**Notifications:**
- Request permission at a *contextually appropriate* moment (not on first launch)
- Best practice: show an in-app "pre-permission" screen explaining *why* you need notifications before the system dialog
- Provide granular notification settings in-app

**HealthKit Integration (if applicable):**
- Only request the specific data types you need
- Explain purpose clearly in the permission dialog (`NSHealthShareUsageDescription`)
- Gracefully handle denial — app must work without HealthKit

**Widgets (recommended for habit trackers):**
- Provide a Lock Screen and/or Home Screen widget showing today's progress
- Widgets significantly improve retention and are reviewed favorably

**Design Patterns:**
- Use **SF Symbols** where possible (consistency with iOS)
- Support **Dynamic Type** (accessibility requirement in spirit)
- Support **Dark Mode** — required for modern iOS apps in practice
- Use **haptic feedback** for completions (UIImpactFeedbackGenerator)
- Respect **Safe Areas** — especially on devices with Dynamic Island / notch
- Charts: use the native `Charts` framework style even if using a JS charting lib (match the iOS visual language)

**Accessibility:**
- VoiceOver labels on all interactive elements
- Minimum 4.5:1 contrast ratio for text
- Don't rely solely on color to convey information (e.g., green = done)

**Onboarding:**
- Keep it under 3 screens
- Let users skip and get to the app quickly
- Don't require account creation to try the app

---

## 4. Privacy Policy Requirements

### What Apple Requires

1. **Privacy Policy URL** in App Store Connect metadata (mandatory)
2. **Privacy Policy accessible inside the app** (Settings screen, < 2 taps)
3. **App Privacy "Nutrition Labels"** — filled out in App Store Connect

### Privacy Nutrition Labels (App Store Connect)

You must declare ALL data your app collects. For Challenge Forge, likely categories:

| Data Type | Usage | Linked to Identity? |
|-----------|-------|-------------------|
| Name / Email (if accounts exist) | App Functionality | Yes |
| Health & Fitness (if HealthKit) | App Functionality | Yes |
| Usage Data (analytics) | Analytics | Depends on analytics SDK |
| Identifiers (device ID) | Analytics | Only if using ad tracking |
| Purchases | App Functionality | Yes |

**If you use NO analytics and NO accounts**, you may qualify for "Data Not Collected" — the gold standard.

### Privacy Policy Content (must include):

- What data is collected and why
- How data is stored and protected
- Third-party services that receive data (analytics, crash reporting, RevenueCat, etc.)
- User rights (access, deletion, portability)
- Contact information
- GDPR compliance (if serving EU users)
- CCPA compliance (if serving California users)
- Children's privacy (COPPA — state if app is not for children under 13)

### Required Info.plist Keys

```xml
<!-- If using notifications -->
<key>NSUserNotificationsUsageDescription</key>
<string>We'll remind you to complete your daily challenges.</string>

<!-- If using HealthKit -->
<key>NSHealthShareUsageDescription</key>
<string>Challenge Forge reads your activity data to track fitness challenges.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>Challenge Forge logs completed workouts to your health data.</string>

<!-- If using camera (progress photos) -->
<key>NSCameraUsageDescription</key>
<string>Take progress photos for your challenges.</string>

<!-- If using photo library -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Select photos for your challenge progress.</string>
```

In `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSUserNotificationsUsageDescription": "We'll remind you to complete your daily challenges."
      }
    }
  }
}
```

---

## 5. In-App Purchase Setup ($14.99 Lifetime Unlock)

### IAP Type

Use a **Non-Consumable** in-app purchase — this is for one-time purchases that persist forever.

### App Store Connect Setup

1. **Go to** App Store Connect → Your App → Monetization → In-App Purchases
2. **Create new** → Non-Consumable
3. **Reference Name:** "Lifetime Pro Unlock" (internal only)
4. **Product ID:** `com.challengeforge.lifetime_pro` (convention: reverse domain + descriptive name)
5. **Price:** $14.99 (Tier 22 or set a custom price)
6. **Localization:** Add display name ("Challenge Forge Pro — Lifetime") and description for each locale
7. **Review Screenshot:** Screenshot of the purchase screen in your app
8. **Review Notes:** "This unlocks all premium features permanently with a single purchase."

### Implementation (React Native)

**Recommended library:** [`react-native-purchases`](https://github.com/RevenueCat/react-native-purchases) (RevenueCat) or [`expo-in-app-purchases`](https://docs.expo.dev/versions/latest/sdk/in-app-purchases/) / [`react-native-iap`](https://github.com/dooboolab-community/react-native-iap)

**RevenueCat approach (recommended — handles receipt validation server-side):**

```bash
npx expo install react-native-purchases
```

```typescript
import Purchases from 'react-native-purchases';

// Initialize (app startup)
Purchases.configure({ apiKey: 'your_revenuecat_api_key' });

// Fetch offerings
const offerings = await Purchases.getOfferings();
const lifetimePackage = offerings.current?.lifetime;

// Purchase
const { customerInfo } = await Purchases.purchasePackage(lifetimePackage);
const isPro = customerInfo.entitlements.active['pro'] !== undefined;

// Restore
const customerInfo = await Purchases.restorePurchases();
const isPro = customerInfo.entitlements.active['pro'] !== undefined;
```

### Critical Requirements

- [ ] **Restore Purchases button** — must be visible and functional (Settings screen + Paywall screen)
- [ ] **Graceful handling** of purchase failures, cancellations, and network errors
- [ ] **No external payment links** — all digital unlocks through Apple IAP
- [ ] **Clear pricing** shown before purchase confirmation
- [ ] **Test with Sandbox accounts** in App Store Connect → Users and Access → Sandbox Testers

### What to Show Free vs Pro

| Feature | Free | Pro |
|---------|------|-----|
| Active challenges | 3 max | Unlimited |
| Challenge templates | Basic | All templates |
| Progress analytics | 7-day view | Full history + insights |
| Themes / customization | Default | All themes |
| Export data | — | CSV export |
| Widgets | Basic | All widget styles |

### StoreKit Testing

Use **StoreKit Configuration File** in Xcode for local testing:
1. File → New → StoreKit Configuration File
2. Add your product with matching product ID
3. Scheme → Edit Scheme → Options → StoreKit Configuration → select your file
4. Test purchase flows without needing sandbox accounts

---

## 6. Expo EAS Build & Submission Workflow

### Prerequisites

1. **Apple Developer Account** ($99/year) — enrolled and active
2. **Expo Account** — signed up at expo.dev
3. **EAS CLI** installed: `npm install -g eas-cli`
4. **App Store Connect** — app record created with matching Bundle ID

### One-Time Setup

```bash
# Login to Expo
eas login

# Configure EAS for your project
eas build:configure

# This creates/updates eas.json
```

### eas.json Configuration

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "buildConfiguration": "Release"
      }
    },
    "production": {
      "ios": {
        "buildConfiguration": "Release",
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

### app.json Key Fields

```json
{
  "expo": {
    "name": "Challenge Forge",
    "slug": "challenge-forge",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.challengeforge",
      "buildNumber": "1",
      "supportsTablet": false,
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    }
  }
}
```

> **Important:** Set `ITSAppUsesNonExemptEncryption` to `false` if you only use HTTPS (no custom encryption). This skips the export compliance questionnaire on every submission.

### Build & Submit Commands

```bash
# Build for production
eas build --platform ios --profile production

# Submit the latest build to App Store Connect (TestFlight)
eas submit --platform ios --profile production

# Build AND auto-submit in one step
eas build --platform ios --profile production --auto-submit

# Submit a specific build (by ID or URL)
eas submit --platform ios --id BUILD_ID
```

### CI/CD with EAS Workflows

Create `.eas/workflows/submit-ios.yml`:

```yaml
on:
  push:
    branches: ['main']

jobs:
  build_ios:
    name: Build iOS app
    type: build
    params:
      platform: ios
      profile: production

  submit_ios:
    name: Submit to TestFlight
    needs: [build_ios]
    type: testflight
    params:
      build_id: ${{ needs.build_ios.outputs.build_id }}
```

### Full Submission Flow (Step by Step)

```
1. Finalize code & test locally
        ↓
2. `eas build --platform ios --profile production`
   (builds on EAS cloud servers, handles signing automatically)
        ↓
3. `eas submit --platform ios`
   (uploads .ipa to App Store Connect → appears in TestFlight)
        ↓
4. Test via TestFlight
   - Internal testing (up to 100 testers, no review needed)
   - External testing (up to 10,000, requires brief review)
        ↓
5. In App Store Connect:
   - Fill in all metadata (description, screenshots, keywords)
   - Set pricing (Free with IAP)
   - Complete App Privacy questionnaire
   - Select the build from TestFlight
   - Add app review notes + demo credentials
        ↓
6. Submit for Review
   (typical review time: 24-48 hours)
        ↓
7. Approved → Release
   - "Manually release" recommended for v1.0
   - Switch to "Automatically release" for updates
```

### OTA Updates with EAS Update

After initial approval, push JS-only changes without re-review:

```bash
# Push an update to production
eas update --branch production --message "Fix streak calculation"
```

> **Note:** OTA updates cannot change native code, add new permissions, or modify the app binary. They're for JS/asset changes only.

### Credentials Management

EAS handles iOS signing automatically. On first build:
- Creates/manages Distribution Certificates
- Creates/manages Provisioning Profiles
- Stores them securely in EAS servers

To manage manually if needed:
```bash
eas credentials
```

---

## Quick Reference: Submission Checklist

### Before Building
- [ ] `app.json` version and buildNumber updated
- [ ] All placeholder content removed
- [ ] App icon is 1024×1024 PNG, no transparency
- [ ] Privacy policy hosted and accessible via URL
- [ ] `ITSAppUsesNonExemptEncryption` set to `false` (if applicable)

### Before Submitting to Review
- [ ] Screenshots uploaded for 6.7" iPhone (minimum)
- [ ] App name, subtitle, description, keywords filled
- [ ] Privacy nutrition labels completed
- [ ] In-app purchase created and submitted for review (submit with app)
- [ ] Restore Purchases works on clean install
- [ ] Privacy policy linked in metadata AND accessible in-app
- [ ] Account deletion available (if accounts exist)
- [ ] App Review Notes filled with test instructions
- [ ] Demo credentials provided (if login required)
- [ ] Tested on clean device — full user flow works

### After Approval
- [ ] Verify app appears correctly on App Store
- [ ] Test a real purchase (use a promo code first if you want)
- [ ] Monitor crash reports in Xcode Organizer / EAS dashboard
- [ ] Respond to any user reviews within 24 hours

---

## Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Expo EAS Submit Docs](https://docs.expo.dev/submit/ios/)
- [RevenueCat React Native Docs](https://www.revenuecat.com/docs/getting-started/installation/reactnative)
- [StoreKit 2 Documentation](https://developer.apple.com/storekit/)
- [Screenshot Specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
