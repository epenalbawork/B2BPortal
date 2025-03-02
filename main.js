// main.js

// URL de tu API (ajusta según tu necesidad)
const API_URL = 'https://z06qjllnxl.execute-api.us-east-1.amazonaws.com/dev/quote-policy';

// Referencias a elementos del DOM
const searchButton = document.getElementById('searchButton');
const locationInput = document.getElementById('locationInput');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorContainer = document.getElementById('errorContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// Mobile menu functionality
function toggleSidebar() {
  const isOpen = !sidebar.classList.contains('-translate-x-full');
  sidebar.classList.toggle('-translate-x-full');
  sidebarOverlay.classList.toggle('hidden');
  
  // Update aria-expanded state
  mobileMenuBtn.setAttribute('aria-expanded', !isOpen);
}

mobileMenuBtn.addEventListener('click', toggleSidebar);

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  const isClickInside = sidebar.contains(e.target) || mobileMenuBtn.contains(e.target);
  if (!isClickInside && !sidebar.classList.contains('-translate-x-full') && window.innerWidth < 1024) {
    toggleSidebar();
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) {
    sidebar.classList.remove('-translate-x-full');
    sidebarOverlay.classList.add('hidden');
  } else if (!sidebar.classList.contains('-translate-x-full')) {
    toggleSidebar();
  }
});

// Evento click => Buscar
searchButton.addEventListener('click', handleSearch);
locationInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
  const locationText = locationInput.value.trim();
  if (!locationText) {
    showError('Por favor ingrese una ubicación');
    return;
  }

  // Limpiar contenido previo
  clearUI();

  try {
    // Mostrar overlay con partículas
    loadingOverlay.classList.remove('hidden');

    // Petición al endpoint
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: locationText }),
    });

    const data = await response.json();

    // Verificar contenido de la respuesta
    if (!data.body || !data.body.response) {
      throw new Error('No se encontró información para esa ubicación.');
    }

    // Procesar la data
    const info = data.body.response;
    renderDashboard(info);

  } catch (error) {
    showError(error.message);
  } finally {
    loadingOverlay.classList.add('hidden');
  }
}

function clearUI() {
  errorContainer.innerHTML = '';
  dashboardContainer.innerHTML = '';
  dashboardContainer.classList.add('hidden');
}

function showError(message) {
  errorContainer.innerHTML = `
    <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">${message}</p>
        </div>
      </div>
    </div>
  `;
}

