export const API = {
    AUTH: {
        REGISTER: "/api/v1/auth/register",
        LOGIN: "/api/v1/auth/login",
    },
    TICKETS: {
        CREATE: "/api/v1/tickets",
        ADMIN_GET_ALL: "/api/v1/tickets/admin",
        ADMIN_UPDATE_STATUS: (id: string) => `/api/v1/tickets/admin/${id}/status`,
        ADMIN_UPDATE: (id: string) => `/api/v1/tickets/admin/${id}`,
        ADMIN_DELETE: (id: string) => `/api/v1/tickets/${id}`,
        ADMIN_BULK_DELETE: "/api/v1/tickets/admin/bulk-delete",
    },
    TICKET_DELETIONS: {
        ADMIN_GET_ALL: "/api/v1/ticket-deletions/admin",
    },
    BOOKINGS: {
        LIST: "/api/v1/bookings",
        CREATE: "/api/v1/bookings",
        GET: (id: string) => `/api/v1/bookings/${id}`,
        STATUS: (id: string) => `/api/v1/bookings/${id}/status`,
    },
    WALLET: {
        GET: "/api/v1/wallet",
        TOPUP: "/api/v1/wallet/topup",
        INITIATE_PAYMENT: "/api/v1/wallet/initiate-payment",
    },
    REVIEWS: {
        CREATE: "/api/v1/reviews",
        BY_SERVICE: (serviceId: string) => `/api/v1/reviews/service/${serviceId}`,
    },
    CHAT: {
        BY_BOOKING: (bookingId: string) => `/api/v1/messages/booking/${bookingId}`,
    },
};
