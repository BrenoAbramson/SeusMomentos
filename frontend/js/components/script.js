async function loadComponent(id, path) {
  const element = document.getElementById(id);

  if (element) {
    const response = await fetch(path);
    const html = await response.text();
    element.innerHTML = html;
  }
}

loadComponent("header", "../../components/header.html");
loadComponent("footer", "../../components/footer.html");