# ohmystats (PWA + Python)

Aplikasi berbasis web yang dirancang khusus untuk melakukan 5 jenis analisis regresi statistik dengan antarmuka ramah perangkat seluler (mobile-first) dan menghasilkan output tabel yang akurat dan siap cetak untuk kebutuhan akademis.

## Fitur Utama
1. **5 Pilihan Regresi:** Linear Sederhana, Linear Berganda, Logistik, Non-Linear, & Data Panel.
2. **Uji Asumsi Otomatis:** VIF, Heteroskedastisitas, Normalitas, dan Uji Hausman terintegrasi langsung.
3. **PWA Enabled:** Dapat di-install langsung di layar HP Android/iOS tanpa melalui Play Store atau App Store.
4. **Ekspor Laporan:** Unduh luaran hasil analisis dalam format tabel standar publikasi ilmiah.

## Persyaratan Sistem
- Python 3.10 atau versi terbaru
- Node.js v18 atau versi terbaru

## Cara Memulai Pengembangan

### 1. Pengaturan Backend (Python FastAPI)
Masuk ke direktori backend, buat virtual environment, instal seluruh pustaka, dan jalankan server lokal:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Untuk Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
### 2. Pengaturan Frontend (React PWA)

Buka tab terminal baru, masuk ke direktori frontend, instal paket dependensi node, dan jalankan server lokal:

```bash
cd frontend
npm install
npm run dev -- --host

```

Akses aplikasi melalui browser handphone Anda yang terhubung dalam jaringan Wi-Fi yang sama menggunakan alamat IP lokal yang tertera pada terminal.
