// Utilidad para manejar el token JWT en localStorage
export const setToken = (token) => {
	localStorage.setItem('jwt_token', token);
};

export const getToken = () => {
	return localStorage.getItem('jwt_token');
};

export const removeToken = () => {
	localStorage.removeItem('jwt_token');
};
