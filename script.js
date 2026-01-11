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
    const upiBtn = document.getElementById('bhim-pay-link');
    const upiID = 'raja.khan@okaxis'; // Placeholder UPI ID
    const payeeName = 'RNAseq Course';

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

    // Form submission (Step 1 -> Step 2)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('button');
        btn.innerText = 'Capturing Details...';
        btn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log('Registration details captured:', data);

        setTimeout(() => {
            step1.classList.remove('active');
            step2.classList.add('active');
            window.scrollTo({ top: step2.offsetTop - 100, behavior: 'smooth' });
        }, 800);
    });

    // Payment Confirmation (Step 2 -> Step 3)
    confirmPaymentBtn.addEventListener('click', () => {
        if (!transactionInput.value.trim()) {
            alert('Please enter your Transaction ID for verification.');
            return;
        }

        confirmPaymentBtn.innerText = 'Verifying...';
        confirmPaymentBtn.disabled = true;

        // Capture data and transaction ID
        const transactionId = transactionInput.value;
        console.log('Payment Confirmed. Transaction ID:', transactionId);

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
