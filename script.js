// ======================================
// PENGATURAN PENYIMPANAN NGEBUKU
// ======================================

const KUNCI_LOGIN = "statusLoginNgebuku";
const KUNCI_KATALOG = "katalogNgebuku";
const KUNCI_TRANSAKSI = "riwayatNgebuku";

function ambilKatalog() {
    const tersimpan = localStorage.getItem(KUNCI_KATALOG);

    if (tersimpan) {
        try {
            return JSON.parse(tersimpan);
        } catch (error) {
            console.error("Data katalog rusak:", error);
        }
    }

    return Array.isArray(window.dataKatalogBuku)
        ? window.dataKatalogBuku
        : [];
}

function simpanKatalog(data) {
    localStorage.setItem(KUNCI_KATALOG, JSON.stringify(data));
}

function ambilTransaksi() {
    try {
        return JSON.parse(localStorage.getItem(KUNCI_TRANSAKSI)) || [];
    } catch (error) {
        return [];
    }
}

function simpanTransaksi(data) {
    localStorage.setItem(KUNCI_TRANSAKSI, JSON.stringify(data));
}

function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(angka) || 0);
}

function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ======================================
// PEMERIKSAAN LOGIN
// ======================================

function cekLogin() {
    const sudahLogin = sessionStorage.getItem(KUNCI_LOGIN);

    if (!sudahLogin && !window.location.pathname.endsWith("index.html")) {
        window.location.href = "index.html";
    }
}

function logout() {
    sessionStorage.removeItem(KUNCI_LOGIN);
    window.location.href = "index.html";
}

// ======================================
// HALAMAN LOGIN
// ======================================

function jalankanLogin() {
    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (email === "admin@ngebuku.com" && password === "12345") {
            sessionStorage.setItem(KUNCI_LOGIN, "berhasil");

            alert("Login berhasil! Selamat datang di Ngebuku.");
            window.location.href = "dashboard.html";
        } else {
            alert("email/password yang anda masukkan salah");
        }
    });

    const tombolLupa = document.getElementById("tombolLupa");
    const tombolDaftar = document.getElementById("tombolDaftar");
    const modalLupa = document.getElementById("modalLupa");
    const modalDaftar = document.getElementById("modalDaftar");

    if (tombolLupa && modalLupa) {
        tombolLupa.addEventListener("click", function () {
            modalLupa.classList.add("aktif");
        });
    }

    if (tombolDaftar && modalDaftar) {
        tombolDaftar.addEventListener("click", function () {
            modalDaftar.classList.add("aktif");
        });
    }

    document.querySelectorAll(".tutup-modal").forEach(function (tombol) {
        tombol.addEventListener("click", function () {
            document.querySelectorAll(".modal").forEach(function (modal) {
                modal.classList.remove("aktif");
            });
        });
    });
}

// ======================================
// DASHBOARD
// ======================================

function jalankanDashboard() {
    const sapaan = document.getElementById("sapaan");
    const sekarang = new Date();
    const jam = sekarang.getHours();

    if (sapaan) {
        let ucapan = "Selamat malam";

        if (jam >= 4 && jam < 11) {
            ucapan = "Selamat pagi";
        } else if (jam >= 11 && jam < 15) {
            ucapan = "Selamat siang";
        } else if (jam >= 15 && jam < 18) {
            ucapan = "Selamat sore";
        }

        sapaan.textContent = ucapan;
    }

    const katalog = ambilKatalog();
    const transaksi = ambilTransaksi();

    const jumlahBuku = document.getElementById("jumlahBuku");
    const jumlahStok = document.getElementById("jumlahStok");
    const jumlahPesanan = document.getElementById("jumlahPesanan");
    const totalPendapatan = document.getElementById("totalPendapatan");

    if (jumlahBuku) {
        jumlahBuku.textContent = katalog.length;
    }

    if (jumlahStok) {
        jumlahStok.textContent = katalog.reduce(
            (total, buku) => total + Number(buku.stok || 0), 0
        );
    }

    if (jumlahPesanan) {
        jumlahPesanan.textContent = transaksi.length;
    }

    if (totalPendapatan) {
        const pendapatan = transaksi.reduce(
            (total, pesanan) => total + Number(pesanan.total || 0), 0
        );

        totalPendapatan.textContent = formatRupiah(pendapatan);
    }

    tampilkanLaporan();
    tampilkanRiwayat();
}

