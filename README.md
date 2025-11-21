# HealthyMe - Smart Health Tracker & Reminder Dashboard

Dashboard kesehatan pintar dengan AI assistant untuk melacak aktivitas harian Anda.

## 🎯 Fitur

- ✅ **Autentikasi** - Login/Register dengan Lovable Cloud
- ✅ **Dashboard Kesehatan** - Grafik interaktif dan summary harian
- ✅ **Form Input Harian** - Air minum, tidur, langkah, mood, obat
- ✅ **Gemini Flash Chatbot** - AI assistant dengan command parsing
- ✅ **Real-time Updates** - Data tersinkronisasi otomatis
- ✅ **Database Lengkap** - 8 tabel dengan RLS policies

## 🚀 Cara Menjalankan

1. Klik tombol di preview untuk membuat akun
2. Login dengan akun yang sudah dibuat
3. Masukkan data kesehatan harian Anda
4. Chat dengan AI untuk saran atau gunakan perintah:
   - "tambah 250ml air"
   - "tambah 5000 langkah"
   - "catat tidur 7 jam"

## 🛠️ Teknologi

- React + Vite + TypeScript
- TailwindCSS dengan design system custom
- Lovable Cloud (Supabase) - Database, Auth, Realtime
- Gemini Flash via Lovable AI Gateway
- Recharts untuk visualisasi data

## 📊 Database Schema

- `profiles` - Profil pengguna
- `water_intake` - Log konsumsi air
- `sleep_logs` - Log tidur
- `step_logs` - Log langkah kaki
- `medicine_logs` - Log obat
- `health_logs` - Log mood
- `reminders` - Pengingat
- `chat_messages` - Riwayat chat

## 🤖 Command Parser

Bot AI mendukung perintah natural language:
- Tambah air: "tambah 500ml air"
- Tambah langkah: "tambah 8000 langkah"
- Catat tidur: "catat tidur 8 jam"

Semua data otomatis tersimpan ke database!
