const p = document.getElementById('foot');
let year = new Date().getFullYear();
const html = `Developed by Micah Dunson - &copy ${year}`;
p.innerHTML = html;
