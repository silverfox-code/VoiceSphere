# Setup and Test Guide

## Prerequisites (macOS M5)
- **Node.js**: v18+
- **Ruby**: v2.7+ (for CocoaPods)
- **Xcode**: 15+ (with Command Line Tools selected)
- **Android Studio**: Ladybug or newer
- **Rust**: 1.75+
- **Docker Desktop**: With Kubernetes enabled

## Phase 1: Frontend Setup

### 1. Install Dependencies
```bash
cd VoiceSphere
npm install
```

### 2. iOS Setup
```bash
cd ios
pod install
cd ..
```

### 3. Run iOS App
```bash
npx react-native run-ios
```

### 4. Run Android App
```bash
npx react-native run-android
```

## Smoke Tests (Frontend)
1.  **Launch**: App opens without crashing.
2.  **Login**: Enter any email/password and tap "Log In".
3.  **Feed**: Verify list of topics is visible.
4.  **Create Topic**: Tap "+ New Topic", enter title, submit. Verify it appears.
5.  **Voice Call**: Tap a topic, enter call screen. Toggle Mute/Speaker.
6.  **Profile**: Go to Profile tab, tap "Log Out".

## Phase 2: Backend Setup (Rust & K8s)

### 1. Build Docker Image
```bash
cd VoiceSphereBackend
docker build -t voicesphere-backend:latest .
```

### 2. Deploy ScyllaDB (StatefulSet)
```bash
kubectl apply -f k8s/scylla-service.yaml
kubectl apply -f k8s/scylla-statefulset.yaml
```

### 3. Verify ScyllaDB Cluster
Wait for the node to be ready:
```bash
kubectl wait --for=condition=Ready pod scylla-0 --timeout=300s
```

### 4. Initialize Database Schema
Run `cqlsh` inside the node to create Keyspace and Table:
```bash
kubectl exec -it scylla-0 -- cqlsh
```
Inside the CQL shell:
```sql
CREATE KEYSPACE IF NOT EXISTS voicesphere WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };
USE voicesphere;
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    name TEXT,
    email TEXT,
    created_at TIMESTAMP
);
```

### 5. Deploy Backend to Kubernetes
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### 6. Verify Deployment
```bash
kubectl get pods
kubectl get services
```

### 7. Access from Mobile
- **Database Host**: `scylla-service.default.svc.cluster.local` (Internal K8s DNS)
- **Localhost**: `http://localhost:8080` (forwarded by K8s)
- **Android Emulator**: Use `http://10.0.2.2:8080`
- **iOS Simulator**: Use `http://localhost:8080`

