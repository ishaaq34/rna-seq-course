document.addEventListener("DOMContentLoaded", () => {
  const groupInput = document.getElementById("group-size");
  const calcResult = document.getElementById("calc-result");
  const form = document.getElementById("course-form");

  // Group discount calculator logic
  const updatePrice = () => {
    const count = parseInt(groupInput.value) || 1;

    // Logic: every 3 friends (total 4), 1 is free
    // 3+1 = 4 people, pay for 3 ($3)
    // 6+2 = 8 people, pay for 6 ($6)

    const freeSpots = Math.floor(count / 4);
    const payableSpots = count - freeSpots;
    const totalPrice = payableSpots;

    calcResult.innerHTML = `Total: $${totalPrice.toFixed(2)} (~${
      totalPrice * 100
    } Rs) <br><small>${
      freeSpots > 0 ? freeSpots + " Free spot(s) included!" : ""
    }</small>`;
  };

  groupInput.addEventListener("input", updatePrice);

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.groupSize = groupInput.value;

    console.log("Registration Data Captured:", data);

    // Visual feedback
    const btn = form.querySelector("button");
    const originalText = btn.innerText;
    btn.innerText = "Registration Sent!";
    btn.style.background = "var(--secondary)";
    btn.disabled = true;

    alert(
      "Thank you for registering! We have captured your details. Since this is a local preview, your data is logged to the console."
    );

    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background =
        "linear-gradient(135deg, var(--primary), var(--accent))";
      btn.disabled = false;
    }, 3000);
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
});
