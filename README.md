# Kawakami Global Energy

Website perusahaan biomassa berbahasa Indonesia. Dibuat dari rancangan dan logo yang diberikan pemilik.

## Halaman
Beranda, katalog enam produk, enam halaman detail, Tentang Kami, Kontak, FAQ, kebijakan privasi, ketentuan penggunaan, dan kredit visual. Ringkasan perusahaan serta produk dapat diunduh dalam format teks.

## Cara formulir bekerja
Dua jalur: pembeli dan pemasok. Formulir menyusun ringkasan lokal yang ditinjau pengguna. Pengguna kemudian membuka WhatsApp atau email dan mengirim sendiri. Tidak ada penyimpanan data calon pelanggan atau pengiriman otomatis. Kontak diambil dari desain acuan, bukan hasil verifikasi kepemilikan.

## Informasi yang perlu pemilik konfirmasi sebelum publikasi umum
- Ketersediaan enam material, kapasitas pasokan, minimum pesanan, lokasi sumber dan wilayah pengiriman.
- Hasil uji, spesifikasi tiap produk, COA, dokumen asal bahan, dan proses sampel.
- Alur evaluasi, ketentuan pembayaran, pengiriman, dan penanganan ketidaksesuaian.
- Visi/misi dan isi kebijakan yang perlu disesuaikan dengan praktik perusahaan.
- Foto milik perusahaan serta izin testimoni, logo pelanggan, dan bukti pengalaman jika akan ditambahkan.

Angka kapasitas, peringkat #1, rating, jumlah mitra, lama pengalaman, sertifikasi, dan klaim pengurangan emisi belum ditampilkan karena tidak ada data pendukung. Peta merupakan orientasi geografis; tidak menunjukkan fasilitas atau jaringan terverifikasi. Visual hero merupakan ilustrasi AI. Foto bahan dari pihak ketiga disertai atribusi pada /kredit.

## Pengembangan
npm install
npm run dev
npm run build

## Pemeriksaan
TypeScript dan build produksi. Pemeriksaan browser pada navigasi, menu ponsel, formulir pemasok, ringkasan pesan, dan pilihan produk. WebMCP stage_biomass_inquiry diverifikasi pada input valid dan invalid; tool hanya mengisi draf tanpa mengirimkan data. Akses penerbitan belum diberikan ketika kredensial repositori diminta.


## Bahasa Indonesia dan English

- Halaman Indonesia tetap menggunakan alamat asli; English tersedia di `/en`, `/en/products`, `/en/about`, dan `/en/contact`.
- Sakelar geser ID / EN mempertahankan halaman, parameter produk/jalur, dan anchor. Draf formulir bertahan dalam memori selama berpindah bahasa; tidak disimpan setelah reload atau penutupan tab.
- Salinan halaman ada di `components/pages`, dengan teks Inggris di `lib/locales/en.json` dan katalog Inggris di `lib/locales/catalog-en.json`.
- `middleware.ts` menetapkan bahasa dokumen dan header Content-Language dari alamat halaman. `lib/i18n.ts` mengelola pemetaan alamat dan metadata kedua bahasa.
- Jalankan `npm test` untuk memeriksa terjemahan, tautan dua arah, katalog, dan pesan pembeli/pemasok. Jalankan `npm run build` sebelum distribusi.
