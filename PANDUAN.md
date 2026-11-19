# BITER Services Solution — Landing Page

Aplikasi website profil usaha, dibuat dengan HTML, CSS dan JavaScript tanpa dependensi. Desain responsif dengan warna biru BITER, ilustrasi laptop/HP, profil, layanan, alur konsultasi, ulasan, Maps, FAQ, form WhatsApp dan tombol chat mengambang.

## Mulai

Ekstrak ZIP. Buka `site/index.html` di browser untuk melihat website. Untuk server lokal, dari folder `site` jalankan `python3 -m http.server 8080`, lalu buka http://localhost:8080. Tidak perlu npm install atau build.

## Wajib isi sebelum publikasi

Nomor WhatsApp resmi diatur di site/config.js. Jadwal operasional Senin–Minggu ditampilkan di bagian Lokasi pada site/index.html. Alamat dan tautan sudah mengarah ke listing BITER di Cileungsi. Tema mengikuti perangkat pada kunjungan pertama dan menyimpan pilihan di browser.

## Carousel ulasan

Delapan ulasan pilihan langsung tampil dari daftar testimonials di site/config.js. Untuk memasang foto, simpan gambar di folder site, lalu isi photo pada nama pelanggan yang sesuai, misalnya './mega.jpg'. Kolom yang kosong menampilkan inisial pelanggan.

Carousel bergeser setiap sembilan detik selama terlihat. Pengunjung bisa menggunakan tombol panah, menggeser dengan sentuhan. Jika API key tersedia, ulasan tambahan Google Maps ditampilkan setelah ulasan pilihan. Nama yang sudah ada pada daftar pilihan dilewati.

## Ulasan Google Maps

1. Aktifkan Maps JavaScript API dan Places API (New) di Google Cloud dan hubungkan akun penagihan.
2. Buat API key browser. Batasi domain yang dapat memakainya melalui HTTP referrer serta batasi API ke dua layanan tersebut. Untuk server lokal izinkan http://localhost:8080/*.
3. Isi googleMapsApiKey di site/config.js. Peta dan tautan ulasan langsung tersedia ketika key kosong.

Saat API key terpasang, ulasan dimuat ketika halaman dibuka dan diperbarui setiap lima menit saat tab aktif. Foto profil diambil bersama ulasan ketika tersedia dari Google Maps. Google Places menampilkan hingga lima ulasan berdasarkan relevansi. Ulasan baru bisa muncul setelah tersedia di API dan masuk hasil tersebut. Permintaan otomatis dapat menambah biaya API.

Untuk menerima kejadian ulasan baru secara real-time, Google Business Profile Notifications API menggunakan Cloud Pub/Sub dan memerlukan akses pengelola profil bisnis, OAuth dan backend.

## Mengedit isi dan desain

`site/index.html` untuk kalimat profil, layanan dan FAQ. Sesuaikan layanan yang benar-benar tersedia sebelum publikasi. `site/styles.css` mengatur warna, jarak dan tampilan HP. `site/app.js` mengatur menu, ulasan, Maps, dan pesan WhatsApp. Ilustrasi perangkat dibuat dari CSS, tidak memerlukan gambar eksternal.

## Alur WhatsApp

Pengunjung mengisi nama, perangkat, model dan keluhan. Tombol membuka percakapan dengan pesan siap pakai; pengunjung tetap harus menekan kirim sendiri di WhatsApp. Form tidak menyimpan data di database. Jika nomor kosong/tidak valid, tampil pemberitahuan dan tidak membuka nomor lain. Tombol WhatsApp bergambar teknisi membuka percakapan langsung saat nomor resmi terisi. Bila nomor kosong, tombol mengarah ke formulir konsultasi.

## Deploy sendiri

### Vercel

Folder proyek adalah `biter-profile`, tempat `vercel.json` berada. Vercel menyajikan isi `site` langsung di alamat utama. HTML, CSS, JavaScript, foto, dan kursor sudah siap digunakan tanpa proses build.

**Lewat dashboard:** impor repositori lewat **Add New → Project**. Jika repositori berisi folder `biter-profile`, pilih folder itu sebagai **Root Directory**. Jika `vercel.json` sudah berada di tingkat teratas repositori, gunakan `.`. Pilih preset **Other** dan gunakan pengaturan build dari `vercel.json`.

**Lewat CLI dari folder lokal:** jika Node.js LTS dan npm tersedia, buka terminal di folder yang berisi `vercel.json`. Jalankan perintah berikut untuk masuk dan membuat deployment preview:

```powershell
npx vercel login
npx vercel
```

Pilih akun atau tim tujuan dan gunakan `.` sebagai direktori kode ketika diminta. Di URL preview, periksa carousel beserta fotonya, peta, dan tujuan tombol WhatsApp. Untuk menerbitkan versi produksi dari folder yang sama, jalankan `npx vercel --prod`.

Domain khusus bisa dihubungkan melalui **Settings → Domains** setelah deploy. Jika memakai ulasan tambahan Google Places, daftarkan domain produksi pada pembatasan HTTP referrer API key. Delapan ulasan lokal dan peta sudah bisa digunakan tanpa key.

### Pilihan hosting lainnya

**Hosting biasa/cPanel:** unggah seluruh ISI folder `site` ke `public_html` atau folder domain tujuan. Pastikan index.html berada langsung di root domain. Aktifkan HTTPS di penyedia hosting.

**Firebase Hosting:** konfigurasi `firebase.json` sudah tersedia. Instal Firebase CLI mengikuti dokumentasi resmi https://firebase.google.com/docs/cli lalu dari folder yang berisi firebase.json jalankan:

```
firebase login
firebase use --add
firebase deploy --only hosting
```

Pilih project khusus landing page. Jika memakai project aplikasi manajemen, gunakan hosting site/target terpisah agar tidak menimpa aplikasi manajemen. Paket ini berdiri sendiri dan tidak tersambung ke database servis. Tidak perlu Firebase Authentication atau Firestore untuk landing page ini.

## Pemeriksaan sebelum publikasi

Buka di HP dan desktop, coba navigasi, FAQ, form kosong, lalu pesan WhatsApp dengan nomor resmi. Pastikan nomor tujuan benar sebelum mengirim. Periksa alamat, pin Maps, jadwal dan ulasan. Maps dan WhatsApp memerlukan internet dan mengikuti ketersediaan layanan masing-masing.
