# PodSync & Digital Signage - User Acceptance Testing (UAT)
## Metode Blackbox Testing

### Informasi Pengujian
**Project:** PodSync Web App & Unity Digital Signage Laboratorium Podcast  
**Metode Testing:** Blackbox Testing  
**Target User:** Staff Laboran Unit Laboratorium Fakultas Ilmu Terapan Universitas Telkom  
**Tanggal Pengujian:** _______________  
**Penguji:** Muhammad Harun Arrasyid D. (Penanggung Jawab Laboratorium Podcast FIT)  
**Lokasi:** Laboratorium Podcast Fakultas Ilmu Terapan Universitas Telkom

---

## Petunjuk Pengujian

**Metode Blackbox Testing:**
- Pengujian dilakukan tanpa pengetahuan tentang struktur internal sistem
- Fokus pada input dan output sistem
- Validasi apakah sistem memenuhi kebutuhan fungsional
- Pengujian berdasarkan spesifikasi dan kebutuhan pengguna

**Skala Penilaian:**
- **✓ Pass** = Fitur berfungsi sesuai ekspektasi
- **✗ Fail** = Fitur tidak berfungsi atau ada error
- **~ Partial** = Fitur berfungsi dengan batasan tertentu

---

## TABEL PENGUJIAN APLIKASI PODSYNC

| No | ID Pengujian | Fitur yang Diuji | Skenario Pengujian | Hasil Pengujian/Checklist | Keterangan |
|----|--------------|-------------------|-------------------|---------------------------|------------|
| 1 | UAT-001 | Login Dashboard | Akses dashboard PodSync menggunakan kredensial penanggung jawab lab | ☐ Pass ☐ Fail ☐ Partial | |
| 2 | UAT-002 | Tampilan Status Broadcast | Melihat status ON AIR/OFF AIR pada dashboard utama | ☐ Pass ☐ Fail ☐ Partial | |
| 3 | UAT-003 | Toggle Broadcast Manual | Mengubah status broadcast dari OFF AIR ke ON AIR secara manual | ☐ Pass ☐ Fail ☐ Partial | |
| 4 | UAT-004 | Toggle Broadcast Manual | Mengubah status broadcast dari ON AIR ke OFF AIR secara manual | ☐ Pass ☐ Fail ☐ Partial | |
| 5 | UAT-005 | Sinkronisasi Google Sheets | Melihat timestamp sinkronisasi terakhir dengan Google Sheets | ☐ Pass ☐ Fail ☐ Partial | |
| 6 | UAT-006 | Daftar Schedule Booking | Melihat daftar jadwal booking lab hari ini di halaman Schedule | ☐ Pass ☐ Fail ☐ Partial | |
| 7 | UAT-007 | Filter Schedule by Date | Memfilter jadwal berdasarkan range tanggal (1 minggu) | ☐ Pass ☐ Fail ☐ Partial | |
| 8 | UAT-008 | Filter Schedule by Unit | Memfilter jadwal berdasarkan unit/prodi tertentu | ☐ Pass ☐ Fail ☐ Partial | |
| 9 | UAT-009 | Detail Booking Information | Melihat detail lengkap booking dengan mengklik item jadwal | ☐ Pass ☐ Fail ☐ Partial | |
| 10 | UAT-010 | Manual Sync Google Sheets | Melakukan sinkronisasi manual dengan Google Sheets | ☐ Pass ☐ Fail ☐ Partial | |
| 11 | UAT-011 | Daftar Signage Content | Melihat daftar konten digital signage yang aktif | ☐ Pass ☐ Fail ☐ Partial | |
| 12 | UAT-012 | Buat Konten Pengumuman | Membuat konten pengumuman baru untuk digital signage | ☐ Pass ☐ Fail ☐ Partial | |
| 13 | UAT-013 | Upload Media Content | Upload file media (gambar/video) untuk konten signage | ☐ Pass ☐ Fail ☐ Partial | |
| 14 | UAT-014 | QR Code Generation | Verifikasi QR code otomatis dibuat saat upload media | ☐ Pass ☐ Fail ☐ Partial | |
| 15 | UAT-015 | Pengaturan Display Order | Mengatur urutan tampilan konten signage | ☐ Pass ☐ Fail ☐ Partial | |
| 16 | UAT-016 | Aktivasi/Deaktivasi Konten | Mengaktifkan dan menonaktifkan konten signage | ☐ Pass ☐ Fail ☐ Partial | |
| 17 | UAT-017 | Edit Konten Existing | Mengedit konten signage yang sudah ada | ☐ Pass ☐ Fail ☐ Partial | |
| 18 | UAT-018 | Hapus Konten | Menghapus konten signage dari sistem | ☐ Pass ☐ Fail ☐ Partial | |
| 19 | UAT-019 | Analytics Usage | Melihat statistik penggunaan lab pada halaman Analytics | ☐ Pass ☐ Fail ☐ Partial | |
| 20 | UAT-020 | Export Analytics Report | Export laporan analytics dalam format Excel/PDF | ☐ Pass ☐ Fail ☐ Partial | |
| 21 | UAT-021 | Unity Status Display | Verifikasi status ON AIR/OFF AIR tampil di Unity Digital Signage | ☐ Pass ☐ Fail ☐ Partial | |
| 22 | UAT-022 | Unity Time Display | Verifikasi waktu real-time (HH:MM) tampil di Unity | ☐ Pass ☐ Fail ☐ Partial | |
| 23 | UAT-023 | Unity Date Display | Verifikasi tanggal format Indonesia tampil di Unity | ☐ Pass ☐ Fail ☐ Partial | |
| 24 | UAT-024 | Unity Current Booking | Verifikasi informasi booking aktif tampil di Unity | ☐ Pass ☐ Fail ☐ Partial | |
| 25 | UAT-025 | Unity Upcoming Schedule | Verifikasi daftar jadwal mendatang tampil di Unity | ☐ Pass ☐ Fail ☐ Partial | |
| 26 | UAT-026 | Unity Content Display | Verifikasi konten signage tampil di Unity sesuai urutan | ☐ Pass ☐ Fail ☐ Partial | |
| 27 | UAT-027 | Real-time Sync | Verifikasi perubahan status di web sync ke Unity dalam 30 detik | ☐ Pass ☐ Fail ☐ Partial | |
| 28 | UAT-028 | Auto Broadcast ON | Verifikasi sistem otomatis ON AIR saat jam booking dimulai | ☐ Pass ☐ Fail ☐ Partial | |
| 29 | UAT-029 | Auto Broadcast OFF | Verifikasi sistem otomatis OFF AIR saat jam booking berakhir | ☐ Pass ☐ Fail ☐ Partial | |
| 30 | UAT-030 | Error Handling | Verifikasi sistem menangani error dengan baik (koneksi terputus) | ☐ Pass ☐ Fail ☐ Partial | |