function renderDashboard(info) {
  dashboardContainer.classList.remove('hidden');

  // Grid layout para el dashboard
  dashboardContainer.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Columna izquierda: Análisis de Riesgo -->
      <div class="lg:col-span-1 order-2 lg:order-1">
        ${renderRiskAnalysis(info.analisis_riesgo)}
      </div>

      <!-- Columna central y derecha: Clima y Detalles -->
      <div class="lg:col-span-2 order-1 lg:order-2">
        <div class="space-y-6">
          ${renderClimateMetrics(info.datos_climaticos?.clima_actual)}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            ${renderUbicacion(info.ubicacion)}
            ${renderBomberos(info.estaciones_bomberos)}
            ${renderAcceso(info.condiciones_acceso)}
            ${renderPronostico(info.datos_climaticos?.pronostico)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderRiskAnalysis(riesgo = {}) {
  if (!riesgo.nivel && !riesgo.recomendacion_aseguradora) {
    return '';
  }

  const getNivelRiesgoColor = (nivel) => {
    const colors = {
      'BAJO': 'bg-green-50 text-green-700 ring-green-600/20',
      'MEDIO': 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
      'ALTO': 'bg-red-50 text-red-700 ring-red-600/20'
    };
    return colors[nivel.toUpperCase()] || 'bg-gray-50 text-gray-700 ring-gray-600/20';
  };

  const factoresRiesgo = Array.isArray(riesgo.factores_riesgo)
    ? riesgo.factores_riesgo.map(f => `
      <li class="flex items-center space-x-3">
        <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <span>${f}</span>
      </li>
    `).join('')
    : '<li class="text-gray-500">No hay factores de riesgo registrados</li>';

  const factoresMitigacion = Array.isArray(riesgo.factores_mitigacion)
    ? riesgo.factores_mitigacion.map(m => `
      <li class="flex items-center space-x-3">
        <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>${m}</span>
      </li>
    `).join('')
    : '<li class="text-gray-500">No hay factores de mitigación registrados</li>';

  return `
    <div class="glass-card h-full">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Análisis de Riesgo</h2>
          <span class="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ${getNivelRiesgoColor(riesgo.nivel)}">
            ${riesgo.nivel || 'No disponible'}
          </span>
        </div>

        <div class="space-y-6">
          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-3">Factores de Riesgo</h3>
            <ul class="space-y-3">
              ${factoresRiesgo}
            </ul>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-3">Factores de Mitigación</h3>
            <ul class="space-y-3">
              ${factoresMitigacion}
            </ul>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-2">Recomendación</h3>
            <p class="text-sm text-gray-600">
              ${riesgo.recomendacion_aseguradora || 'No hay recomendaciones disponibles'}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderClimateMetrics(clima = {}) {
  const metrics = [
    {
      icon: '🌡️',
      label: 'Temperatura',
      value: clima.temperatura ? `${clima.temperatura}°C` : '--',
      color: 'bg-red-50'
    },
    {
      icon: '💧',
      label: 'Humedad',
      value: clima.humedad ? `${clima.humedad}%` : '--',
      color: 'bg-blue-50'
    },
    {
      icon: '🍃',
      label: 'Viento',
      value: clima.viento ? `${clima.viento} km/h` : '--',
      color: 'bg-green-50'
    },
    {
      icon: '☔',
      label: 'Precipitación',
      value: clima.precipitacion ? `${clima.precipitacion} mm` : '--',
      color: 'bg-purple-50'
    }
  ];

  return `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      ${metrics.map(metric => `
        <div class="glass-card">
          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-2xl">${metric.icon}</span>
              <span class="text-lg font-semibold text-gray-900">${metric.value}</span>
            </div>
            <p class="text-sm text-gray-600">${metric.label}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderUbicacion(ubicacion = {}) {
  return `
    <div class="glass-card">
      <div class="p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 ${ubicacion ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'} rounded-lg">
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Ubicación</h3>
        </div>

        <div class="space-y-3">
          <div>
            <p class="text-sm text-gray-500">Nombre</p>
            <p class="text-sm font-medium text-gray-900">${ubicacion.nombre || '--'}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Dirección</p>
            <p class="text-sm font-medium text-gray-900">${ubicacion.direccion || '--'}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Coordenadas</p>
            <p class="text-sm font-medium text-gray-900">
              ${ubicacion?.coordenadas ? 
                `${ubicacion.coordenadas.latitud}, ${ubicacion.coordenadas.longitud}` : 
                '--'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderBomberos(estaciones = []) {
  return `
    <div class="glass-card">
      <div class="p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 ${estaciones.length ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'} rounded-lg">
            <span class="text-xl">🚒</span>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Estaciones de Bomberos</h3>
        </div>

        ${estaciones.length ? `
          <div class="space-y-4">
            ${estaciones.map((est, index) => `
              <div class="${index !== estaciones.length - 1 ? 'pb-4 border-b border-gray-100' : ''}">
                <div class="flex justify-between items-start">
                  <div class="space-y-1">
                    <p class="text-sm font-medium text-gray-900">${est.nombre}</p>
                    <p class="text-sm text-gray-500">${est.direccion}</p>
                  </div>
                  <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    ${est.tiempo_respuesta}
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-500">
                  Distancia: ${est.distancia}
                </p>
              </div>
            `).join('')}
          </div>
        ` : `
          <p class="text-sm text-gray-500">No se encontraron estaciones cercanas</p>
        `}
      </div>
    </div>
  `;
}

function renderAcceso(acceso = {}) {
  const items = [
    { label: 'Carretera principal', value: acceso.carretera_principal },
    { label: 'Camino de acceso', value: acceso.camino_acceso },
    { label: 'Puentes', value: acceso.puentes }
  ];

  return `
    <div class="glass-card">
      <div class="p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 bg-orange-50 text-orange-700 rounded-lg">
            <span class="text-xl">🛣️</span>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Condiciones de Acceso</h3>
        </div>

        <div class="space-y-3">
          ${items.map(item => `
            <div>
              <p class="text-sm text-gray-500">${item.label}</p>
              <p class="text-sm font-medium text-gray-900">${item.value || '--'}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderPronostico(pronostico = {}) {
  const items = [
    { icon: '🌡️', label: 'Temperatura máxima', value: pronostico?.temperatura_max, unit: '°C' },
    { icon: '❄️', label: 'Temperatura mínima', value: pronostico?.temperatura_min, unit: '°C' },
    { icon: '☔', label: 'Precipitación estimada', value: pronostico?.precipitacion_estimada, unit: 'mm' },
    { icon: '🍃', label: 'Viento máximo', value: pronostico?.viento_max, unit: 'km/h' }
  ];

  return `
    <div class="glass-card">
      <div class="p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 bg-yellow-50 text-yellow-700 rounded-lg">
            <span class="text-xl">⛅</span>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Pronóstico</h3>
        </div>

        <div class="grid grid-cols-2 gap-4">
          ${items.map(item => `
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <span>${item.icon}</span>
                <p class="text-sm text-gray-500">${item.label}</p>
              </div>
              <p class="text-sm font-medium text-gray-900">
                ${item.value ? `${item.value}${item.unit}` : '--'}
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}