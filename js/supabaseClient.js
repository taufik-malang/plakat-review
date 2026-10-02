// ============================================================
// js/supabaseClient.js
// Konfigurasi koneksi frontend ke Supabase
// Menggunakan ES Module via CDN (tanpa build step)
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ------------------------------------------------------------
// KONFIGURASI PROJECT — GANTI DENGAN MILIK KAMU
// ------------------------------------------------------------
// Ambil dari: Supabase Dashboard → Project Settings → API
//   - Project URL  : yang berakhiran .supabase.co
//   - anon public  : string panjang mulai dari "eyJ..."
//
// ⚠️ JANGAN pakai "service_role" key. Itu untuk server saja.
// ------------------------------------------------------------

const SUPABASE_URL = 'https://mvuvtdrmlmflrungppoa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12dXZ0ZHJtbG1mbHJ1bmdwcG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NjgxODUsImV4cCI6MjEwNjM0NDE4NX0.gk2R7p5UTTAvkKEDbby2fW7FRZ6T8hW2SaZF6IMXAPM';

// ------------------------------------------------------------
// Inisialisasi client
// ------------------------------------------------------------
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// ------------------------------------------------------------
// Debug — cek koneksi saat file ini di-load (boleh dihapus nanti)
// ------------------------------------------------------------
console.log('[SupabaseClient] Initialized with URL:', SUPABASE_URL);