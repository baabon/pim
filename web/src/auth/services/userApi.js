const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getUsers = async (fetchWithRefresh) => {
  const response = await fetchWithRefresh(`${API_BASE_URL}/v1/users/`);
  if (!response.ok) {
    throw new Error('Error al obtener los usuarios');
  }
  return response.json();
};

export const updateUser = async (userId, userData, fetchWithRefresh) => {
  const response = await fetchWithRefresh(`${API_BASE_URL}/v1/users/${userId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Error al actualizar el usuario: ${errorData}`);
  }
  return response.json();
};

export const assignFamiliesToUser = async (userId, familyAssignments, fetchWithRefresh) => {
  const payload = familyAssignments.map(a => ({
    area_id: a.area_id,
    family_id: a.family_id,
    subfamily_id: a.subfamily_id,
  }));
  const response = await fetchWithRefresh(`${API_BASE_URL}/v1/users/${userId}/families/assign`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Error al asignar familias: ${errorData}`);
  }
  return response.json();
};

export const getUserDetails = async (userId, fetchWithRefresh) => {
    const response = await fetchWithRefresh(`${API_BASE_URL}/v1/users/${userId}/`);
    if (!response.ok) {
        throw new Error('Error al obtener los detalles del usuario');
    }
    return response.json();
}