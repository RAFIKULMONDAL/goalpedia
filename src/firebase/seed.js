import { db } from './config';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { PLAYERS } from '../data/players';
import { CLUBS }   from '../data/clubs';

const slugify = (name) =>
  (name || '').toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export async function seedFirestore() {
  try {
    console.log('🌱 Starting seed — wiping ALL old data...');

    // ── Step 1: Wipe ALL existing players ────────────────
    const existingPlayers = await getDocs(collection(db, 'players'));
    if (existingPlayers.size > 0) {
      const delBatch = writeBatch(db);
      existingPlayers.docs.forEach(d => delBatch.delete(d.ref));
      await delBatch.commit();
      console.log(`🗑  Deleted ${existingPlayers.size} old players`);
    }

    // ── Step 2: Wipe ALL existing clubs ──────────────────
    const existingClubs = await getDocs(collection(db, 'clubs'));
    if (existingClubs.size > 0) {
      const delBatch = writeBatch(db);
      existingClubs.docs.forEach(d => delBatch.delete(d.ref));
      await delBatch.commit();
      console.log(`🗑  Deleted ${existingClubs.size} old clubs`);
    }

    // ── Step 3: Seed clubs ────────────────────────────────
    const clubBatch = writeBatch(db);
    CLUBS.forEach(club => {
      clubBatch.set(doc(db, 'clubs', club.id), {
        ...club,
        logo: '', // ClubCard fetches from SportsDB
      });
    });
    await clubBatch.commit();
    console.log(`✅ ${CLUBS.length} clubs seeded`);

    // ── Step 4: Seed players ──────────────────────────────
    // Deduplicate by name first
    const seen = new Set();
    const uniquePlayers = PLAYERS.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });

    const playerBatch = writeBatch(db);
    uniquePlayers.forEach(player => {
      const id = slugify(player.name);
      // Validate rating (must be 0-10)
      const cleanS = { ...player.s };
      if (cleanS.r > 10) cleanS.r = parseFloat((cleanS.r / 10).toFixed(1));

      playerBatch.set(doc(db, 'players', id), {
        ...player,
        s: cleanS,
        firestoreId: id,
        photo: '', // PlayerCard fetches from SportsDB
      });
    });
    await playerBatch.commit();
    console.log(`✅ ${uniquePlayers.length} players seeded`);

    console.log('🎉 Seed complete! Now:');
    console.log('   1. Remove seedFirestore() from App.jsx');
    console.log('   2. Restore proper Firestore security rules');
  } catch (err) {
    if (err.code === 'permission-denied') {
      console.error('❌ Permission denied!');
      console.error('   Set Firestore rules to: allow read, write: if true');
    } else {
      console.error('❌ Seed error:', err.message);
    }
  }
}
