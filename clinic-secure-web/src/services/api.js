import { generateClient } from '@aws-amplify/api';

const apiClient = generateClient();

export async function loginUser(username, password) {
    try {
        const response = await apiClient.post({
            apiName: 'tuApiName', // Nombre de la API en Amplify
            path: '/login',
            options: {
                body: { username, password },
            },
        });
        return response;
    } catch (error) {
        console.error("Error en la autenticación:", error);
        return null;
    }
}

export function getApiUrl() {
    return "http://localhost:5000/api";
}