function tampilkanLaporan() {
    const tabel = document.getElementById("tabelLaporan");

    if (!tabel) return;

    const transaksi = ambilTransaksi();

    if (transaksi.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="5" class="kosong">Belum ada pemesanan.</td>
            </tr>
        `;
        return;
    }

    tabel.innerHTML = transaksi.map(function (item) {
        return `
            <tr>
                <td>${item.nomorDO}</td>
                <td>${item.nama}</td>
                <td>${formatTanggal(item.tanggalPesan)}</td>
                <td>${formatRupiah(item.total)}</td>
                <td>${item.statusPengiriman}</td>
            </tr>
        `;
    }).join("");
}

function tampilkanRiwayat() {
    const tabel = document.getElementById("tabelRiwayat");

    if (!tabel) return;

    const transaksi = ambilTransaksi();

    if (transaksi.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="5" class="kosong">Belum ada riwayat transaksi.</td>
            </tr>
        `;
        return;
    }

    tabel.innerHTML = transaksi.slice().reverse().map(function (item) {
        return `
            <tr>
                <td>${item.nomorDO}</td>
                <td>${item.nama}</td>
                <td>${item.pembayaran}</td>
                <td>${formatRupiah(item.total)}</td>
                <td>${formatTanggal(item.tanggalPesan)}</td>
            </tr>
        `;
    }).join("");
}

// ======================================
// HALAMAN STOK
// ======================================

function jalankanStok() {
    const tabel = document.getElementById("tabelStok");
    const form = document.getElementById("formTambahBuku");

    if (!tabel) return;

    tampilkanStok();

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const judul = document.getElementById("judulBuku").value.trim();
            const penulis = document.getElementById("penulisBuku").value.trim();
            const kategori = document.getElementById("kategoriBuku").value.trim();
            const harga = Number(document.getElementById("hargaBuku").value);
            const stok = Number(document.getElementById("stokBuku").value);

            if (!judul || !penulis || !kategori || harga <= 0 || stok < 0) {
                alert("Mohon isi data buku dengan benar.");
                return;
            }

            const katalog = ambilKatalog();

            katalog.push({
                id: Date.now(),
                judul: judul,
                penulis: penulis,
                kategori: kategori,
                harga: harga,
                stok: stok,
                gambar: ""
            });

            simpanKatalog(katalog);
            form.reset();

            tampilkanStok();
            alert("Buku berhasil ditambahkan.");
        });
    }
}

