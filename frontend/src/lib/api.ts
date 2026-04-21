
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  let token = localStorage.getItem('token');
  
  const getHeaders = (t: string | null) => ({
    'Content-Type': 'application/json',
    ...(t ? { 'Authorization': `Bearer ${t}` } : {}),
    ...options.headers,
  });

  let response = await fetch(url, { ...options, headers: getHeaders(token) });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      console.log('La sesión ha expirado. Intentando renovar token...');
      try {
        const refreshResponse = await fetch('http://localhost:3001/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('refresh_token', data.refresh_token);
          
          // Reintentar la petición original con el nuevo token
          console.log('Token renovado exitosamente. Reintentando petición original...');
          return await fetch(url, { ...options, headers: getHeaders(data.token) });
        }
      } catch (err) {
        console.error('Error crítico al intentar renovar el token:', err);
      }
    }

    // Si llegamos aquí es porque no hay refresh_token o el proceso falló
    console.warn('No se pudo renovar la sesión. Cerrando sesión por seguridad.');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Solo redirigir si no estamos ya en el login
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Sesión expirada');
  }

  return response;
};
