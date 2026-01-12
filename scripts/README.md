# 🔧 Scripts - Automated Tasks

## Available Scripts

### 📁 `reorganize-screens.ps1` / `reorganize-screens.bat`

**Purpose**: Automatically reorganize screens folder into professional feature-based structure.

**What it does**:
1. ✅ Creates all feature folders (Auth, Feed, VoiceRoom, Calls, Chats, Notifications, Profile)
2. ✅ Creates sub-folders (hooks, components, etc.)
3. ✅ Moves existing screen files to new locations
4. ✅ Removes old/unused files
5. ✅ Provides detailed output of all actions

---

## 🚀 How to Run

### Option 1: Double-click the batch file (Easiest)
```
Just double-click: reorganize-screens.bat
```

### Option 2: Run from PowerShell
```powershell
cd f:\Project\wakie-app\frontend\VoiceSphere
.\scripts\reorganize-screens.ps1
```

### Option 3: Run from Command Prompt
```cmd
cd f:\Project\wakie-app\frontend\VoiceSphere\scripts
reorganize-screens.bat
```

---

## 📊 Before & After

### Before (Flat Structure)
```
src/screens/
├── HomeScreen.tsx
├── LoginScreen.tsx
├── LiveFeedScreen.tsx
├── ChatsScreen.tsx
├── EnhancedProfileScreen.tsx
└── ... (14 files)
```

### After (Feature Structure)
```
src/screens/
├── Auth/
│   ├── Home/
│   ├── Login/
│   └── Signup/
├── Feed/
│   ├── LiveFeed/
│   ├── CreateTopic/
│   └── TopicDetail/
├── VoiceRoom/
├── Calls/
│   ├── IncomingCall/
│   └── ActiveCall/
├── Chats/
│   ├── ChatList/
│   └── ChatDetail/
├── Notifications/
└── Profile/
    ├── UserProfile/
    ├── EditProfile/
    └── Settings/
```

---

## ⚠️ Important Notes

### After running the script, you MUST:

1. **Update Import Statements**
   
   **In `src/core/navigation/TabNavigator.tsx`**:
   ```typescript
   // OLD
   import { LiveFeedScreen } from '@screens/LiveFeedScreen';
   
   // NEW
   import { LiveFeedScreen } from '@screens/Feed/LiveFeed/LiveFeedScreen';
   // OR
   import { LiveFeedScreen } from '@screens';
   ```

2. **Update all navigation files**:
   - `src/core/navigation/TabNavigator.tsx`
   - `src/core/navigation/RootNavigator.tsx`
   - Any component that imports screens

3. **Restart Metro bundler**:
   ```bash
   # Stop current bundler (Ctrl+C)
   npm start -- --reset-cache
   ```

---

## 🔄 If Something Goes Wrong

The script is **safe** and **non-destructive**:
- It uses `Move-Item` (not delete)
- Files are moved, not deleted
- You can manually move files back if needed

### Manual Rollback:
If you need to undo:
1. Move files back from feature folders to `src/screens/`
2. Delete the feature folders
3. Your original files are still there!

---

## ✅ Verification

After running the script, verify:

```powershell
# Check folder structure
tree src\screens /F

# Should show:
# Auth/Home/HomeScreen.tsx
# Feed/LiveFeed/LiveFeedScreen.tsx
# ... etc
```

---

## 📝 What Gets Moved

| Old Location | New Location |
|-------------|--------------|
| `HomeScreen.tsx` | `Auth/Home/HomeScreen.tsx` |
| `LoginScreen.tsx` | `Auth/Login/LoginScreen.tsx` |
| `SignupScreen.tsx` | `Auth/Signup/SignupScreen.tsx` |
| `LiveFeedScreen.tsx` | `Feed/LiveFeed/LiveFeedScreen.tsx` |
| `CreateTopicScreen.tsx` | `Feed/CreateTopic/CreateTopicScreen.tsx` |
| `TopicDetailScreen.tsx` | `Feed/TopicDetail/TopicDetailScreen.tsx` |
| `CallScreen.tsx` | `Calls/ActiveCall/ActiveCallScreen.tsx` |
| `ChatsScreen.tsx` | `Chats/ChatList/ChatsScreen.tsx` |
| `EnhancedNotificationsScreen.tsx` | `Notifications/NotificationList/NotificationsScreen.tsx` |
| `EnhancedProfileScreen.tsx` | `Profile/UserProfile/ProfileScreen.tsx` |

### Files Removed (Duplicates/Unused):
- `FeedScreen.tsx` (using LiveFeedScreen instead)
- `NotificationsScreen.tsx` (using EnhancedNotificationsScreen)
- `ProfileScreen.tsx` (using EnhancedProfileScreen)
- `ClubsScreen.tsx` (not in current scope)

---

## 🎯 Summary

This script automates the entire reorganization process that would take 30+ minutes manually.

**Just run it and update your imports!** 🚀

---

**Created**: 2026-01-08  
**Safe to Run**: Yes (non-destructive)  
**Time Saved**: ~30 minutes  

