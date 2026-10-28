const ALOKASI_PERSEN = {
    'Makan': 0.40,
    'Transportasi': 0.10,
    'Listrik': 0.05,
    'Pulsa/Kuota': 0.04,
    'Kebutuhan pribadi': 0.06,
    'Jajan': 0.08,
    'Tabungan': 0.12,
    'Cadangan': 0.10
};

let anggaranPeriode = parseFloat(localStorage.getItem('anggaranPeriode')) || 1250000;
let tanggalMulai = localStorage.getItem('tanggalMulai') || '';
let transaksi = JSON.parse(localStorage.getItem('transaksi')) || [];
let totalTabunganAkumulatif = parseFloat(localStorage.getItem('totalTabunganAkumulatif')) || 0;

const elInputAnggaran = document.getElementById('inputAnggaran');
const elTanggalMulai = document.getElementById('tanggalMulai');
const elSimpanPeriode = document.getElementById('simpanPeriode');
const elStatusPeriode = document.getElementById('statusPeriode');
const elTotalAnggaran = document.getElementById('totalAnggaran');
const elTotalTerpakai = document.getElementById('totalTerpakai');
const elSisaAnggaran = document.getElementById('sisaAnggaran');
const elDaftarAnggaran = document.getElementById('daftarAnggaran');
const elFormTransaksi = document.getElementById('formTransaksi');
const elDaftarTransaksi = document.getElementById('daftarTransaksi');
const elTotalTabungan = document.getElementById('totalTabungan');
const elSisaMenunggu = document.getElementById('sisaMenunggu');
const elBulanTutup = document.getElementById('bulanTutup');
const elTutupBulan = document.getElementById('tutupBulan');
const elStatusPenutupan = document.getElementById('statusPenutupan');

function formatRupiah(angka) {
    return 'Rp' + Math.floor(angka).toLocaleString('id-ID');
}

elInputAnggaran.value = anggaranPeriode;
if (tanggalMulai) {
    elTanggalMulai.value = tanggalMulai;
    elStatusPeriode.textContent = `Anggaran: ${formatRupiah(anggaranPeriode)} | Tanggal mulai: ${tanggalMulai}`;
}

elSimpanPeriode.addEventListener('click', () => {
    const nilaiAnggaran = parseFloat(elInputAnggaran.value);
    if (!nilaiAnggaran || nilaiAnggaran <= 0) {
        alert('Masukkan nominal anggaran yang valid.');
        return;
    }
    if (!elTanggalMulai.value) {
        alert('Pilih tanggal mulai terlebih dahulu.');
        return;
    }

    anggaranPeriode = nilaiAnggaran;
    tanggalMulai = elTanggalMulai.value;

    localStorage.setItem('anggaranPeriode', anggaranPeriode);
    localStorage.setItem('tanggalMulai', tanggalMulai);

    elStatusPeriode.textContent = `Pengaturan disimpan! Anggaran: ${formatRupiah(anggaranPeriode)} | Mulai: ${tanggalMulai}`;
    perbaruiTampilan();
});

function perbaruiTampilan() {
    const totalPengeluaran = transaksi.reduce((acc, curr) => acc + curr.jumlah, 0);
    const sisa = anggaranPeriode - totalPengeluaran;

    elTotalAnggaran.textContent = formatRupiah(anggaranPeriode);
    elTotalTerpakai.textContent = formatRupiah(totalPengeluaran);
    elSisaAnggaran.textContent = formatRupiah(sisa);
    elTotalTabungan.textContent = formatRupiah(totalTabunganAkumulatif);
    elSisaMenunggu.textContent = formatRupiah(sisa > 0 ? sisa : 0);

    elDaftarAnggaran.innerHTML = '';
    for (const [kategori, persen] of Object.entries(ALOKASI_PERSEN)) {
        const jatah = anggaranPeriode * persen;
        const terpakaiKategori = transaksi
            .filter(t => t.kategori === kategori)
            .reduce((acc, curr) => acc + curr.jumlah, 0);
        const sisaKategori = jatah - terpakaiKategori;

        const div = document.createElement('div');
        div.className = 'item-anggaran';
        div.innerHTML = `
            <strong>${kategori} (${persen * 100}%)</strong><br>
            Jatah: ${formatRupiah(jatah)}<br>
            Sisa: <span style="color: ${sisaKategori < 0 ? 'red' : 'green'}">${formatRupiah(sisaKategori)}</span>
        `;
        elDaftarAnggaran.appendChild(div);
    }

    elDaftarTransaksi.innerHTML = '';
    if (transaksi.length === 0) {
        elDaftarTransaksi.innerHTML = '<p style="color: #64748b;">Belum ada transaksi.</p>';
    } else {
        transaksi.forEach((t, idx) => {
            const div = document.createElement('div');
            div.className = 'item-transaksi';
            div.innerHTML = `
                <div>
                    <strong>${t.keterangan}</strong> (${t.kategori})<br>
                    <small>${t.tanggal}</small>
                </div>
                <div>
                    <strong>${formatRupiah(t.jumlah)}</strong>
                    <button onclick="hapusTransaksi(${idx})" style="width:auto; padding: 2px 8px; margin-left: 10px; background: #ef4444;">Hapus</button>
                </div>
            `;
            elDaftarTransaksi.appendChild(div);
        });
    }
}

elFormTransaksi.addEventListener('submit', (e) => {
    e.preventDefault();
    const ket = document.getElementById('keterangan').value;
    const kat = document.getElementById('kategori').value;
    const jml = parseFloat(document.getElementById('jumlah').value);
    const tgl = document.getElementById('tanggal').value;

    transaksi.push({ keterangan: ket, kategori: kat, jumlah: jml, tanggal: tgl });
    localStorage.setItem('transaksi', JSON.stringify(transaksi));

    elFormTransaksi.reset();
    perbaruiTampilan();
});

window.hapusTransaksi = function(index) {
    transaksi.splice(index, 1);
    localStorage.setItem('transaksi', JSON.stringify(transaksi));
    perbaruiTampilan();
};

elTutupBulan.addEventListener('click', () => {
    if (!elBulanTutup.value) {
        alert('Pilih bulan yang ingin ditutup.');
        return;
    }
    const totalPengeluaran = transaksi.reduce((acc, curr) => acc + curr.jumlah, 0);
    const sisa = anggaranPeriode - totalPengeluaran;

    if (sisa > 0) {
        totalTabunganAkumulatif += sisa;
        localStorage.setItem('totalTabunganAkumulatif', totalTabunganAkumulatif);
    }

    transaksi = [];
    localStorage.setItem('transaksi', JSON.stringify(transaksi));

    elStatusPenutupan.textContent = `Bulan ${elBulanTutup.value} berhasil ditutup. Sisa anggaran dipindahkan ke tabungan.`;
    perbaruiTampilan();
});

perbaruiTampilan();