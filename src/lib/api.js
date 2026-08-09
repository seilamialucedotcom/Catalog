export class ApiResponseError extends Error {
  constructor(message, { status, statusText, data } = {}) {
    super(message);
    this.name = 'ApiResponseError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

const serverErrorMessage = (response) => {
  if (response.status === 404) {
    return 'La ruta de la API no está disponible. Verifica la configuración del despliegue en Vercel.';
  }

  return `El servidor respondió ${response.status}${response.statusText ? ` (${response.statusText})` : ''} con un formato no válido.`;
};

/**
 * Reads an HTTP response only after confirming it declares JSON. This avoids
 * JSON.parse errors when a proxy or platform responds with an HTML error page.
 */
export async function readJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const body = await response.text();

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new ApiResponseError(
      `${serverErrorMessage(response)} La aplicación esperaba JSON; recibió ${contentType || 'un tipo de contenido desconocido'}.`,
      { status: response.status, statusText: response.statusText },
    );
  }

  let data;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    throw new ApiResponseError(
      `${serverErrorMessage(response)} La respuesta fue marcada como JSON pero no pudo leerse.`,
      { status: response.status, statusText: response.statusText },
    );
  }

  if (!response.ok) {
    throw new ApiResponseError(data?.error || serverErrorMessage(response), {
      status: response.status,
      statusText: response.statusText,
      data,
    });
  }

  return data;
}

export async function fetchJson(input, init) {
  const response = await fetch(input, init);
  return readJsonResponse(response);
}
