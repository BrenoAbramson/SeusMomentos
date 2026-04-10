document.addEventListener("DOMContentLoaded", () => {
  console.log("Página Exemplos carregada e pronta.");
  // Exemplo de interatividade futura para os botões de filtro
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});
