// main.js

// URL de tu API (ajusta según tu necesidad)
const API_URL = 'https://z06qjllnxl.execute-api.us-east-1.amazonaws.com/dev/quote-policy';

// Referencias a elementos del DOM
const searchButton = document.getElementById('searchButton');
const locationInput = document.getElementById('locationInput');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorContainer = document.getElementById('errorContainer');
const dashboardContainer = document.getElementById('dashboardContainer');

// Evento click => Buscar
searchButton.addEventListener('click', async () => {
  const locationText = locationInput.value.trim();
  if (!locationText) return;

  // Limpiar contenido previo
  errorContainer.innerHTML = '';
  dashboardContainer.innerHTML = '';
  dashboardContainer.classList.add('hidden');

  // Mostrar overlay con partículas
  loadingOverlay.classList.remove('hidden');

  try {
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
    // Mensaje de error
    errorContainer.innerHTML = `
      <div class="bg-red-900 text-white p-4 rounded-md">
        <p>${error.message}</p>
      </div>
    `;
  } finally {
    // Ocultar overlay
    loadingOverlay.classList.add('hidden');
  }
});

/** 
 * Construye dinámicamente el dashboard
 * en el siguiente orden:
 * 1) Análisis de Riesgo
 * 2) Métricas Clima
 * 3) Sección Principal (Ubicación, Bomberos, Acceso, Pronóstico)
 */
function renderDashboard(info) {
  dashboardContainer.classList.remove('hidden');

  // 1. Análisis de Riesgo (si existe)
  dashboardContainer.innerHTML += renderRiskAnalysis(info.analisis_riesgo);

  // 2. Métricas Clima
  dashboardContainer.innerHTML += renderClimateMetrics(info.datos_climaticos?.clima_actual);

  // 3. Sección principal (2 columnas)
  dashboardContainer.innerHTML += `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Columna Izquierda -->
      <div class="flex flex-col space-y-6">
        ${renderUbicacion(info.ubicacion)}
        ${renderBomberos(info.estaciones_bomberos)}
      </div>

      <!-- Columna Derecha -->
      <div class="flex flex-col space-y-6">
        ${renderAcceso(info.condiciones_acceso)}
        ${renderPronostico(info.datos_climaticos?.pronostico)}
      </div>
    </div>
  `;
}

// ---- Funciones de render (igual que antes) ----


