document.addEventListener('DOMContentLoaded', () => {
    const groupInput = document.getElementById('group-size');
    const calcResult = document.getElementById('calc-result');
    const form = document.getElementById('course-form');
    const finalAmount = document.getElementById('final-amount');
    
    // Steps
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    
    // Buttons
    const confirmPaymentBtn = document.getElementById('confirm-payment');
    const backToRegBtn = document.getElementById('back-to-reg');
    const transactionInput = document.getElementById('transaction-id');

    // BHIM UPI Link Generator
    // CONFIGURATION: Set your UPI ID (VPA) and Name below
    const upiID = '{{UPI_ID}}'; // <-- INJECTED SECURELY
    const payeeName = 'RNA-seq Course'; // <-- Change this to your preferred name

    const updateUPILink = (amount) => {
        // Amount in INR (amount * 100)
        const inrAmount = amount * 100;
        const upiLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(payeeName)}&am=${inrAmount}&cu=INR&tn=${encodeURIComponent('RNA-seq Course Registration')}`;
        upiBtn.setAttribute('href', upiLink);
        
        // On desktop, we can also update a QR code generation service URL if needed,
        // but for now, we leave the placeholder image.
    };

    // Group discount calculator logic
    const updatePrice = () => {
        const count = parseInt(groupInput.value) || 1;
        const freeSpots = Math.floor(count / 4);
        const payableSpots = count - freeSpots;
        const totalPrice = payableSpots;

        const priceText = `$${totalPrice.toFixed(2)} (~${totalPrice * 100} Rs)`;
        calcResult.innerHTML = `Total: ${priceText} <br><small>${freeSpots > 0 ? freeSpots + ' Free spot(s) included!' : ''}</small>`;
        finalAmount.innerText = priceText;
        
        // Update UPI Deep Link
        updateUPILink(totalPrice);
    };

    groupInput.addEventListener('input', updatePrice);
    
    // Initial price set
    updatePrice();

    // Google Sheets Configuration
    const googleSheetURL = '{{GOOGLE_SHEET_URL}}'; // <-- INJECTED SECURELY

    async function sendToGoogleSheets(data) {
        if (googleSheetURL === 'YOUR_GOOGLE_SHEET_URL_HERE') return;
        
        try {
            await fetch(googleSheetURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(data)
            });
            console.log('Data sent to Google Sheets');
        } catch (error) {
            console.error('Error sending to Google Sheets:', error);
        }
    }

    // Form submission (Step 1 -> Step 2)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Syncing...';
        btn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Send to Google Sheets asynchronously
        sendToGoogleSheets(data);

        setTimeout(() => {
            step1.classList.remove('active');
            step2.classList.add('active');
            window.scrollTo({ top: step2.offsetTop - 100, behavior: 'smooth' });
            btn.innerText = originalText;
            btn.disabled = false;
        }, 800);
    });

    // Payment Confirmation (Step 2 -> Step 3)
    confirmPaymentBtn.addEventListener('click', async () => {
        if (!transactionInput.value.trim()) {
            alert('Please enter your Transaction ID for verification.');
            return;
        }

        const transId = transactionInput.value.trim();
        confirmPaymentBtn.innerText = 'Finalizing...';
        confirmPaymentBtn.disabled = true;

        // Sync Transaction ID to Google Sheets
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.transaction_id = transId;
        await sendToGoogleSheets(data);

        // Final submission simulation
        setTimeout(() => {
            step2.classList.remove('active');
            step3.classList.add('active');
            window.scrollTo({ top: step3.offsetTop - 100, behavior: 'smooth' });
        }, 1200);
    });

    // Back button
    backToRegBtn.addEventListener('click', () => {
        step2.classList.remove('active');
        step1.classList.add('active');
        form.querySelector('button').innerText = 'Proceed to Payment';
        form.querySelector('button').disabled = false;
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
