const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const header = item.querySelector(".faq-header");

  header.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    faqItems.forEach((faq) => {
      faq.classList.remove("active");
    });

    if (!isActive) {
      item.classList.add("active");
    }
  });
});