function renderRiskAnalysis(riesgo = {}) {
    const emojiWiggle = '<span class="text-4xl animate-wiggle">⚠️</span>';
  
    const factoresRiesgo = Array.isArray(riesgo.factores_riesgo)
      ? riesgo.factores_riesgo.map((f) => `<li>${f}</li>`).join('')
      : '<li>--</li>';
  
    const factoresMitigacion = Array.isArray(riesgo.factores_mitigacion)
      ? riesgo.factores_mitigacion.map((m) => `<li>${m}</li>`).join('')
      : '<li>--</li>';
  
    // Si no hay riesgo, podemos retornar vacío
    if (!riesgo.nivel && !riesgo.recomendacion_aseguradora) {
      return '';
    }
  
    return `
      <div class="glass-card p-6 flex items-start space-x-4 text-gray-900 ">
        <!-- Emoji -->
        <div>${emojiWiggle}</div>
        <!-- Texto -->
        <div class="flex-1">
          <h2 class="text-xl font-bold mb-1">
            Análisis de Riesgo
          </h2>
          <p class="mb-2">
            <strong>Nivel:</strong> ${riesgo.nivel ?? '--'}
          </p>
          <p class="font-semibold">Factores de riesgo:</p>
          <ul class="list-disc ml-6 mb-4">
            ${factoresRiesgo}
          </ul>
          <p class="font-semibold">Factores de mitigación:</p>
          <ul class="list-disc ml-6 mb-4">
            ${factoresMitigacion}
          </ul>
          <p>
            <strong>Recomendación aseguradora:</strong> ${riesgo.recomendacion_aseguradora ?? '--'}
          </p>
        </div>
      </div>
    `;
  }
  
  function renderClimateMetrics(clima = {}) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Temperatura -->
        <div class="glass-card p-4 flex flex-col items-center text-gray-900">
          <span class="text-4xl">🌡️</span>
          <h3 class="text-lg font-bold mt-2">Temperatura</h3>
          <p class="text-2xl font-semibold">
            ${clima.temperatura ?? '--'}°C
          </p>
        </div>
        <!-- Humedad -->
        <div class="glass-card p-4 flex flex-col items-center text-gray-900">
          <span class="text-4xl">💧</span>
          <h3 class="text-lg font-bold mt-2">Humedad</h3>
          <p class="text-2xl font-semibold">
            ${clima.humedad ?? '--'}%
          </p>
        </div>
        <!-- Viento -->
        <div class="glass-card p-4 flex flex-col items-center text-gray-900">
          <span class="text-4xl">🍃</span>
          <h3 class="text-lg font-bold mt-2">Viento</h3>
          <p class="text-2xl font-semibold">
            ${clima.viento ?? '--'} km/h
          </p>
        </div>
        <!-- Precipitación -->
        <div class="glass-card p-4 flex flex-col items-center text-gray-900">
          <span class="text-4xl">☔</span>
          <h3 class="text-lg font-bold mt-2">Precipitación</h3>
          <p class="text-2xl font-semibold">
            ${clima.precipitacion ?? '--'} mm
          </p>
        </div>
      </div>
    `;
  }
  
  function renderUbicacion(ubicacion = {}) {
    return `
      <div class="glass-card p-6 text-gray-900">
        <h3 class="text-xl font-bold mb-2">Detalles de la Ubicación</h3>
        <p>
          <strong>Nombre:</strong> ${ubicacion.nombre ?? '--'}
        </p>
        <p>
          <strong>Dirección:</strong> ${ubicacion.direccion ?? '--'}
        </p>
        <p>
          <strong>Coordenadas:</strong> (${ubicacion?.coordenadas?.latitud ?? '--'}, ${ubicacion?.coordenadas?.longitud ?? '--'})
        </p>
      </div>
    `;
  }
  
  function renderBomberos(estaciones = []) {
    if (!Array.isArray(estaciones) || estaciones.length === 0) {
      return `
        <div class="glass-card p-6 text-gray-900">
          <h3 class="text-xl font-bold mb-4">🚒 Estaciones de Bomberos Cercanas</h3>
          <p class="text-gray-700">No se encontraron estaciones de bomberos cercanas.</p>
        </div>
      `;
    }
    return `
      <div class="glass-card p-6 text-gray-900">
        <h3 class="text-xl font-bold mb-4">🚒 Estaciones de Bomberos Cercanas</h3>
        ${estaciones
          .map(
            (est) => `
            <div class="mb-4">
              <p class="font-semibold">${est.nombre}</p>
              <p>${est.direccion}</p>
              <p>Distancia: ${est.distancia}</p>
              <p>Tiempo de respuesta: ${est.tiempo_respuesta}</p>
            </div>
            <hr class="border-gray-300 last:hidden" />
          `
          )
          .join('')}
      </div>
    `;
  }
  
  function renderAcceso(acceso = {}) {
    return `
      <div class="glass-card p-6 text-gray-900">
        <h3 class="text-xl font-bold mb-4">🛣️ Condiciones de Acceso</h3>
        <p><strong>Carretera principal:</strong> ${acceso.carretera_principal ?? '--'}</p>
        <p><strong>Camino de acceso:</strong> ${acceso.camino_acceso ?? '--'}</p>
        <p><strong>Puentes:</strong> ${acceso.puentes ?? '--'}</p>
      </div>
    `;
  }
  
  function renderPronostico(pronostico = {}) {
    return `
      <div class="glass-card p-6 text-gray-900">
        <h3 class="text-xl font-bold mb-4">⛅ Pronóstico</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p>🌡️ <strong>Temp. máx:</strong> ${pronostico.temperatura_max ?? '--'}°C</p>
            <p>❄️ <strong>Temp. mín:</strong> ${pronostico.temperatura_min ?? '--'}°C</p>
          </div>
          <div>
            <p>☔ <strong>Precipitación:</strong> ${pronostico.precipitacion_estimada ?? '--'} mm</p>
            <p>🍃 <strong>Viento máx:</strong> ${pronostico.viento_max ?? '--'} km/h</p>
          </div>
        </div>
      </div>
    `;
  }