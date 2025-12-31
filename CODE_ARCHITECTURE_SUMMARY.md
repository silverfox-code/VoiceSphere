# Code Architecture Summary

## /src/App.tsx
**Purpose**: The main entry point of the application.
**Key Functions**:
- `App()`: Initializes the `SafeAreaProvider` and renders the `RootNavigator`.

## /src/navigation/RootNavigator.tsx
**Purpose**: Manages the application's navigation stack and authentication state.
**Key Functions**:
- `AppStack()`: Conditionally renders Auth screens (Login/Signup) or Main App (TabNavigator) based on `user` state.
- `RootNavigator()`: Wraps the app in `AuthProvider` and `NavigationContainer`.

## /src/navigation/TabNavigator.tsx
**Purpose**: Defines the bottom tab navigation (Feed, Clubs, Profile).
**Key Functions**:
- `TabNavigator()`: Configures the bottom tabs and their icons/styles.

## /src/context/AuthContext.tsx
**Purpose**: Manages global authentication state.
**Key Functions**:
- `AuthProvider`: Provides `user`, `login`, and `logout` to the app.
- `login(token)`: Simulates an API login call.
- `logout()`: Clears the user session.

## /src/services/TopicService.ts
**Purpose**: Handles data fetching and creation for Topics.
**Key Functions**:
- `getTopics()`: Returns a list of mock topics.
- `createTopic(title, description)`: Adds a new topic to the mock list.

## /src/screens/FeedScreen.tsx
**Purpose**: Displays the main feed of active topics.
**Key Functions**:
- `FeedScreen()`: Renders a `FlatList` of `TopicCard` components.
- `loadTopics()`: Fetches data from `TopicService`.

## /src/screens/CallScreen.tsx
**Purpose**: Handles the real-time voice call interface.
**Key Functions**:
- `CallScreen()`: Renders the call UI with Mute/Speaker/End controls.
- `toggleMute()`: Toggles local audio track (mocked).

## /src/screens/LoginScreen.tsx
**Purpose**: User login interface.
**Key Functions**:
- `handleLogin()`: Calls `login()` from `AuthContext`.

## /src/screens/SignupScreen.tsx
**Purpose**: User registration interface.
**Key Functions**:
- `handleSignup()`: Calls `login()` (mocked signup).

## /src/components/TopicCard.tsx
**Purpose**: Reusable component to display a single topic summary.
**Key Functions**:
- `TopicCard({ topic, onPress })`: Renders topic title, author, and participant count.

## /src/global.css
**Purpose**: Global styles and Tailwind directives.

## /VoiceSphereBackend/k8s/scylla-statefulset.yaml
**Purpose**: Defines the 3-node ScyllaDB cluster.
**Key Components**:
- `StatefulSet`: Manages the deployment and scaling of a set of Pods, and provides guarantees about the ordering and uniqueness of these Pods.
- `Resources`: Limits set to 1 vCPU and 2Gi RAM per node.
- `VolumeClaimTemplates`: Requests 5Gi storage per node.

## /VoiceSphereBackend/k8s/scylla-service.yaml
**Purpose**: Headless service for ScyllaDB.
**Key Components**:
- `ClusterIP: None`: Enables direct discovery of individual pod IPs for token-aware routing.

## /VoiceSphereBackend/k8s/deployment.yaml
**Purpose**: Deployment for the Rust backend.

## /VoiceSphereBackend/k8s/service.yaml
**Purpose**: Service for the Rust backend.
