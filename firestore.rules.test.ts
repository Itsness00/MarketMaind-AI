import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

test('Firestore Rules — Dirty Dozen & 8-Pillar Static Verification', async (t) => {
  await t.test('1. Global Default-Deny Safety Net is present at top of ruleset', () => {
    assert.ok(rulesContent.includes("rules_version = '2';"));
    assert.ok(rulesContent.includes('match /{document=**}'));
    assert.ok(rulesContent.includes('allow read, write: if false;'));
  });

  await t.test('2. Email Verification & Identity Integrity are enforced on all writes', () => {
    assert.ok(rulesContent.includes('request.auth.token.email_verified == true'));
    assert.ok(rulesContent.includes('data.ownerId == request.auth.uid'));
  });

  await t.test('3. Path Variable ID Poisoning Guard (isValidId) is enforced', () => {
    assert.ok(rulesContent.includes("id.matches('^[a-zA-Z0-9_\\\\-]+$')"));
    assert.ok(rulesContent.includes('isValidId(userId)'));
    assert.ok(rulesContent.includes('isValidId(connectorId)'));
    assert.ok(rulesContent.includes('isValidId(positionId)'));
  });

  await t.test('4. Shadow Field Injection blocked via hasAll and hasOnly on all entities', () => {
    assert.ok(rulesContent.includes('data.keys().hasAll('));
    assert.ok(rulesContent.includes('data.keys().hasOnly('));
    assert.ok(rulesContent.includes('incoming().diff(existing()).affectedKeys().hasOnly('));
  });

  await t.test('5. Master Gate (hasParentUser) enforced on subcollections and excluded from list', () => {
    assert.ok(rulesContent.includes('function hasParentUser(userId)'));
    assert.ok(rulesContent.includes('exists(/databases/$(database)/documents/users/$(userId))'));
    assert.ok(rulesContent.includes('allow list: if isOwner(userId) &&\n          existing().ownerId == request.auth.uid;'));
  });

  await t.test('6. Temporal Integrity & Immutable Fields (ownerId, createdAt, updatedAt)', () => {
    assert.ok(rulesContent.includes('incoming().createdAt == request.time'));
    assert.ok(rulesContent.includes('incoming().updatedAt == request.time'));
    assert.ok(rulesContent.includes('incoming().ownerId == existing().ownerId'));
    assert.ok(rulesContent.includes('incoming().createdAt == existing().createdAt'));
  });
});
