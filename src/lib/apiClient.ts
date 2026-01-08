import { supabase } from './supabaseClient';

// URL base de tu API FastAPI desplegada en Render
// Configura EXPO_PUBLIC_API_URL en tu archivo .env para sobrescribir este valor
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://backend-fastapi-6awv.onrender.com';

// Log de la URL configurada (solo en desarrollo)
if (__DEV__) {
  console.log('🔧 API_BASE_URL configurada:', API_BASE_URL);
  console.log('💡 Si usas dispositivo/emulador, asegúrate de usar tu IP local en lugar de localhost');
}

/**
 * Cliente API para consumir endpoints de FastAPI
 * Maneja automáticamente la autenticación JWT
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Obtiene el token JWT del usuario autenticado desde Supabase
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Realiza una petición HTTP con autenticación
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    console.log(`🔐 Obteniendo token de autenticación...`);
    const token = await this.getAuthToken();

    if (!token) {
      console.error('❌ No hay token de autenticación disponible');
      throw new Error('No hay sesión activa. Por favor inicia sesión.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    console.log(`🌐 Realizando petición a: ${url}`);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
    console.log(`🔑 Token presente: ${token ? 'Sí' : 'No'} (${token?.length || 0} caracteres)`);

    try {
      console.log(`🚀 Enviando petición ${options.method || 'GET'} a ${url}`);

      // Agregar timeout de 10 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`📊 Respuesta recibida: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: response.statusText };
        }

        // FastAPI devuelve errores de validación (422) en formato específico
        let errorMessage: string;

        if (response.status === 422 && Array.isArray(errorData.detail)) {
          // Error de validación: mostrar cada campo con su mensaje
          const validationErrors = errorData.detail
            .map((err: any) => {
              const field = err.loc?.slice(1).join('.') || 'campo desconocido';
              return `${field}: ${err.msg}`;
            })
            .join('\n');
          errorMessage = `Error de validación:\n${validationErrors}`;
          console.error(`Error de validación en ${endpoint}:`, errorData.detail);
        } else if (errorData.detail) {
          // Otro tipo de error con detail
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        } else {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }

        console.error(`Error ${response.status} en ${endpoint}:`, errorData);
        throw new Error(errorMessage);
      }

      // Si la respuesta es 204 (No Content) o 200 con contenido vacío, retornar null
      if (response.status === 204) {
        return null as T;
      }

      // Intentar parsear JSON, pero si está vacío, retornar null
      const text = await response.text();
      console.log(`📄 Respuesta texto (primeros 200 chars): ${text.substring(0, 200)}`);

      if (!text || text.trim() === '') {
        console.log(`⚠️ Respuesta vacía para ${endpoint}`);
        return null as T;
      }

      try {
        const parsed = JSON.parse(text) as T;
        console.log(`✅ JSON parseado exitosamente para ${endpoint}:`, Array.isArray(parsed) ? `${parsed.length} items` : '1 item');
        return parsed;
      } catch (parseError) {
        console.error(`❌ Error parseando JSON para ${endpoint}:`, parseError);
        console.error(`📄 Texto recibido:`, text);
        // Si no es JSON válido, retornar null
        return null as T;
      }
    } catch (error) {
      console.error(`❌ Error en petición ${endpoint}:`, error);

      // Manejar timeout
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new Error(
          `Timeout: El servidor no respondió en 10 segundos.\n\n` +
          `Verifica que:\n` +
          `1. El servidor FastAPI esté corriendo en ${this.baseUrl}\n` +
          `2. Si usas dispositivo/emulador, usa tu IP local en lugar de localhost\n` +
          `   Ejemplo: http://192.168.1.100:8000\n` +
          `3. Ambos dispositivos estén en la misma red WiFi`
        );
        throw timeoutError;
      }

      // Manejar errores de red
      if (error instanceof TypeError) {
        const isNetworkError =
          error.message.includes('fetch') ||
          error.message.includes('Failed to fetch') ||
          error.message.includes('Network request failed');

        if (isNetworkError) {
          console.error(`🌐 Error de red: ¿Está corriendo el servidor FastAPI en ${this.baseUrl}?`);
          console.error(`🔍 Verifica que el servidor esté corriendo y accesible desde ${url}`);
          const networkError = new Error(
            `No se pudo conectar al servidor.\n\n` +
            `Verifica que:\n` +
            `1. El servidor FastAPI esté corriendo en ${this.baseUrl}\n` +
            `2. Si usas dispositivo/emulador, usa tu IP local (ej: http://192.168.1.100:8000)\n` +
            `3. Ambos dispositivos estén en la misma red WiFi\n` +
            `4. El firewall no esté bloqueando la conexión`
          );
          throw networkError;
        }
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    console.log(`📥 GET ${endpoint}`);
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    console.log(`🔧 PATCH ${endpoint}`);
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    console.log(`🗑️ DELETE ${endpoint}`);
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