---

## EVALUASI KHUSUS UNTUK PENANGGUNG JAWAB LABORATORIUM

### A. Kemudahan Operasional Harian
| Aspek | Rating (1-5) | Keterangan |
|-------|--------------|------------|
| Kemudahan monitoring status lab | __ | |
| Efisiensi kontrol broadcast | __ | |
| Manajemen jadwal booking | __ | |
| Update informasi digital signage | __ | |
| Generating laporan | __ | |

### B. Integrasi dengan Workflow Existing
| Proses | Sebelum PodSync | Dengan PodSync | Improvement |
|--------|-----------------|----------------|-------------|
| Cek availability lab | _____________ | _____________ | __ |
| Control broadcast | _____________ | _____________ | __ |
| Update announcements | _____________ | _____________ | __ |
| Generate reports | _____________ | _____________ | __ |

### C. Training & Support Requirements
| Item | Assessment | Keterangan |
|------|------------|------------|
| Waktu training yang dibutuhkan | __ jam | |
| Tingkat kesulitan penggunaan (1-5) | __ | |
| Frekuensi bantuan teknis dibutuhkan | __ kali/minggu | |
| Dokumentasi tambahan yang diperlukan | __ | |

---

## RINGKASAN HASIL PENGUJIAN

### Summary Test Results
| Kategori | Total Pass | Total Fail | Total Partial | Success Rate |
|----------|------------|------------|---------------|--------------|
| Dashboard & Web Functions (UAT-001 to UAT-020) | __ | __ | __ | __% |
| Unity Digital Signage (UAT-021 to UAT-026) | __ | __ | __ | __% |
| Integration & Automation (UAT-027 to UAT-030) | __ | __ | __ | __% |
| **TOTAL (30 Tests)** | __ | __ | __ | **__%** |

### Critical Issues Found
#### High Priority (Must Fix Before Production)
1. _________________________________
2. _________________________________
3. _________________________________

#### Medium Priority (Should Fix)
1. _________________________________
2. _________________________________

#### Low Priority (Nice to Have)
1. _________________________________

### Recommendation from Penanggung Jawab Laboratorium

#### Kesiapan Sistem
- **Ready for Production Use**: ☐ Yes ☐ No ☐ With Conditions
- **Overall System Rating (1-10)**: ____
- **Recommendation**: _________________________________

#### Training & Support Needs
- **Training Duration Required**: ____ jam
- **Additional Documentation Needed**: _________________________________
- **Ongoing Support Level**: ____ jam/minggu

#### Most Valuable Features
1. _________________________________
2. _________________________________
3. _________________________________

#### Improvement Suggestions
1. _________________________________
2. _________________________________
3. _________________________________

---

**Final Approval:**

**Muhammad Harun Arrasyid D.**  
**Penanggung Jawab Laboratorium Podcast**  
**Fakultas Ilmu Terapan Universitas Telkom**

Signature: _______________  
Date: _______________

**Overall Assessment:** _________________________________

**Go-Live Recommendation:** ☐ Approved ☐ Approved with Conditions ☐ Needs Revision

**Conditions (if any):** _________________________________