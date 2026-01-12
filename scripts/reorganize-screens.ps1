# ============================================================================
# Screen Folder Reorganization Script
# Automatically creates folders and moves files to feature-based structure
# ============================================================================

Write-Host "🚀 Starting Screen Folder Reorganization..." -ForegroundColor Cyan
Write-Host ""

# Set base path
$basePath = "src\screens"

# ============================================================================
# STEP 1: Create Feature Folders
# ============================================================================

Write-Host "📁 Creating feature folders..." -ForegroundColor Yellow

# Auth folders
New-Item -Path "$basePath\Auth\Home" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Auth\Login\hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Auth\Login\components" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Auth\Signup\hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Auth\Signup\components" -ItemType Directory -Force | Out-Null

# Feed folders
New-Item -Path "$basePath\Feed\LiveFeed\hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Feed\LiveFeed\components" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Feed\CreateTopic\hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Feed\CreateTopic\components" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Feed\TopicDetail\hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Feed\TopicDetail\components" -ItemType Directory -Force | Out-Null

# VoiceRoom folders (already has main folder, just add components)
New-Item -Path "$basePath\VoiceRoom\components" -ItemType Directory -Force | Out-Null

# Calls folders
New-Item -Path "$basePath\Calls\IncomingCall\hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Calls\IncomingCall\components" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Calls\ActiveCall\hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Calls\ActiveCall\components" -ItemType Directory -Force | Out-Null

# Chats folders
New-Item -Path "$basePath\Chats\ChatList\hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Chats\ChatList\components" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Chats\ChatDetail\hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Chats\ChatDetail\components" -ItemType Directory -Force | Out-Null

# Notifications folders
New-Item -Path "$basePath\Notifications\NotificationList\hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Notifications\NotificationList\components" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Notifications\NotificationSettings\components" -ItemType Directory -Force | Out-Null

# Profile folders
New-Item -Path "$basePath\Profile\UserProfile\hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Profile\UserProfile\components" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Profile\EditProfile\hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Profile\EditProfile\components" -ItemType Directory -Force | Out-Null
New-Item -Path "$basePath\Profile\Settings" -ItemType Directory -Force | Out-Null

Write-Host "✅ Feature folders created!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 2: Move Existing Files
# ============================================================================

Write-Host "📦 Moving screen files to feature folders..." -ForegroundColor Yellow

# Function to move file if it exists
function Move-ScreenFile {
    param (
        [string]$Source,
        [string]$Destination
    )
    
    if (Test-Path $Source) {
        Move-Item -Path $Source -Destination $Destination -Force
        Write-Host "  ✓ Moved: $(Split-Path $Source -Leaf) → $Destination" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ Skipped (not found): $(Split-Path $Source -Leaf)" -ForegroundColor DarkGray
    }
}

# Move Auth screens
Write-Host "`n🔐 Auth Screens:" -ForegroundColor Cyan
Move-ScreenFile "$basePath\HomeScreen.tsx" "$basePath\Auth\Home\HomeScreen.tsx"
Move-ScreenFile "$basePath\LoginScreen.tsx" "$basePath\Auth\Login\LoginScreen.tsx"
Move-ScreenFile "$basePath\SignupScreen.tsx" "$basePath\Auth\Signup\SignupScreen.tsx"

# Move Feed screens
Write-Host "`n📰 Feed Screens:" -ForegroundColor Cyan
Move-ScreenFile "$basePath\LiveFeedScreen.tsx" "$basePath\Feed\LiveFeed\LiveFeedScreen.tsx"
Move-ScreenFile "$basePath\CreateTopicScreen.tsx" "$basePath\Feed\CreateTopic\CreateTopicScreen.tsx"
Move-ScreenFile "$basePath\TopicDetailScreen.tsx" "$basePath\Feed\TopicDetail\TopicDetailScreen.tsx"

# Move Calls screens
Write-Host "`n📞 Call Screens:" -ForegroundColor Cyan
Move-ScreenFile "$basePath\CallScreen.tsx" "$basePath\Calls\ActiveCall\ActiveCallScreen.tsx"

# Move Chats screens
Write-Host "`n💬 Chat Screens:" -ForegroundColor Cyan
Move-ScreenFile "$basePath\ChatsScreen.tsx" "$basePath\Chats\ChatList\ChatsScreen.tsx"

# Move Notifications screens
Write-Host "`n🔔 Notification Screens:" -ForegroundColor Cyan
Move-ScreenFile "$basePath\EnhancedNotificationsScreen.tsx" "$basePath\Notifications\NotificationList\NotificationsScreen.tsx"

# Move Profile screens
Write-Host "`n👤 Profile Screens:" -ForegroundColor Cyan
Move-ScreenFile "$basePath\EnhancedProfileScreen.tsx" "$basePath\Profile\UserProfile\ProfileScreen.tsx"

Write-Host ""
Write-Host "✅ Screen files moved!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 3: Clean Up Old/Unused Files
# ============================================================================

Write-Host "🧹 Cleaning up old files..." -ForegroundColor Yellow

function Remove-OldFile {
    param (
        [string]$FilePath
    )
    
    if (Test-Path $FilePath) {
        Remove-Item -Path $FilePath -Force
        Write-Host "  ✓ Removed: $(Split-Path $FilePath -Leaf)" -ForegroundColor Gray
    }
}

Remove-OldFile "$basePath\FeedScreen.tsx"
Remove-OldFile "$basePath\NotificationsScreen.tsx"
Remove-OldFile "$basePath\ProfileScreen.tsx"
Remove-OldFile "$basePath\ClubsScreen.tsx"

Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 4: Summary
# ============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ Screen Reorganization Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 New Structure:" -ForegroundColor Yellow
Write-Host "  ├── Auth/           (Home, Login, Signup)" -ForegroundColor White
Write-Host "  ├── Feed/           (LiveFeed, CreateTopic, TopicDetail)" -ForegroundColor White
Write-Host "  ├── VoiceRoom/      (Already structured!)" -ForegroundColor White
Write-Host "  ├── Calls/          (IncomingCall, ActiveCall)" -ForegroundColor White
Write-Host "  ├── Chats/          (ChatList, ChatDetail)" -ForegroundColor White
Write-Host "  ├── Notifications/  (NotificationList, Settings)" -ForegroundColor White
Write-Host "  └── Profile/        (UserProfile, EditProfile, Settings)" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Update your imports!" -ForegroundColor Red
Write-Host ""
Write-Host "  OLD:" -ForegroundColor DarkGray
Write-Host "    import { LiveFeedScreen } from '@screens/LiveFeedScreen';" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  NEW:" -ForegroundColor Green
Write-Host "    import { LiveFeedScreen } from '@screens/Feed/LiveFeed/LiveFeedScreen';" -ForegroundColor Green
Write-Host "    // OR use barrel export:" -ForegroundColor Green
Write-Host "    import { LiveFeedScreen } from '@screens';" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Files to update:" -ForegroundColor Yellow
Write-Host "  - src/core/navigation/TabNavigator.tsx" -ForegroundColor White
Write-Host "  - src/core/navigation/RootNavigator.tsx" -ForegroundColor White
Write-Host "  - Any other files importing screens" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Done! Your screens are now professionally organized!" -ForegroundColor Green
Write-Host ""
