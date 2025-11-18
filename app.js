const $sheet = document.querySelector('.bottom-sheet');
const $buttons = document.querySelector('.buttons');
const $panelColapsable = document.getElementById('panelColapsable');
const $nombreMascota = document.getElementById("nombreMascota");
const $contactoMascota = document.getElementById("contactoMascota");
const $edadMascota = document.getElementById("edadMascota");
const $notaMascota = document.getElementById("notaMascota");
const $imagenMascota = document.getElementById("imagen");
const $galeriaDots = document.getElementById('galeriaDots');
const $petCard = document.querySelector('.pet-card');
const $titulo = document.getElementById('titulo');
const $loader = document.getElementById('loader');

let numContacto = null;
let picturesArray = [];
const PIC_URL = 'https://huellitas.diegoagudo.com.ar/imagenes/'

// ************************* EJECUCION PRINCIPAL ******************************

const codigo = detectarCodigoPet();

console.log('Código extraído de la URL:', codigo);
if (!codigo) {
  // Dejo el html cargado con la mascota mock
  fetchPet('default');
} else {  
  fetchPet(codigo);
}

// ------- MANEJO DE EVENTOS -------

$panelColapsable.addEventListener('click', (e) => {

  // 1) Click en la pestaña (#paw)
  if (e.target.closest('#paw')) {
    $sheet.classList.toggle('expanded');
    $sheet.classList.toggle('collapsed');
    $buttons.classList.toggle('hidden');
    $petCard.classList.toggle('hidden');
    $titulo.classList.toggle('hidden');
    $galeriaDots.classList.toggle('hidden');

    return;
  }

    // --- CLICK EN ICONO WHATSAPP ---
  if (e.target.closest('#whapp')) {
    if (numContacto) {
      window.open(`https://wa.me/${numContacto}`, "_blank");
    }
    return;
  }

  // --- CLICK EN ICONO TELEFONO ---
  if (e.target.closest('#phone')) {
    if (numContacto) {
      window.location.href = `tel:${limpiarTelefono(numContacto)}`;
    }
    return;
  }
});

// ************************* FUNCIONES AUXILIARES ******************************

function detectarCodigoPet() {
  // 1) saco barras de inicio y fin
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');

  // 2) si el path NO es vacío y NO termina en .html,
  //    entonces significa que es el código
  if (path && !path.endsWith('.html')) {
    sessionStorage.setItem('huellitas_pet_code', path);
    return path;
  }

  // 3) si estoy en index.html, info.html, dev.html...
  //    recupero lo último que guardé
  return sessionStorage.getItem('huellitas_pet_code');
}

async function fetchPet(codigo) {
  const API_URL = `https://huellitas.diegoagudo.com.ar/apiHuellitas/pet/default`;
  // const API_URL = `/apiHuellitas/pet/${codigo}`;

  showLoader();

  try {
    //mostrarMensaje('Cargando datos...');
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Mascota no encontrada');
    const pet = await res.json();
    // console.log(pet);
    displayPet(pet);
  } catch (err) {
    mostrarMensaje('Error al obtener los datos de la mascota.');
    console.error(err);
  } finally {
    hideLoader(); // 👈 se oculta siempre, haya error o no
  }
}

function displayPet(pet) {

  picturesArray = picturesToArray(pet.petPicture);
  // console.log('Array de imágenes:', picturesArray);
  cargarGaleria(picturesArray || []);

  $nombreMascota.textContent = pet.petName;
  $contactoMascota.textContent = pet.ownerName;
  $edadMascota.textContent = convertirEdad(pet.birthDate);
  $notaMascota.textContent = pet.note;
  $imagenMascota.src = picturesArray[0] 
    ? PIC_URL + picturesArray[0] 
    : "assets/noImage.png";
  $titulo.textContent = `${pet.petName}`;
  numContacto = pet.contact;
}

function showLoader() {
  if ($loader) $loader.classList.remove('hidden');
}

function hideLoader() {
  if ($loader) $loader.classList.add('hidden');
}

function mostrarMensaje(msg) {
  const container = document.getElementById('panelInfo');
  if (container) container.innerHTML = `<div class="alert alert-info">${msg}</div>`;
}

function cargarGaleria(imagenes) {
  $galeriaDots.innerHTML = ""; // limpio por si cambia de mascota

  imagenes.forEach((picName, index) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");

    // Primer circulito activo por defecto
    if (index === 0) dot.classList.add("active");

    dot.addEventListener("click", () => {
      // Cambio la imagen principal
      $imagenMascota.src = PIC_URL + picName;

      // Actualizo los estilos activos
      document.querySelectorAll(".dot").forEach(d => d.classList.remove("active"));
      dot.classList.add("active");
    });

    $galeriaDots.appendChild(dot);
  });
}

function picturesToArray(cadena) {
  if (!cadena || typeof cadena !== "string") return [];

  return cadena
    .split(",")          // separa por coma
    .map(f => f.trim())  // saca espacios por las dudas
    .filter(f => f !== ""); // evita vacíos
}

function convertirEdad(fechaNacimientoStr) {
  if (!fechaNacimientoStr) return '❓';

  const fechaNacimiento = new Date(fechaNacimientoStr);
  const hoy = new Date();

  let años = hoy.getFullYear() - fechaNacimiento.getFullYear();
  let meses = hoy.getMonth() - fechaNacimiento.getMonth();

  if (meses < 0) {
    años--;
    meses += 12;
  }

  if (años > 0 && meses > 0) {
    return `${años} año${años > 1 ? 's' : ''} y ${meses} mes${meses > 1 ? 'es' : ''}`;
  }

  if (años > 0) {
    return `${años} año${años > 1 ? 's' : ''}`;
  } else {
    return `${meses} mes${meses > 1 ? 'es' : ''}`;
  }
}

function limpiarTelefono(numero) {
  // Si empieza con 549, se lo quitamos
  if (numero.startsWith("549")) {
    return numero.slice(3);
  }
  return numero;
}