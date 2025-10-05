document.addEventListener('DOMContentLoaded', () => {
    // API Key dan URL Google sudah DIHAPUS dari sini demi keamanan

    // DOM Elements
    const companyForm = document.getElementById('companyForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultContainer = document.getElementById('resultContainer');
    const initialMessage = document.getElementById('initialMessage');
    const errorMessage = document.getElementById('errorMessage');
    const copyButton = document.getElementById('copyButton');
    const printButton = document.getElementById('printButton');
    const riskTabs = document.querySelectorAll('.risk-tab');
    const riskContents = document.querySelectorAll('.risk-content');

    // ... (Semua fungsi Anda yang lain seperti formatRupiah, tabs, copy, print tetap sama) ...
    // Format currency (Rupiah)
    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    }
    
    // Tabs functionality
    riskTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            riskTabs.forEach(t => t.classList.remove('active'));
            riskContents.forEach(content => content.classList.add('hidden'));
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.remove('hidden');
        });
    });
    
    // Copy functionality
    copyButton.addEventListener('click', () => {
        let textToCopy = '';
        textToCopy += document.getElementById('riskSummary').innerText + '\n\n';
        riskContents.forEach(content => {
            const title = content.querySelector('h3').innerText;
            const text = content.querySelector('.risk-text').innerText;
            textToCopy += `${title}\n${text}\n\n`;
        });
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
            setTimeout(() => {
                copyButton.innerHTML = originalText;
            }, 2000);
        });
    });
    
    // Print functionality
    printButton.addEventListener('click', () => {
        window.print();
    });
    
    // Form submission
    companyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        loadingIndicator.classList.remove('hidden');
        loadingIndicator.classList.add('flex');
        resultContainer.classList.add('hidden');
        initialMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // ... (Bagian 'Get form data' dan 'Translate form values' tetap sama persis) ...
        const companyName = document.getElementById('companyName').value;
        const trackRecord = document.getElementById('trackRecord').value;
        const location = document.getElementById('location').value;
        const guaranteeValue = document.getElementById('guaranteeValue').value;
        const workType = document.getElementById('workType').value;
        const guaranteeType = document.getElementById('guaranteeType').value;
        const additionalInfo = document.getElementById('additionalInfo').value;
        
        const trackRecordText = {
            'baik': 'Baik (Tidak Ada Kasus)', 'kol2': 'Pernah KOL 2', 'kol3': 'Pernah KOL 3',
            'kol4': 'Pernah KOL 4', 'kasus_hukum': 'Terkait Kasus Hukum'
        }[trackRecord];
        
        const locationText = { 'hijau': 'Zona Hijau', 'merah': 'Zona Merah', 'hitam': 'Zona Hitam' }[location];
        
        const guaranteeTypeText = {
            'penawaran': 'Jaminan Penawaran', 'pelaksanaan': 'Jaminan Pelaksanaan', 'uang_muka': 'Jaminan Uang Muka',
            'pemeliharaan': 'Jaminan Pemeliharaan', 'pembayaran': 'Jaminan Pembayaran'
        }[guaranteeType];
        
        try {
            // Create prompt for Gemini API (logika ini tidak berubah)
            const prompt = `
            Sebagai ahli manajemen risiko, berikan analisis terperinci untuk 9 risiko bisnis penjaminan untuk perusahaan berikut:
            
            Nama Perusahaan: ${companyName}
            Track Record: ${trackRecordText}
            Lokasi: ${locationText}
            Nilai Jaminan: ${formatRupiah(guaranteeValue)}
            Jenis Pekerjaan: ${workType}
            Jenis Jaminan: ${guaranteeTypeText}
            Informasi Tambahan: ${additionalInfo || "Tidak ada"}
            
            Berikan analisis terperinci untuk semua 9 risiko berikut:
            1. Risiko Kredit, 2. Risiko Pasar, 3. Risiko Likuiditas, 4. Risiko Operasional, 5. Risiko Kejahatan Keuangan, 6. Risiko Hukum, 7. Risiko Kepatuhan, 8. Risiko Strategik, dan 9. Risiko Reputasi.
            
            Untuk setiap risiko, berikan:
            - Analisis tingkat risiko (Rendah/Sedang/Tinggi)
            - Justifikasi penilaian tersebut
            - Rekomendasi mitigasi risiko
            Jika tidak ditemukan risiko, nyatakan bahwa risiko tersebut rendah dan tidak ada tindakan khusus yang diperlukan. dan berikan penjelasan singkat alasannya.
            
            Buat juga ringkasan eksekutif yang menyimpulkan semua analisis di atas dalam 3-5 kalimat.
            
            Format jawaban dalam bahasa Indonesia formal dan profesional. Berikan informasi yang cukup detail tapi tetap ringkas untuk setiap jenis risiko.
            `;
            
            // =================================================================
            // === PERUBAHAN UTAMA DI SINI ===
            // Menghubungi server backend Anda, bukan Google secara langsung.
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt // Kirim prompt yang sudah dibuat ke server
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Request gagal dengan status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.aiResponse) {
                throw new Error('Tidak ada respons dari server');
            }
            
            // Jawaban dari AI sekarang ada di 'data.aiResponse'
            const aiResponse = data.aiResponse;
            // =================================================================

            // Proses dan tampilkan hasil (tidak ada perubahan di bawah ini)
            const sections = parseAIResponse(aiResponse);
            displayResults(sections);
            
            copyButton.disabled = false;
            printButton.disabled = false;
            
            loadingIndicator.classList.add('hidden');
            loadingIndicator.classList.remove('flex');
            resultContainer.classList.remove('hidden');
            initialMessage.classList.add('hidden');
            
        } catch (error) {
            console.error('Error:', error);
            errorMessage.querySelector('p').textContent = error.message; // Menampilkan pesan error yang lebih spesifik
            loadingIndicator.classList.add('hidden');
            loadingIndicator.classList.remove('flex');
            errorMessage.classList.remove('hidden');
            initialMessage.classList.add('hidden');
        }
    });

    // ... (Fungsi parseAIResponse dan displayResults Anda tetap sama persis) ...
    function parseAIResponse(response) {
        const sections = { summary: '', kredit: '', pasar: '', likuiditas: '', operasional: '', kejahatan: '', hukum: '', kepatuhan: '', strategik: '', reputasi: '' };
        const summaryRegex = /(?:Ringkasan|Ringkasan Eksekutif|Kesimpulan)(.*?)(?=\n\d\.|\n$)/is;
        const summaryMatch = response.match(summaryRegex);
        if (summaryMatch && summaryMatch[1]) {
            sections.summary = summaryMatch[1].trim().replace(/\*/g, '');
        }
        
        const riskSections = [
            { name: 'kredit', regex: /(?:1\.?\s*)?Risiko Kredit(.*?)(?=\n\d\.|\n$)/is },
            { name: 'pasar', regex: /(?:2\.?\s*)?Risiko Pasar(.*?)(?=\n\d\.|\n$)/is },
            { name: 'likuiditas', regex: /(?:3\.?\s*)?Risiko Likuiditas(.*?)(?=\n\d\.|\n$)/is },
            { name: 'operasional', regex: /(?:4\.?\s*)?Risiko Operasional(.*?)(?=\n\d\.|\n$)/is },
            { name: 'kejahatan', regex: /(?:5\.?\s*)?Risiko Kejahatan Keuangan(.*?)(?=\n\d\.|\n$)/is },
            { name: 'hukum', regex: /(?:6\.?\s*)?Risiko Hukum(.*?)(?=\n\d\.|\n$)/is },
            { name: 'kepatuhan', regex: /(?:7\.?\s*)?Risiko Kepatuhan(.*?)(?=\n\d\.|\n$)/is },
            { name: 'strategik', regex: /(?:8\.?\s*)?Risiko Strategik(.*?)(?=\n\d\.|\n$)/is },
            { name: 'reputasi', regex: /(?:9\.?\s*)?Risiko Reputasi(.*?)(?=\n\d\.|\n$|$)/is }
        ];
        
        riskSections.forEach(section => {
            const match = response.match(section.regex);
            if (match && match[1]) {
                sections[section.name] = match[1].trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            } else {
                sections[section.name] = "Data tidak tersedia untuk jenis risiko ini.";
            }
        });

        if (!sections.summary) {
            sections.summary = "Analisis telah dilakukan. Lihat detail pada setiap tab risiko.";
        }
        
        return sections;
    }
    
    function displayResults(sections) {
        document.getElementById('riskSummary').innerHTML = sections.summary.replace(/\n/g, '<br>');
        document.querySelector('#tab-kredit .risk-text').innerHTML = sections.kredit;
        document.querySelector('#tab-pasar .risk-text').innerHTML = sections.pasar;
        document.querySelector('#tab-likuiditas .risk-text').innerHTML = sections.likuiditas;
        document.querySelector('#tab-operasional .risk-text').innerHTML = sections.operasional;
        document.querySelector('#tab-kejahatan .risk-text').innerHTML = sections.kejahatan;
        document.querySelector('#tab-hukum .risk-text').innerHTML = sections.hukum;
        document.querySelector('#tab-kepatuhan .risk-text').innerHTML = sections.kepatuhan;
        document.querySelector('#tab-strategik .risk-text').innerHTML = sections.strategik;
        document.querySelector('#tab-reputasi .risk-text').innerHTML = sections.reputasi;
        
        riskTabs[0].click();
    }
});