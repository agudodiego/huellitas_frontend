const sheet = document.querySelector('.bottom-sheet');


document.addEventListener('DOMContentLoaded', () => {
  // const codigo = getCodigoFromUrl();
  // if (!codigo) {
  //   mostrarMensaje('No se encontró el código en la URL.');
  //   return;
  // }

  const codigo = 'PET-00123'; // Código fijo para pruebas
  fetchPet(codigo);
});

sheet.addEventListener('click', () => {
  sheet.classList.toggle('expanded');
  sheet.classList.toggle('collapsed');
});

function getCodigoFromUrl() {
  // Extrae el último segmento del path
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  // Validamos solo caracteres seguros
  return /^[A-Za-z0-9_-]+$/.test(path) ? path : null;
}

async function fetchPet(codigo) {
  const API_URL = `https://huellitas.diegoagudo.com.ar/apiHuellitas/pet/${codigo}`; //borrar esta linea para produccion
  // const API_URL = `/apiHuellitas/pet/${codigo}`;
  try {
    mostrarMensaje('Cargando datos...');
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Mascota no encontrada');
    const pet = await res.json();
    //displayPet(pet);
  } catch (err) {
    mostrarMensaje('Error al obtener los datos de la mascota.');
    console.error(err);
  }
}

function mostrarMensaje(msg) {
  const container = document.getElementById('petInfo');
  if (container) container.innerHTML = `<div class="alert alert-info">${msg}</div>`;
}

function displayPet(pet) {
  console.log(pet.contact);
  const container = document.getElementById('petInfo');

  // Limpia contenido anterior
  container.innerHTML = '';

  // bloque de HTML con backticks
  const petHTML = `
    <div class="card card-glass text-dark mx-auto" style="max-width: 500px;">
      <div class="card-body">        

        <div class="row mb-2">
          <div class="col text-center">
            <img 
              src="${selectImage(pet.petPicture, pet.petType)}"
              alt="Foto de ${pet.petName || 'Mascota'}"
              class="img-fluid rounded-3"
              style="max-width: 150px;"
            >
          </div>
       </div>

        <div class="row mb-2">
          <div class="col-4 fw-bold">Nombre:</div>
          <div class="col-8">${pet.petName || '❓'}</div>
        </div>

        <div class="row mb-2">
          <div class="col-4 fw-bold">Dueño:</div>
          <div class="col-8">${pet.ownerName || '❓'}</div>
        </div>

        <div class="row mb-2">
          <div class="col-4 fw-bold">Edad:</div>
          <div class="col-8">${convertirEdad(pet.birthDate) ?? '❓'}</div>
        </div>

        <div class="row mb-2">
          <div class="col-12">${pet.note || '❓'}</div>
        </div>

        <div class="row mt-3">
          <div class="col-8 mx-auto d-flex justify-content-center align-items-center gap-5">
            <a href="https://wa.me/${pet.contact}" target="_blank" 
              class="d-inline-flex align-items-center justify-content-center rounded shadow text-white text-decoration-none"
              style="background-color:#25D366; width: 45px; height: 45px;">
              <i class="bi bi-whatsapp fs-1"></i>
            </a>

            <a href="tel:${limpiarTelefono(pet.contact)}" 
              class="d-inline-flex align-items-center justify-content-center bg-primary rounded shadow text-white text-decoration-none"
              style="width: 45px; height: 45px;">
              <i class="bi bi-telephone-fill fs-1"></i>
            </a>
          </div>
        </div>

      </div>
    </div>
  `;

  container.innerHTML = petHTML;
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


function selectImage(img, petType) {
  
  if (img) return img;

  switch (petType.toLowerCase()) {
    case 'perro':
      return 'images/dog_avatar.png';
    case 'gato':
      return 'images/cat_avatar.png';
    default:
      return '-';
  }
}