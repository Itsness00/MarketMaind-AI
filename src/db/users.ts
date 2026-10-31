import { db } from './index.ts';
import { users, userApiSources } from './schema.ts';
import { and, eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  fullName: string = 'Institutional Analyst',
  authProvider: string = 'google'
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        fullName,
        authProvider,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          fullName,
          authProvider,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database user upsert failed:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}

export async function getUserApiSourcesByUid(uid: string) {
  try {
    const rows = await db
      .select({
        id: userApiSources.id,
        sourceKey: userApiSources.sourceKey,
        name: userApiSources.name,
        category: userApiSources.category,
        endpointUrl: userApiSources.endpointUrl,
        protocol: userApiSources.protocol,
        description: userApiSources.description,
        enabled: userApiSources.enabled,
      })
      .from(userApiSources)
      .innerJoin(users, eq(userApiSources.userId, users.id))
      .where(eq(users.uid, uid));

    return rows;
  } catch (error) {
    console.error('Database query for user API sources failed:', error);
    throw new Error('Failed to load custom API sources.', { cause: error });
  }
}

export async function addUserApiSourceForUid(
  uid: string,
  email: string,
  source: {
    sourceKey: string;
    name: string;
    category: string;
    endpointUrl: string;
    protocol: string;
    description: string;
    enabled: boolean;
  }
) {
  try {
    const userRow = await getOrCreateUser(uid, email);
    const existing = await db
      .select()
      .from(userApiSources)
      .where(
        and(
          eq(userApiSources.userId, userRow.id),
          eq(userApiSources.sourceKey, source.sourceKey)
        )
      );

    if (existing.length > 0) {
      const updated = await db
        .update(userApiSources)
        .set({
          name: source.name,
          category: source.category,
          endpointUrl: source.endpointUrl,
          protocol: source.protocol,
          description: source.description,
          enabled: source.enabled,
        })
        .where(eq(userApiSources.id, existing[0].id))
        .returning();
      return updated[0];
    }

    const inserted = await db
      .insert(userApiSources)
      .values({
        userId: userRow.id,
        sourceKey: source.sourceKey,
        name: source.name,
        category: source.category,
        endpointUrl: source.endpointUrl,
        protocol: source.protocol,
        description: source.description,
        enabled: source.enabled,
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database insert for user API source failed:', error);
    throw new Error('Failed to save custom API source.', { cause: error });
  }
}

export async function deleteUserApiSourceForUid(uid: string, sourceKey: string) {
  try {
    const userRows = await db.select().from(users).where(eq(users.uid, uid));
    if (userRows.length === 0) return;
    await db
      .delete(userApiSources)
      .where(
        and(
          eq(userApiSources.userId, userRows[0].id),
          eq(userApiSources.sourceKey, sourceKey)
        )
      );
  } catch (error) {
    console.error('Database delete for user API source failed:', error);
    throw new Error('Failed to delete custom API source.', { cause: error });
  }
}
