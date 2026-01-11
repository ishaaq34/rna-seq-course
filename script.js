document.addEventListener('DOMContentLoaded', () => {
    // Auto-detect Location
    const fetchLocation = async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data.country_name) document.getElementById('country').value = data.country_name;
            if (data.region) document.getElementById('region').value = data.region;
            if (data.city) document.getElementById('city').value = data.city;
            console.log('Location detected:', data.city, data.country_name);
        } catch (error) {
            console.warn('Location detection failed:', error);
        }
    };
    fetchLocation();

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
    const upiBtn = document.getElementById('bhim-pay-link');

    // BHIM UPI Link Generator
    // CONFIGURATION: Set your UPI ID (VPA) and Name below
    const upiID = '{{UPI_ID}}'; // <-- INJECTED SECURELY
    const payeeName = 'RNA-seq Course'; // <-- Change this to your preferred name

    const updateUPILink = (amount) => {
        if (!upiBtn) return;
        // Amount in INR (amount * 100)
        const inrAmount = amount * 100;
        const upiLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(payeeName)}&am=${inrAmount}&cu=INR&tn=${encodeURIComponent('RNA-seq Course Registration')}`;
        upiBtn.setAttribute('href', upiLink);
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
        const txnId = transactionInput.value.trim();
        const fileInput = document.getElementById('payment-screenshot');
        const file = fileInput.files[0];

        if (!txnId && !file) {
            alert('Please enter a Transaction ID or upload a screenshot.');
            return;
        }

        const originalText = confirmPaymentBtn.innerText;
        confirmPaymentBtn.innerText = 'Verifying...';
        confirmPaymentBtn.disabled = true;

        const email = document.getElementById('email').value; // Get email from Step 1
        
        // Prepare payload
        let payload = {
            email: email,
            transaction_id: txnId,
            type: 'PAYMENT_PROOF'
        };

        const finishStep = () => {
             setTimeout(() => {
                step2.classList.remove('active');
                step3.classList.add('active');
                window.scrollTo({ top: step3.offsetTop - 100, behavior: 'smooth' });
            }, 1200);
        };

        // File Handler
        if (file) {
            const reader = new FileReader();
            reader.onload = async function() {
                // Send raw base64 string without data:image/ prefix
                payload.fileData = reader.result.split(',')[1]; 
                payload.mimeType = file.type;
                payload.fileName = file.name;
                
                await sendToGoogleSheets(payload); 
                finishStep();
            };
            reader.readAsDataURL(file);
        } else {
            await sendToGoogleSheets(payload);
            finishStep();
        }
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
