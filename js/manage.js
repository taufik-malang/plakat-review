// ============================================================
// js/manage.js
// Logika halaman kelola kartu (manage.html)
// ============================================================

import { supabase } from './supabaseClient.js';

// ============================================================
// ELEMEN UI
// ============================================================
const alertBox    = document.getElementById('alert');
const verifyForm  = document.getElementById('verifyForm');
const verifyBtn   = document.getElementById('verifyBtn');
const editForm    = document.getElementById('editForm');
const saveBtn     = document.getElementById('saveBtn');

// ============================================================
// STATE
// ============================================================
let verifiedCode = null; // Menyimpan card_code yang sudah terverifikasi PIN-nya

// ============================================================
// HELPERS
// ============================================================
function showAlert(type, msg) {
  alertBox.className = `mb-5 p-3 rounded-lg text-sm ${
    type === 'error'
      ? 'bg-red-50 text-red-700 border border-red-200'
      : 'bg-green-50 text-green-700 border border-green-200'
  }`;
  alertBox.textContent = msg;
  alertBox.classList.remove('hidden');
}

function hideAlert() {
  alertBox.classList.add('hidden');
}

function setVerifyLoading(isLoading) {
  verifyBtn.disabled = isLoading;
  verifyBtn.textContent = isLoading ? 'Memverifikasi...' : 'Verifikasi PIN';
}

function setSaveLoading(isLoading) {
  saveBtn.disabled = isLoading;
  saveBtn.textContent = isLoading ? 'Menyimpan...' : 'Simpan Perubahan';
}

// ============================================================
// STEP 1: VERIFIKASI PIN
// ============================================================
verifyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const code = document.getElementById('cardCode').value.trim().toUpperCase();
  const pin  = document.getElementById('pin').value.trim();

  // Validasi client-side
  if (!code) {
    return showAlert('error', 'Kode kartu tidak boleh kosong.');
  }
  if (!/^\d{4}$/.test(pin)) {
    return showAlert('error', 'PIN harus 4 digit angka.');
  }

  setVerifyLoading(true);

  try {
    const { data, error } = await supabase.rpc('verify_card_pin', {
      p_code: code,
      p_pin: pin
    });

    if (error) {
      console.error('[manage.js] RPC error:', error);
      showAlert('error', 'Gagal verifikasi: ' + error.message);
      setVerifyLoading(false);
      return;
    }

    // Cek apakah data ditemukan
    if (!data || data.length === 0) {
      showAlert('error', 'Kode kartu atau PIN salah. Silakan coba lagi.');
      setVerifyLoading(false);
      return;
    }

    // Sukses → tampilkan form edit
    const card = data[0];
    verifiedCode = card.card_code;

    document.getElementById('businessName').value = card.business_name || '';
    document.getElementById('reviewUrl').value    = card.google_review_url || '';

    editForm.classList.remove('hidden');
    verifyForm.classList.add('hidden');
    hideAlert();

    console.log('[manage.js] Card verified:', card);

    // Scroll ke form edit
    editForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    console.error('[manage.js] Unexpected error:', err);
    showAlert('error', 'Terjadi kesalahan: ' + (err.message || err));
    setVerifyLoading(false);
  }
});

// ============================================================
// STEP 2: SIMPAN PERUBAHAN
// ============================================================
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  if (!verifiedCode) {
    return showAlert('error', 'Sesi verifikasi hilang. Silakan muat ulang halaman.');
  }

  const business_name     = document.getElementById('businessName').value.trim();
  const google_review_url = document.getElementById('reviewUrl').value.trim();
  const pin               = document.getElementById('pin').value.trim();

  // Validasi client-side
  if (!business_name) {
    return showAlert('error', 'Nama bisnis tidak boleh kosong.');
  }
  if (!/^https?:\/\//.test(google_review_url)) {
    return showAlert('error', 'Link Google Review harus diawali dengan http:// atau https://');
  }

  setSaveLoading(true);

  try {
    const { error } = await supabase.rpc('update_card_with_pin', {
      p_code: verifiedCode,
      p_pin: pin,
      p_business_name: business_name,
      p_review_url: google_review_url
    });

    if (error) {
      console.error('[manage.js] RPC error:', error);
      showAlert('error', 'Gagal menyimpan: ' + error.message);
      setSaveLoading(false);
      return;
    }

    console.log('[manage.js] Card updated successfully:', verifiedCode);
    showAlert('success', '✅ Data berhasil diperbarui!');

    // Update state verifiedCode (tidak berubah, tapi untuk konsistensi)
    setSaveLoading(false);

  } catch (err) {
    console.error('[manage.js] Unexpected error:', err);
    showAlert('error', 'Terjadi kesalahan: ' + (err.message || err));
    setSaveLoading(false);
  }
});