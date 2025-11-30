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
const $imageSection = document.querySelector('.image-section');

let numContacto = null;
let picturesArray = [];
let currentImageIndex = 0; // índice de la imagen actual
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
  const clickEnSheet = e.target.closest('.bottom-sheet');
  const clickEnBoton = e.target.closest('.buttons i, .buttons a'); 
  // <- aquí estás diciendo: íconos y links dentro de .buttons

  // 1) Click en el panel inferior
  if (clickEnSheet && !clickEnBoton) {
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
  
  const API_URL = `/apiHuellitas/pet/${codigo}`;

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
    $imagenMascota.src = "assets/noImage.png";
  } finally {
    hideLoader(); // 👈 se oculta siempre, haya error o no
  }
}

function displayPet(pet) {

  picturesArray = picturesToArray(pet.petPicture);
  currentImageIndex = 0;
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

    // El circulito activo es el que coincide con currentImageIndex
    if (index === currentImageIndex) {
      dot.classList.add("active");
    }

    $galeriaDots.appendChild(dot);
  });
}

function changeImage(step) {
  if (!picturesArray || picturesArray.length === 0) return;

  // Muevo el índice (loop circular)
  currentImageIndex = (currentImageIndex + step + picturesArray.length) % picturesArray.length;

  // Cambio la imagen principal
  $imagenMascota.src = PIC_URL + picturesArray[currentImageIndex];

  // Actualizo el dot activo
  const dots = $galeriaDots.querySelectorAll('.dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentImageIndex);
  });
}

//****************************** SWIPE IMAGENES ********************************** */
let startX = 0;
let isSwiping = false;

if ($imageSection) {
  // --- Eventos táctiles (celu / tablet) ---
  $imageSection.addEventListener('touchstart', handleTouchStart, { passive: true });
  $imageSection.addEventListener('touchend', handleTouchEnd);

  // --- Eventos de mouse (escritorio) ---
  $imageSection.addEventListener('mousedown', handleMouseDown);
  $imageSection.addEventListener('mouseup', handleMouseUp);
  $imageSection.addEventListener('mouseleave', handleMouseLeave);
}

// Función común para arrancar el swipe
function startSwipe(x) {
  if (!picturesArray || picturesArray.length <= 1) return; // si hay 0 o 1 foto, no hago nada
  startX = x;
  isSwiping = true;
}

// Función común para terminar el swipe
function endSwipe(x) {
  if (!isSwiping) return;
  isSwiping = false;

  const diffX = x - startX;
  const threshold = 50; // px mínimos para considerar swipe

  if (Math.abs(diffX) > threshold) {
    if (diffX < 0) {
      // hacia la izquierda → siguiente imagen
      changeImage(1);
    } else {
      // hacia la derecha → imagen anterior
      changeImage(-1);
    }
  }
}

// ---- Táctil ----
function handleTouchStart(e) {
  startSwipe(e.touches[0].clientX);
}

function handleTouchEnd(e) {
  endSwipe(e.changedTouches[0].clientX);
}

// ---- Mouse ----
function handleMouseDown(e) {
  if (e.button !== 0) return; // solo botón izquierdo
  startSwipe(e.clientX);
}

function handleMouseUp(e) {
  endSwipe(e.clientX);
}

function handleMouseLeave(e) {
  if (!isSwiping) return;
  endSwipe(e.clientX);
}
//****************************** FIN SWIPE IMAGENES ********************************** */

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