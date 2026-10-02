// ============================================================
// js/activate.js
// Logika halaman aktivasi kartu (activate.html)
// ============================================================

import { supabase } from './supabaseClient.js';

const DELAY_BEFORE_REDIRECT = 1500;

const params = new URLSearchParams(window.location.search);
const code = params.get('code');

const codeLabel = document.getElementById('cardCodeLabel');
const form      = document.getElementById('activationForm');
const submitBtn = document.getElementById('submitBtn');
const alertBox  = document.getElementById('alert');

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

function setSubmitLoading(isLoading, text = 'Aktifkan Kartu') {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Memproses...' : text;
}

async function verifyCard() {
  if (!code || code.trim() === '') {
    showAlert('error', 'Kode kartu tidak ditemukan pada URL. Pastikan Anda membuka halaman ini dari kartu resmi.');
    submitBtn.disabled = true;
    return;
  }

  codeLabel.textContent = code;

  try {
    const { data, error } = await supabase
      .from('cards')
      .select('card_code, is_active')
      .eq('card_code', code.trim())
      .maybeSingle();

    if (error) {
      console.error('[activate.js] Supabase error:', error);
      showAlert('error', `Gagal memuat data kartu: ${error.message}`);
      submitBtn.disabled = true;
      return;
    }

    if (!data) {
      showAlert('error', `Kartu dengan kode "${code}" tidak ditemukan di sistem kami.`);
      submitBtn.disabled = true;
      return;
    }

    if (data.is_active) {
      showAlert('error', 'Kartu ini sudah pernah diaktivasi. Jika ingin mengubah data, gunakan halaman Kelola Kartu.');
      submitBtn.disabled = true;
      return;
    }

    console.log('[activate.js] Card verified, ready for activation:', data);

  } catch (err) {
    console.error('[activate.js] Unexpected error:', err);
    showAlert('error', 'Terjadi kesalahan tidak terduga: ' + (err.message || err));
    submitBtn.disabled = true;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const business_name     = document.getElementById('businessName').value.trim();
  const google_review_url = document.getElementById('reviewUrl').value.trim();
  const pin               = document.getElementById('pin').value.trim();

  if (!business_name) {
    return showAlert('error', 'Nama bisnis tidak boleh kosong.');
  }
  if (!/^https?:\/\//.test(google_review_url)) {
    return showAlert('error', 'Link Google Review harus diawali dengan http:// atau https://');
  }
  if (!/^\d{4}$/.test(pin)) {
    return showAlert('error', 'PIN harus 4 digit angka.');
  }

  setSubmitLoading(true);

  try {
    const { error } = await supabase.rpc('activate_card', {
      p_code: code.trim(),
      p_business_name: business_name,
      p_review_url: google_review_url,
      p_pin: pin
    });

    if (error) {
      console.error('[activate.js] RPC error:', error);
      showAlert('error', 'Gagal aktivasi: ' + error.message);
      setSubmitLoading(false);
      return;
    }

    console.log('[activate.js] Card activated successfully:', code);
    showAlert('success', '✅ Kartu berhasil diaktivasi! Mengalihkan ke halaman Google Review...');
    form.reset();

    setTimeout(() => {
      window.location.replace(google_review_url);
    }, DELAY_BEFORE_REDIRECT);

  } catch (err) {
    console.error('[activate.js] Unexpected error:', err);
    showAlert('error', 'Terjadi kesalahan: ' + (err.message || err));
    setSubmitLoading(false);
  }
});

verifyCard();