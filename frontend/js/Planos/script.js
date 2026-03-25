const faqs = document.querySelectorAll(".faq-item");

faqs.forEach((faq) => {
  const header = faq.querySelector(".faq-header");

  header.addEventListener("click", () => {
    
    // fecha todos os outros
    faqs.forEach((item) => {
      if (item !== faq) {
        item.classList.remove("active");
      }
    });

    // alterna o atual
    faq.classList.toggle("active");
  });
});