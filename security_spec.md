# MarketMind AI — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants & Master Source of Truth

1. **Master Gate (`/users/{userId}`)**:
   - A `UserProfile` document at `/users/{userId}` can only be read, created, updated, or deleted by an authenticated user with `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
   - `ownerId` MUST equal `request.auth.uid` and `userId`, and is immutable (`incoming().ownerId == existing().ownerId`).
   - `createdAt` MUST equal `request.time` on creation and is immutable on update.
   - `updatedAt` MUST equal `request.time` on creation and update.
   - All string fields enforce strict `.size()` boundaries matching `firebase-blueprint.json`.

2. **Relational Subcollections (`/users/{userId}/connectors/{connectorId}` & `/users/{userId}/positions/{positionId}`)**:
   - Sub-resources cannot exist or be accessed unless the parent `/users/{userId}` document exists (`exists(/databases/$(database)/documents/users/$(userId))`) and `get(/databases/$(database)/documents/users/$(userId)).data.ownerId == request.auth.uid`.
   - All document IDs (`userId`, `connectorId`, `positionId`) must satisfy `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
   - Every `allow list` rule explicitly enforces `resource.data.ownerId == request.auth.uid` and `request.auth.uid == userId` without calling `get()`/`exists()` inside `list`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Identity Spoofing on UserProfile Create)**:
   `uid: "attacker_1"` attempts to create `/users/victim_1` or sets `ownerId: "victim_1"`. -> `PERMISSION_DENIED`
2. **Payload 2 (Unverified Email Write)**:
   `uid: "user_1"` with `email_verified: false` attempts to create `/users/user_1`. -> `PERMISSION_DENIED`
3. **Payload 3 (Shadow / Ghost Field Injection)**:
   `uid: "user_1"` sends valid `UserProfile` plus `"isAdmin": true` or `"isVerified": true`. Rejected by `.keys().hasOnly(...)`. -> `PERMISSION_DENIED`
4. **Payload 4 (PII Cross-Tenant Read)**:
   `uid: "attacker_1"` attempts `get` on `/users/user_1` (which contains `email`). Rejected by `isOwner(userId)`. -> `PERMISSION_DENIED`
5. **Payload 5 (ID Poisoning / 2KB Path ID)**:
   `uid: "user_1"` attempts to create `/users/user_1/connectors/bad$id!with@invalid#chars`. Rejected by `isValidId(connectorId)`. -> `PERMISSION_DENIED`
6. **Payload 6 (Orphaned Subcollection Write Without Parent Master Gate)**:
   `uid: "user_1"` attempts to create `/users/user_1/connectors/conn_1` before `/users/user_1` exists. Rejected by `hasParentUser(userId)`. -> `PERMISSION_DENIED`
7. **Payload 7 (Immutable Field Mutation on Update)**:
   `uid: "user_1"` attempts to update `ownerId` or `createdAt` on `/users/user_1`. Rejected by `incoming().ownerId == existing().ownerId && incoming().createdAt == existing().createdAt`. -> `PERMISSION_DENIED`
8. **Payload 8 (Client Timestamp Spoofing)**:
   `uid: "user_1"` attempts to write a forged past/future `updatedAt` timestamp instead of `request.time`. Rejected by `incoming().updatedAt == request.time`. -> `PERMISSION_DENIED`
9. **Payload 9 (Denial-of-Wallet Oversized String)**:
   `uid: "user_1"` sends a 10,000-character `bioNotes` string (limit 500). Rejected by `data.bioNotes.size() <= 500`. -> `PERMISSION_DENIED`
10. **Payload 10 (Enum Bypass Attack)**:
    `uid: "user_1"` sets `preferredAIEngine: "untrusted-model"` or `baseCurrency: "BTC"`. Rejected by strict enum list membership. -> `PERMISSION_DENIED`
11. **Payload 11 (Value Poisoning on Whitelisted Update Key)**:
    `uid: "user_1"` updates only `shares` on `/users/user_1/positions/NVDA`, but sets `shares: -500` or `shares: "invalid"`. Rejected by `isValidPortfolioPosition(incoming())`. -> `PERMISSION_DENIED`
12. **Payload 12 (Unauthorized List Scraping)**:
    `uid: "attacker_1"` attempts `list` on `/users/user_1/positions`. Rejected by `request.auth.uid == userId && resource.data.ownerId == request.auth.uid`. -> `PERMISSION_DENIED`
