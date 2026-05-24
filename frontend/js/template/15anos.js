// ===============================
// COUNTDOWN TIMER
// ===============================
const countdown = () => {
  const countDate = new Date("October 24, 2024 19:00:00").getTime();
  const now = new Date().getTime();
  const gap = countDate - now;

  // Time calculations
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  // Calculate the remaining time
  const textDay = Math.floor(gap / day);
  const textHour = Math.floor((gap % day) / hour);
  const textMinute = Math.floor((gap % hour) / minute);

  // Update HTML
  if (document.querySelector(".count-day")) {
    document.querySelector(".count-day").innerText = textDay < 10 ? "0" + textDay : textDay;
    document.querySelector(".count-hour").innerText = textHour < 10 ? "0" + textHour : textHour;
    document.querySelector(".count-min").innerText = textMinute < 10 ? "0" + textMinute : textMinute;
  }
};

setInterval(countdown, 1000);

// ===============================
// FORM HANDLING
// ===============================
const rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) {
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = rsvpForm.querySelector('.btn-submit');
    const originalText = btn.innerText;
    
    btn.innerText = "ENVIANDO...";
    btn.disabled = true;

    setTimeout(() => {
      alert("Sua presença foi confirmada com sucesso! Mal podemos esperar por esse dia. ✨");
      btn.innerText = originalText;
      btn.disabled = false;
      rsvpForm.reset();
    }, 1500);
  });
}

// ===============================
// SMOOTH SCROLL FOR NAV LINKS
// ===============================
document.querySelectorAll('.nav-menu a').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});
