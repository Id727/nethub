// payment.js

/**
 * Variabel Global yang Akan Disediakan oleh HTML (index.html)
 * Harap pastikan variabel ini dideklarasikan di <script> tag di index.html sebelum memuat payment.js
 */
// let selectedPrice = 0;
// let selectedProduct = '';
// let countdownInterval = null;
// const closeModal = () => { /* ... definisi di index.html ... */ };
// const startCountdown = (duration, displayElement) => { /* ... definisi di index.html ... */ };


// Endpoint transaksi utama
const API_URL = 'https://api-96422-kuota.id/v1';

/**
 * Mengirim detail pesanan ke gateway pembayaran (Simulasi API).
 * String QRIS dipindahkan ke fungsi ini.
 */
function createOrder(product, phone, amount) {
    const latency = Math.floor(Math.random() * 1000) + 1000;

    // Detail payload (hanya untuk referensi, tidak dikirim sungguhan di simulasi ini)
    const payload = {
        endpoint: `${API_URL}/transaction/create`,
        method: 'POST',
        data: {
            product_code: product.replace(/\s/g, '_').toUpperCase(),
            destination_number: phone,
            amount: amount
        }
    };

    return new Promise((resolve) => {
        setTimeout(() => {
            // Respons dari Gateway (String QRIS DITAMPILKAN HANYA DI SINI)
            const response = {
                status: 'success',
                message: 'Order created successfully. Waiting for payment.',
                data: {
                    transaction_id: `NH${Date.now()}`,
                    product_name: product,
                    destination: phone,
                    total_amount: amount,
                    payment_method: 'QRIS',
                    // *** STRING QRIS YANG ANDA MINTA PINDAHKAN ADA DI BAWAH INI ***
                    qr_code_string: '00020101021126670016COM.NOBUBANK.WWW01189360050300000907180214531277541631500303UMI51440014ID.CO.QRIS.WWW0215ID20254466748920303UMI5204481253033605802ID5914Pulsa CELLULAR6009INDONESIA61059024262070703A0163045CAF',
                    expiry_minutes: 10
                }
            };
            resolve(response);
        }, latency);
    });
}


/**
 * Menampilkan Modal QRIS setelah mendapatkan nomor HP dan memproses order.
 */
async function showQR() {
    const phone = document.getElementById('phoneNumber').value;
    const modal = document.getElementById('modalContent');

    if (!phone || phone.length < 8) {
        alert('Masukkan nomor HP yang valid terlebih dahulu!');
        return;
    }

    // Tampilkan pesan loading yang profesional
    modal.innerHTML = `
        <h3>Memproses Pesanan...</h3>
        <p>Memvalidasi nomor dan stok produk...</p> 
        <div style="margin: 20px 0;">
            <img src="https://iili.io/fd1KHjs.png" alt="Loading GIF" style="width: 50px; height: 50px;">
        </div>
    `;

    try {
        // Panggil fungsi untuk membuat pesanan
        // selectedProduct dan selectedPrice berasal dari variabel global di index.html
        const apiResponse = await createOrder(selectedProduct, phone, selectedPrice);

        if (apiResponse.status !== 'success') {
            alert('Gagal membuat pesanan. Silakan coba lagi.');
            closeModal();
            return;
        }

        const data = apiResponse.data;
        const qrString = data.qr_code_string;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrString)}&size=220x220`;

        // Tampilkan modal QRIS
        modal.innerHTML = `
            <h3>Pembayaran QRIS</h3>

            <div class="transaction-details">
                <p><span>Produk:</span> <strong>${data.product_name}</strong></p>
                <p><span>Nomor Tujuan:</span> <strong>${data.destination}</strong></p>
                <p><span>ID Transaksi:</span> <strong>${data.transaction_id}</strong></p>
                <p><span>Total Bayar:</span> <strong style="color: #e91e63;">Rp ${data.total_amount.toLocaleString('id-ID')}</strong></p>
            </div>

            <div class="qr-container">
                <p id="payment-timer">Batas Waktu: <strong>${data.expiry_minutes}:00</strong></p>
                <a href="${qrUrl}" download="NetHub_Payment_QRIS_${data.transaction_id}.png">
                    <img class='qr-image' src='${qrUrl}' alt='QRIS Payment' />
                </a>
                <a href="${qrUrl}" class="download-qr-link" download="NetHub_Payment_QRIS_${data.transaction_id}.png" style="font-size: 0.9rem; color: #007aff; display: block; margin-top: 5px;">
                    Unduh Kode QR
                </a>
            </div>

            <div class="payment-instructions">
                <p style="font-weight: 600; color: #007aff;">LANGKAH 1:</p>
                <p>Silakan pindai (scan) Kode QR di atas menggunakan aplikasi perbankan (BCA, Mandiri, BRI, dll.) atau e-wallet (Dana, GoPay, OVO, ShopeePay).</p>

                <p style="font-weight: 600; color: #007aff; margin-top: 10px;">LANGKAH 2:</p>
                <p>Pastikan nominal Rp ${data.total_amount.toLocaleString('id-ID')} sudah sesuai.</p>

                <p style="margin-top: 15px; font-size: 1rem;">
                    <strong><span style="color: #28a745;">✅ Setelah transfer berhasil, pesanan akan otomatis diproses dalam 1-3 menit.</span></strong>
                </p>
            </div>

            <button class='buy-btn' style="margin-top: 20px; background: #6c757d;" onclick='closeModal()'>Selesai</button>
        `;

        const timerDisplay = document.getElementById('payment-timer');
        startCountdown(60 * data.expiry_minutes, timerDisplay);

    } catch (error) {
        alert('Terjadi kesalahan sistem. Silakan coba lagi.');
        closeModal();
    }
}