function tampilkanStok() {
    const tabel = document.getElementById("tabelStok");

    if (!tabel) return;

    const katalog = ambilKatalog();

    if (katalog.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="7" class="kosong">Data buku belum tersedia.</td>
            </tr>
        `;
        return;
    }

    tabel.innerHTML = katalog.map(function (buku) {
        return `
            <tr>
                <td>
                    ${
                        buku.gambar
                        ? `<img src="${buku.gambar}" class="gambar-tabel" alt="${buku.judul}">`
                        : `<span class="tanpa-gambar">Tidak ada foto</span>`
                    }
                </td>
                <td>${buku.judul}</td>
                <td>${buku.penulis}</td>
                <td>${buku.kategori}</td>
                <td>${formatRupiah(buku.harga)}</td>
                <td>${buku.stok}</td>
                <td>
                    <button class="tombol-hapus"
                        onclick="hapusBuku(${buku.id})">
                        Hapus
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function hapusBuku(id) {
    if (!confirm("Yakin ingin menghapus buku ini?")) return;

    const katalog = ambilKatalog().filter(function (buku) {
        return buku.id !== id;
    });

    simpanKatalog(katalog);
    tampilkanStok();
}

// ======================================
// HALAMAN CHECKOUT
// ======================================

let daftarPesanan = [];

function jalankanCheckout() {
    const pilihan = document.getElementById("pilihBuku");
    const tombolTambah = document.getElementById("tambahPesanan");
    const form = document.getElementById("formCheckout");

    if (!pilihan || !tombolTambah || !form) return;

    isiPilihanBuku();
    tampilkanKeranjang();

    tombolTambah.addEventListener("click", tambahPesanan);

    form.addEventListener("submit", prosesCheckout);
}

function isiPilihanBuku() {
    const pilihan = document.getElementById("pilihBuku");
    const katalog = ambilKatalog();

    if (!pilihan) return;

    const tersedia = katalog.filter(function (buku) {
        return Number(buku.stok) > 0;
    });

    if (tersedia.length === 0) {
        pilihan.innerHTML = `<option value="">Tidak ada buku tersedia</option>`;
        return;
    }

    pilihan.innerHTML = `
        <option value="">-- Pilih Buku --</option>
        ${tersedia.map(function (buku) {
            return `
                <option value="${buku.id}">
                    ${buku.judul} - ${formatRupiah(buku.harga)}
                    (Stok: ${buku.stok})
                </option>
            `;
        }).join("")}
    `;
}

function tambahPesanan() {
    const id = Number(document.getElementById("pilihBuku").value);
    const jumlah = Number(document.getElementById("jumlahBukuPesanan").value);

    if (!id || jumlah < 1) {
        alert("Pilih buku dan masukkan jumlah yang benar.");
        return;
    }

    const katalog = ambilKatalog();
    const buku = katalog.find(function (item) {
        return item.id === id;
    });

    if (!buku) {
        alert("Buku tidak ditemukan.");
        return;
    }

    const sudahAda = daftarPesanan.find(function (item) {
        return item.id === id;
    });

    const jumlahSebelumnya = sudahAda ? sudahAda.jumlah : 0;

    if (jumlahSebelumnya + jumlah > Number(buku.stok)) {
        alert("Jumlah pesanan melebihi stok yang tersedia.");
        return;
    }

    if (sudahAda) {
        sudahAda.jumlah += jumlah;
        sudahAda.subtotal = sudahAda.harga * sudahAda.jumlah;
    } else {
        daftarPesanan.push({
            id: buku.id,
            judul: buku.judul,
            harga: Number(buku.harga),
            jumlah: jumlah,
            subtotal: Number(buku.harga) * jumlah
        });
    }

    document.getElementById("jumlahBukuPesanan").value = 1;

    tampilkanKeranjang();
}

function tampilkanKeranjang() {
    const tabel = document.getElementById("tabelKeranjang");
    const totalTeks = document.getElementById("totalBelanja");

    if (!tabel || !totalTeks) return;

    if (daftarPesanan.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="5" class="kosong">Belum ada buku yang dipilih.</td>
            </tr>
        `;
        totalTeks.textContent = formatRupiah(0);
        return;
    }

    tabel.innerHTML = daftarPesanan.map(function (item, index) {
        return `
            <tr>
                <td>${item.judul}</td>
                <td>${formatRupiah(item.harga)}</td>
                <td>
                    <input
                        class="input-jumlah"
                        type="number"
                        min="1"
                        value="${item.jumlah}"
                        onchange="ubahJumlahPesanan(${index}, this.value)"
                    >
                </td>
                <td>${formatRupiah(item.subtotal)}</td>
                <td>
                    <button type="button" class="tombol-hapus"
                        onclick="hapusPesanan(${index})">
                        Hapus
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    const total = daftarPesanan.reduce(function (hasil, item) {
        return hasil + item.subtotal;
    }, 0);

    totalTeks.textContent = formatRupiah(total);
}

function ubahJumlahPesanan(index, nilai) {
    const jumlah = Number(nilai);
    const item = daftarPesanan[index];

    if (!item || jumlah < 1) {
        tampilkanKeranjang();
        return;
    }

    const buku = ambilKatalog().find(function (data) {
        return data.id === item.id;
    });

    if (!buku || jumlah > Number(buku.stok)) {
        alert("Jumlah melebihi stok yang tersedia.");
        tampilkanKeranjang();
        return;
    }

    item.jumlah = jumlah;
    item.subtotal = item.harga * jumlah;

    tampilkanKeranjang();
}

function hapusPesanan(index) {
    daftarPesanan.splice(index, 1);
    tampilkanKeranjang();
}

function prosesCheckout(event) {
    event.preventDefault();

    if (daftarPesanan.length === 0) {
        alert("Silakan pilih buku terlebih dahulu.");
        return;
    }

    const nama = document.getElementById("namaPelanggan").value.trim();
    const email = document.getElementById("emailPelanggan").value.trim();
    const telepon = document.getElementById("teleponPelanggan").value.trim();
    const alamat = document.getElementById("alamatPelanggan").value.trim();
    const pembayaran = document.getElementById("metodePembayaran").value;

    if (!nama || !email || !telepon || !alamat || !pembayaran) {
        alert("Mohon lengkapi seluruh data pelanggan.");
        return;
    }

    const katalog = ambilKatalog();

    for (const pesanan of daftarPesanan) {
        const buku = katalog.find(function (item) {
            return item.id === pesanan.id;
        });

        if (!buku || Number(buku.stok) < pesanan.jumlah) {
            alert("Stok buku " + pesanan.judul + " tidak mencukupi.");
            return;
        }
    }

    daftarPesanan.forEach(function (pesanan) {
        const buku = katalog.find(function (item) {
            return item.id === pesanan.id;
        });

        buku.stok -= pesanan.jumlah;
    });

    simpanKatalog(katalog);

    const total = daftarPesanan.reduce(function (hasil, item) {
        return hasil + item.subtotal;
    }, 0);

    const nomorDO = "DO" + Date.now().toString().slice(-8);

    const transaksiBaru = {
        nomorDO: nomorDO,
        tanggalPesan: new Date().toISOString(),
        statusPengiriman: "Pesanan diterima",
        nama: nama,
        email: email,
        telepon: telepon,
        alamat: alamat,
        pembayaran: pembayaran,
        pesanan: daftarPesanan.map(function (item) {
            return { ...item };
        }),
        total: total
    };

    const transaksi = ambilTransaksi();
    transaksi.push(transaksiBaru);
    simpanTransaksi(transaksi);

    alert(
        "Pesanan berhasil disimpan!\n\n" +
        "Nomor DO: " + nomorDO +
        "\nTotal: " + formatRupiah(total) +
        "\n\nSimpan nomor DO untuk melakukan tracking."
    );

    daftarPesanan = [];
    window.location.href = "tracking.html?do=" + encodeURIComponent(nomorDO);
}

// ======================================
// HALAMAN TRACKING
// ======================================

function jalankanTracking() {
    const form = document.getElementById("formTracking");
    const input = document.getElementById("nomorTracking");

    if (!form || !input) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        cariPesanan(input.value.trim());
    });

    const parameter = new URLSearchParams(window.location.search);
    const nomorDO = parameter.get("do");

    if (nomorDO) {
        input.value = nomorDO;
        cariPesanan(nomorDO);
    }
}

function cariPesanan(nomorDO) {
    const hasil = document.getElementById("hasilTracking");

    if (!hasil) return;

    const transaksi = ambilTransaksi();

    const pesanan = transaksi.find(function (item) {
        return item.nomorDO.toLowerCase() === nomorDO.toLowerCase();
    });

    if (!pesanan) {
        hasil.innerHTML = `
            <div class="pesan-kosong">
                <h3>Pesanan tidak ditemukan</h3>
                <p>Periksa kembali nomor Delivery Order yang kamu masukkan.</p>
            </div>
        `;
        return;
    }

    hasil.innerHTML = `
        <div class="tracking-card">
            <div class="tracking-header">
                <div>
                    <span class="teks-kecil">Nomor Delivery Order</span>
                    <h2>${pesanan.nomorDO}</h2>
                </div>
                <span class="status">${pesanan.statusPengiriman}</span>
            </div>

            <div class="tracking-grid">
                <div>
                    <span>Nama pelanggan</span>
                    <strong>${pesanan.nama}</strong>
                </div>
                <div>
                    <span>Email</span>
                    <strong>${pesanan.email}</strong>
                </div>
                <div>
                    <span>Nomor telepon</span>
                    <strong>${pesanan.telepon}</strong>
                </div>
                <div>
                    <span>Tanggal pemesanan</span>
                    <strong>${formatTanggal(pesanan.tanggalPesan)}</strong>
                </div>
                <div>
                    <span>Kurir</span>
                    <strong>Kurir Ngebuku</strong>
                </div>
                <div>
                    <span>Jenis pengiriman</span>
                    <strong>Reguler</strong>
                </div>
                <div>
                    <span>Metode pembayaran</span>
                    <strong>${pesanan.pembayaran}</strong>
                </div>
                <div>
                    <span>Total pembayaran</span>
                    <strong>${formatRupiah(pesanan.total)}</strong>
                </div>
            </div>

            <h3 class="judul-riwayat">Detail buku</h3>

            <div class="daftar-buku-tracking">
                ${pesanan.pesanan.map(function (item) {
                    return `
                        <div class="baris-buku">
                            <span>${item.judul} × ${item.jumlah}</span>
                            <strong>${formatRupiah(item.subtotal)}</strong>
                        </div>
                    `;
                }).join("")}
            </div>

            <h3 class="judul-riwayat">Status pengiriman</h3>

            <div class="alur-tracking">
                <div class="langkah aktif">
                    <span>1</span>
                    <div>
                        <strong>Pesanan diterima</strong>
                        <p>Pesanan berhasil disimpan oleh Ngebuku.</p>
                    </div>
                </div>
                <div class="langkah">
                    <span>2</span>
                    <div>
                        <strong>Pesanan diproses</strong>
                        <p>Menunggu proses pengemasan.</p>
                    </div>
                </div>
                <div class="langkah">
                    <span>3</span>
                    <div>
                        <strong>Dalam pengiriman</strong>
                        <p>Paket akan dikirim kepada pelanggan.</p>
                    </div>
                </div>
                <div class="langkah">
                    <span>4</span>
                    <div>
                        <strong>Pesanan selesai</strong>
                        <p>Paket diterima oleh pelanggan.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ======================================
// MENJALANKAN FUNGSI SESUAI HALAMAN
// ======================================

document.addEventListener("DOMContentLoaded", function () {
    const halaman = window.location.pathname.split("/").pop();

    if (halaman === "index.html" || halaman === "") {
        jalankanLogin();
    } else {
        cekLogin();
    }

    if (halaman === "dashboard.html") {
        jalankanDashboard();
    }

    if (halaman === "stok.html") {
        jalankanStok();
    }

    if (halaman === "checkout.html") {
        jalankanCheckout();
    }

    if (halaman === "tracking.html") {
        jalankanTracking();
    }
});