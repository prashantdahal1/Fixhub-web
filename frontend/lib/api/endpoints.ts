export const API = {
    AUTH: {
        REGISTER: "/api/v1/auth/register",
        LOGIN: "/api/v1/auth/login",
    },
    TICKETS: {
        CREATE: "/api/v1/tickets",
        ADMIN_GET_ALL: "/api/v1/tickets/admin",
        ADMIN_UPDATE_STATUS: (id: string) => `/api/v1/tickets/admin/${id}/status`,
    }
}