/* eslint-disable */
// Generated from the backend OpenAPI schema. Do not edit by hand.

export interface paths {
    "/api/activity/entity/{entityType}/{entityId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                };
                header?: never;
                path: {
                    entityType: string;
                    entityId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ActivityHistoryPagedResultApiResponse"];
                        "application/json": components["schemas"]["ActivityHistoryPagedResultApiResponse"];
                        "text/json": components["schemas"]["ActivityHistoryPagedResultApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/activity/workspace/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ActivityHistoryPagedResultApiResponse"];
                        "application/json": components["schemas"]["ActivityHistoryPagedResultApiResponse"];
                        "text/json": components["schemas"]["ActivityHistoryPagedResultApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UserLoginDto"];
                    "text/json": components["schemas"]["UserLoginDto"];
                    "application/*+json": components["schemas"]["UserLoginDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UserRegisterDto"];
                    "text/json": components["schemas"]["UserRegisterDto"];
                    "application/*+json": components["schemas"]["UserRegisterDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/updatePassword/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: {
                    currentPassword?: string;
                    newPassword?: string;
                };
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/google": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["GoogleAuthDto"];
                    "text/json": components["schemas"]["GoogleAuthDto"];
                    "application/*+json": components["schemas"]["GoogleAuthDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ForgotPasswordDto"];
                    "text/json": components["schemas"]["ForgotPasswordDto"];
                    "application/*+json": components["schemas"]["ForgotPasswordDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ResetPasswordDto"];
                    "text/json": components["schemas"]["ResetPasswordDto"];
                    "application/*+json": components["schemas"]["ResetPasswordDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/booking/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["PublicBookingRequest"];
                    "text/json": components["schemas"]["PublicBookingRequest"];
                    "application/*+json": components["schemas"]["PublicBookingRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/calendar/workspace/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CalendarEventsDto"];
                        "application/json": components["schemas"]["CalendarEventsDto"];
                        "text/json": components["schemas"]["CalendarEventsDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/calendar/workspace/{workspaceId}/range": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    startDate?: string;
                    endDate?: string;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CalendarEventsDto"];
                        "application/json": components["schemas"]["CalendarEventsDto"];
                        "text/json": components["schemas"]["CalendarEventsDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customer/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomerDetailsResponseDtoApiResponse"];
                        "application/json": components["schemas"]["CustomerDetailsResponseDtoApiResponse"];
                        "text/json": components["schemas"]["CustomerDetailsResponseDtoApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customer/workspace/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomerResponseDtoPagedResultApiResponse"];
                        "application/json": components["schemas"]["CustomerResponseDtoPagedResultApiResponse"];
                        "text/json": components["schemas"]["CustomerResponseDtoPagedResultApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customer/workspace/{workspaceId}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customer/workspace/{workspaceId}/filter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    Q?: string;
                    SortBy?: string;
                    Sort?: string;
                    CustomerType?: string;
                    CreatedDateMin?: string;
                    CreatedDateMax?: string;
                    PropertiesMin?: number;
                    PropertiesMax?: number;
                    HasEmail?: boolean;
                    HasPhone?: boolean;
                    Tags?: string;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomerResponseDtoPagedResultApiResponse"];
                        "application/json": components["schemas"]["CustomerResponseDtoPagedResultApiResponse"];
                        "text/json": components["schemas"]["CustomerResponseDtoPagedResultApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateCustomerDto"];
                    "text/json": components["schemas"]["UpdateCustomerDto"];
                    "application/*+json": components["schemas"]["UpdateCustomerDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomerResponseDtoApiResponse"];
                        "application/json": components["schemas"]["CustomerResponseDtoApiResponse"];
                        "text/json": components["schemas"]["CustomerResponseDtoApiResponse"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateCustomerDto"];
                    "text/json": components["schemas"]["CreateCustomerDto"];
                    "application/*+json": components["schemas"]["CreateCustomerDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomerResponseDtoApiResponse"];
                        "application/json": components["schemas"]["CustomerResponseDtoApiResponse"];
                        "text/json": components["schemas"]["CustomerResponseDtoApiResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customer/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ImportedCustomerDto"][];
                    "text/json": components["schemas"]["ImportedCustomerDto"][];
                    "application/*+json": components["schemas"]["ImportedCustomerDto"][];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomerResponseDtoListApiResponse"];
                        "application/json": components["schemas"]["CustomerResponseDtoListApiResponse"];
                        "text/json": components["schemas"]["CustomerResponseDtoListApiResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customer/export/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customer/{id}/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": string;
                    "text/json": string;
                    "application/*+json": string;
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/customer/{id}/tags/remove": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": string;
                    "text/json": string;
                    "application/*+json": string;
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/customer/{id}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/customer/send-mail": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: {
                    customerId?: string;
                    to?: string;
                    message?: string;
                    subject?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customer-phone/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomerPhoneApiResponse"];
                        "application/json": components["schemas"]["CustomerPhoneApiResponse"];
                        "text/json": components["schemas"]["CustomerPhoneApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customerphone/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomerPhoneApiResponse"];
                        "application/json": components["schemas"]["CustomerPhoneApiResponse"];
                        "text/json": components["schemas"]["CustomerPhoneApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customer-phone": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateCustomerPhoneDto"];
                    "text/json": components["schemas"]["UpdateCustomerPhoneDto"];
                    "application/*+json": components["schemas"]["UpdateCustomerPhoneDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomerPhone"];
                        "application/json": components["schemas"]["CustomerPhone"];
                        "text/json": components["schemas"]["CustomerPhone"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateCustomerPhoneDto"];
                    "text/json": components["schemas"]["CreateCustomerPhoneDto"];
                    "application/*+json": components["schemas"]["CreateCustomerPhoneDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomerPhoneApiResponse"];
                        "application/json": components["schemas"]["CustomerPhoneApiResponse"];
                        "text/json": components["schemas"]["CustomerPhoneApiResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customerphone": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateCustomerPhoneDto"];
                    "text/json": components["schemas"]["UpdateCustomerPhoneDto"];
                    "application/*+json": components["schemas"]["UpdateCustomerPhoneDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomerPhone"];
                        "application/json": components["schemas"]["CustomerPhone"];
                        "text/json": components["schemas"]["CustomerPhone"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateCustomerPhoneDto"];
                    "text/json": components["schemas"]["CreateCustomerPhoneDto"];
                    "application/*+json": components["schemas"]["CreateCustomerPhoneDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomerPhoneApiResponse"];
                        "application/json": components["schemas"]["CustomerPhoneApiResponse"];
                        "text/json": components["schemas"]["CustomerPhoneApiResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customer-phone/bulk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: {
                    customerId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateCustomerPhoneDto"][];
                    "text/json": components["schemas"]["CreateCustomerPhoneDto"][];
                    "application/*+json": components["schemas"]["CreateCustomerPhoneDto"][];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customerphone/bulk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: {
                    customerId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateCustomerPhoneDto"][];
                    "text/json": components["schemas"]["CreateCustomerPhoneDto"][];
                    "application/*+json": components["schemas"]["CreateCustomerPhoneDto"][];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/custom-field/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomFieldApiResponse"];
                        "application/json": components["schemas"]["CustomFieldApiResponse"];
                        "text/json": components["schemas"]["CustomFieldApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customfield/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomFieldApiResponse"];
                        "application/json": components["schemas"]["CustomFieldApiResponse"];
                        "text/json": components["schemas"]["CustomFieldApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/custom-field/workspace/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomFieldListApiResponse"];
                        "application/json": components["schemas"]["CustomFieldListApiResponse"];
                        "text/json": components["schemas"]["CustomFieldListApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customfield/workspace/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomFieldListApiResponse"];
                        "application/json": components["schemas"]["CustomFieldListApiResponse"];
                        "text/json": components["schemas"]["CustomFieldListApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/custom-field": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateCustomFieldDto"];
                    "text/json": components["schemas"]["UpdateCustomFieldDto"];
                    "application/*+json": components["schemas"]["UpdateCustomFieldDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomField"];
                        "application/json": components["schemas"]["CustomField"];
                        "text/json": components["schemas"]["CustomField"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateCustomFieldDto"];
                    "text/json": components["schemas"]["CreateCustomFieldDto"];
                    "application/*+json": components["schemas"]["CreateCustomFieldDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomField"];
                        "application/json": components["schemas"]["CustomField"];
                        "text/json": components["schemas"]["CustomField"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customfield": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateCustomFieldDto"];
                    "text/json": components["schemas"]["UpdateCustomFieldDto"];
                    "application/*+json": components["schemas"]["UpdateCustomFieldDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomField"];
                        "application/json": components["schemas"]["CustomField"];
                        "text/json": components["schemas"]["CustomField"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateCustomFieldDto"];
                    "text/json": components["schemas"]["CreateCustomFieldDto"];
                    "application/*+json": components["schemas"]["CreateCustomFieldDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomField"];
                        "application/json": components["schemas"]["CustomField"];
                        "text/json": components["schemas"]["CustomField"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/custom-field-value/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomFieldValueApiResponse"];
                        "application/json": components["schemas"]["CustomFieldValueApiResponse"];
                        "text/json": components["schemas"]["CustomFieldValueApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customfieldvalue/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CustomFieldValueApiResponse"];
                        "application/json": components["schemas"]["CustomFieldValueApiResponse"];
                        "text/json": components["schemas"]["CustomFieldValueApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/custom-field-value": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateCustomFieldValueDto"];
                    "text/json": components["schemas"]["UpdateCustomFieldValueDto"];
                    "application/*+json": components["schemas"]["UpdateCustomFieldValueDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateCustomFieldValueDto"];
                    "text/json": components["schemas"]["CreateCustomFieldValueDto"];
                    "application/*+json": components["schemas"]["CreateCustomFieldValueDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/customfieldvalue": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateCustomFieldValueDto"];
                    "text/json": components["schemas"]["UpdateCustomFieldValueDto"];
                    "application/*+json": components["schemas"]["UpdateCustomFieldValueDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateCustomFieldValueDto"];
                    "text/json": components["schemas"]["CreateCustomFieldValueDto"];
                    "application/*+json": components["schemas"]["CreateCustomFieldValueDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/employee/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["EmployeeApiResponse"];
                        "application/json": components["schemas"]["EmployeeApiResponse"];
                        "text/json": components["schemas"]["EmployeeApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/employee/workspace/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["EmployeeListApiResponse"];
                        "application/json": components["schemas"]["EmployeeListApiResponse"];
                        "text/json": components["schemas"]["EmployeeListApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/employee/workspace/{workspaceId}/filter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    Q?: string;
                    SortBy?: string;
                    Sort?: string;
                    WorkspaceId?: string;
                    Position?: string;
                    Department?: string;
                    Status?: string;
                    HireDateMin?: string;
                    HireDateMax?: string;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["EmployeeListApiResponse"];
                        "application/json": components["schemas"]["EmployeeListApiResponse"];
                        "text/json": components["schemas"]["EmployeeListApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/employee/workspace/{workspaceId}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["EmployeeStatsDto"];
                        "application/json": components["schemas"]["EmployeeStatsDto"];
                        "text/json": components["schemas"]["EmployeeStatsDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/employee": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateEmployeeDto"];
                    "text/json": components["schemas"]["UpdateEmployeeDto"];
                    "application/*+json": components["schemas"]["UpdateEmployeeDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Employee"];
                        "application/json": components["schemas"]["Employee"];
                        "text/json": components["schemas"]["Employee"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateEmployeeDto"];
                    "text/json": components["schemas"]["CreateEmployeeDto"];
                    "application/*+json": components["schemas"]["CreateEmployeeDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Employee"];
                        "application/json": components["schemas"]["Employee"];
                        "text/json": components["schemas"]["Employee"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/employee/export/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invite/send-invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: {
                    email?: string;
                    role?: components["schemas"]["UserRole"];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invite/send-invite/bulk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["EmployeeInviteRequest"];
                    "text/json": components["schemas"]["EmployeeInviteRequest"];
                    "application/*+json": components["schemas"]["EmployeeInviteRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invite/accept-invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: {
                    token?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UserRegisterDto"];
                    "text/json": components["schemas"]["UserRegisterDto"];
                    "application/*+json": components["schemas"]["UserRegisterDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invite/validate-token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    token?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invite/pending": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invite/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invite/{id}/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/event/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Event"];
                        "application/json": components["schemas"]["Event"];
                        "text/json": components["schemas"]["Event"];
                    };
                };
            };
        };
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateEventDto"];
                    "text/json": components["schemas"]["UpdateEventDto"];
                    "application/*+json": components["schemas"]["UpdateEventDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Event"];
                        "application/json": components["schemas"]["Event"];
                        "text/json": components["schemas"]["Event"];
                    };
                };
            };
        };
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/event/workspace/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Event"][];
                        "application/json": components["schemas"]["Event"][];
                        "text/json": components["schemas"]["Event"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/event": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateEventDto"];
                    "text/json": components["schemas"]["CreateEventDto"];
                    "application/*+json": components["schemas"]["CreateEventDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Event"];
                        "application/json": components["schemas"]["Event"];
                        "text/json": components["schemas"]["Event"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/integrations/accounting": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["AccountingConnectionRequest"];
                    "text/json": components["schemas"]["AccountingConnectionRequest"];
                    "application/*+json": components["schemas"]["AccountingConnectionRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/integrations/accounting/{provider}/authorize": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    provider: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/integrations/accounting/callback/{provider}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    code?: string;
                    state?: string;
                    realmId?: string;
                    error?: string;
                };
                header?: never;
                path: {
                    provider: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/integrations/accounting/{provider}/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    provider: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/integrations/api-keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateApiKeyRequest"];
                    "text/json": components["schemas"]["CreateApiKeyRequest"];
                    "application/*+json": components["schemas"]["CreateApiKeyRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/integrations/api-keys/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/integrations/webhooks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateWebhookRequest"];
                    "text/json": components["schemas"]["CreateWebhookRequest"];
                    "application/*+json": components["schemas"]["CreateWebhookRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventory": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventory/{serviceItemId}/transactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    serviceItemId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventory/{serviceItemId}/adjust": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    serviceItemId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["InventoryAdjustment"];
                    "text/json": components["schemas"]["InventoryAdjustment"];
                    "application/*+json": components["schemas"]["InventoryAdjustment"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invoice/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["InvoiceResponseDto"];
                        "application/json": components["schemas"]["InvoiceResponseDto"];
                        "text/json": components["schemas"]["InvoiceResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invoice/invoice-number/{invoiceNumber}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    invoiceNumber: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["InvoiceResponseDto"];
                        "application/json": components["schemas"]["InvoiceResponseDto"];
                        "text/json": components["schemas"]["InvoiceResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invoice/workspace/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["InvoiceResponseDtoPagedResultApiResponse"];
                        "application/json": components["schemas"]["InvoiceResponseDtoPagedResultApiResponse"];
                        "text/json": components["schemas"]["InvoiceResponseDtoPagedResultApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invoice/workspace/{workspaceId}/filter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    Q?: string;
                    SortBy?: string;
                    Sort?: string;
                    Status?: string;
                    DueDateMin?: string;
                    DueDateMax?: string;
                    TotalMin?: number;
                    TotalMax?: number;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["InvoiceResponseDtoPagedResultApiResponse"];
                        "application/json": components["schemas"]["InvoiceResponseDtoPagedResultApiResponse"];
                        "text/json": components["schemas"]["InvoiceResponseDtoPagedResultApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invoice/workspace/{workspaceId}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["InvoiceStatsDtoApiResponse"];
                        "application/json": components["schemas"]["InvoiceStatsDtoApiResponse"];
                        "text/json": components["schemas"]["InvoiceStatsDtoApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invoice/customer/{customerId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    customerId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["InvoiceResponseDtoListApiResponse"];
                        "application/json": components["schemas"]["InvoiceResponseDtoListApiResponse"];
                        "text/json": components["schemas"]["InvoiceResponseDtoListApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invoice": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateInvoiceDto"];
                    "text/json": components["schemas"]["UpdateInvoiceDto"];
                    "application/*+json": components["schemas"]["UpdateInvoiceDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["InvoiceResponseDto"];
                        "application/json": components["schemas"]["InvoiceResponseDto"];
                        "text/json": components["schemas"]["InvoiceResponseDto"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateInvoiceDto"];
                    "text/json": components["schemas"]["CreateInvoiceDto"];
                    "application/*+json": components["schemas"]["CreateInvoiceDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["InvoiceResponseDto"];
                        "application/json": components["schemas"]["InvoiceResponseDto"];
                        "text/json": components["schemas"]["InvoiceResponseDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invoice/{id}/send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["SendInvoiceDto"];
                    "text/json": components["schemas"]["SendInvoiceDto"];
                    "application/*+json": components["schemas"]["SendInvoiceDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["InvoiceResponseDtoApiResponse"];
                        "application/json": components["schemas"]["InvoiceResponseDtoApiResponse"];
                        "text/json": components["schemas"]["InvoiceResponseDtoApiResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invoice/{id}/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["RecordInvoicePaymentDto"];
                    "text/json": components["schemas"]["RecordInvoicePaymentDto"];
                    "application/*+json": components["schemas"]["RecordInvoicePaymentDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["InvoiceResponseDto"];
                        "application/json": components["schemas"]["InvoiceResponseDto"];
                        "text/json": components["schemas"]["InvoiceResponseDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invoice/{id}/pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/{jobId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    jobId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["JobResponseDtoApiResponse"];
                        "application/json": components["schemas"]["JobResponseDtoApiResponse"];
                        "text/json": components["schemas"]["JobResponseDtoApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/customer/{customerId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    customerId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["JobResponseDtoListApiResponse"];
                        "application/json": components["schemas"]["JobResponseDtoListApiResponse"];
                        "text/json": components["schemas"]["JobResponseDtoListApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/employee/{employeeId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    employeeId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["JobResponseDtoListApiResponse"];
                        "application/json": components["schemas"]["JobResponseDtoListApiResponse"];
                        "text/json": components["schemas"]["JobResponseDtoListApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/workspace/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["JobResponseDtoPagedResultApiResponse"];
                        "application/json": components["schemas"]["JobResponseDtoPagedResultApiResponse"];
                        "text/json": components["schemas"]["JobResponseDtoPagedResultApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/workspace/{workspaceId}/filter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    Q?: string;
                    SortBy?: string;
                    Sort?: string;
                    ScheduleDateMin?: string;
                    ScheduleDateMax?: string;
                    TotalMin?: number;
                    TotalMax?: number;
                    Priority?: string;
                    Status?: string;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["JobResponseDtoPagedResultApiResponse"];
                        "application/json": components["schemas"]["JobResponseDtoPagedResultApiResponse"];
                        "text/json": components["schemas"]["JobResponseDtoPagedResultApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/workspace/{workspaceId}/profitability": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["JobProfitabilityDtoApiResponse"];
                        "application/json": components["schemas"]["JobProfitabilityDtoApiResponse"];
                        "text/json": components["schemas"]["JobProfitabilityDtoApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/job-number/{jobNumber}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    jobNumber: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["JobResponseDto"];
                        "application/json": components["schemas"]["JobResponseDto"];
                        "text/json": components["schemas"]["JobResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateJobDto"];
                    "text/json": components["schemas"]["UpdateJobDto"];
                    "application/*+json": components["schemas"]["UpdateJobDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["JobResponseDtoApiResponse"];
                        "application/json": components["schemas"]["JobResponseDtoApiResponse"];
                        "text/json": components["schemas"]["JobResponseDtoApiResponse"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateJobDto"];
                    "text/json": components["schemas"]["CreateJobDto"];
                    "application/*+json": components["schemas"]["CreateJobDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["JobResponseDtoApiResponse"];
                        "application/json": components["schemas"]["JobResponseDtoApiResponse"];
                        "text/json": components["schemas"]["JobResponseDtoApiResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/{jobId}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    jobId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["JobStatus"];
                    "text/json": components["schemas"]["JobStatus"];
                    "application/*+json": components["schemas"]["JobStatus"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["JobResponseDtoApiResponse"];
                        "application/json": components["schemas"]["JobResponseDtoApiResponse"];
                        "text/json": components["schemas"]["JobResponseDtoApiResponse"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/api/job/{jobId}/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: {
                    replace?: boolean;
                };
                header?: never;
                path: {
                    jobId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": string[];
                    "text/json": string[];
                    "application/*+json": string[];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/job/{jobId}/deposit-payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    jobId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["RecordJobDepositPaymentDto"];
                    "text/json": components["schemas"]["RecordJobDepositPaymentDto"];
                    "application/*+json": components["schemas"]["RecordJobDepositPaymentDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["JobResponseDtoApiResponse"];
                        "application/json": components["schemas"]["JobResponseDtoApiResponse"];
                        "text/json": components["schemas"]["JobResponseDtoApiResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/workspace/{workspaceId}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["JobStatsDtoApiResponse"];
                        "application/json": components["schemas"]["JobStatsDtoApiResponse"];
                        "text/json": components["schemas"]["JobStatsDtoApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/{jobId}/completion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    jobId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CompleteJobDto"];
                    "text/json": components["schemas"]["CompleteJobDto"];
                    "application/*+json": components["schemas"]["CompleteJobDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/lead/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["LeadResponseDtoApiResponse"];
                        "application/json": components["schemas"]["LeadResponseDtoApiResponse"];
                        "text/json": components["schemas"]["LeadResponseDtoApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/lead/workspace/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["LeadResponseDtoListApiResponse"];
                        "application/json": components["schemas"]["LeadResponseDtoListApiResponse"];
                        "text/json": components["schemas"]["LeadResponseDtoListApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/lead/customer/{customerId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    customerId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["LeadResponseDtoListApiResponse"];
                        "application/json": components["schemas"]["LeadResponseDtoListApiResponse"];
                        "text/json": components["schemas"]["LeadResponseDtoListApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/lead": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateLeadDto"];
                    "text/json": components["schemas"]["UpdateLeadDto"];
                    "application/*+json": components["schemas"]["UpdateLeadDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["LeadResponseDtoApiResponse"];
                        "application/json": components["schemas"]["LeadResponseDtoApiResponse"];
                        "text/json": components["schemas"]["LeadResponseDtoApiResponse"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateLeadDto"];
                    "text/json": components["schemas"]["CreateLeadDto"];
                    "application/*+json": components["schemas"]["CreateLeadDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["LeadResponseDtoApiResponse"];
                        "application/json": components["schemas"]["LeadResponseDtoApiResponse"];
                        "text/json": components["schemas"]["LeadResponseDtoApiResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/segments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/campaigns": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/campaigns/send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateCampaignRequest"];
                    "text/json": components["schemas"]["CreateCampaignRequest"];
                    "application/*+json": components["schemas"]["CreateCampaignRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/campaigns/{campaignId}/track/{recipientId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    type?: string;
                };
                header?: never;
                path: {
                    campaignId: string;
                    recipientId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/note/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["NoteApiResponse"];
                        "application/json": components["schemas"]["NoteApiResponse"];
                        "text/json": components["schemas"]["NoteApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notes/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["NoteApiResponse"];
                        "application/json": components["schemas"]["NoteApiResponse"];
                        "text/json": components["schemas"]["NoteApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/note/{customerId}/customer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    customerId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["NoteListApiResponse"];
                        "application/json": components["schemas"]["NoteListApiResponse"];
                        "text/json": components["schemas"]["NoteListApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notes/{customerId}/customer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    customerId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["NoteListApiResponse"];
                        "application/json": components["schemas"]["NoteListApiResponse"];
                        "text/json": components["schemas"]["NoteListApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/note": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateNoteDto"];
                    "text/json": components["schemas"]["UpdateNoteDto"];
                    "application/*+json": components["schemas"]["UpdateNoteDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Note"];
                        "application/json": components["schemas"]["Note"];
                        "text/json": components["schemas"]["Note"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateNoteDto"];
                    "text/json": components["schemas"]["CreateNoteDto"];
                    "application/*+json": components["schemas"]["CreateNoteDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Note"];
                        "application/json": components["schemas"]["Note"];
                        "text/json": components["schemas"]["Note"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateNoteDto"];
                    "text/json": components["schemas"]["UpdateNoteDto"];
                    "application/*+json": components["schemas"]["UpdateNoteDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Note"];
                        "application/json": components["schemas"]["Note"];
                        "text/json": components["schemas"]["Note"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateNoteDto"];
                    "text/json": components["schemas"]["CreateNoteDto"];
                    "application/*+json": components["schemas"]["CreateNoteDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Note"];
                        "application/json": components["schemas"]["Note"];
                        "text/json": components["schemas"]["Note"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/portal/{token}/payment-intent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    token: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/portal/quote/{quoteId}/link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    quoteId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/portal/invoice/{invoiceId}/link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    invoiceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/portal/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    token: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/portal/{token}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    token: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/property/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PropertyApiResponse"];
                        "application/json": components["schemas"]["PropertyApiResponse"];
                        "text/json": components["schemas"]["PropertyApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/property": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdatePropertyDto"];
                    "text/json": components["schemas"]["UpdatePropertyDto"];
                    "application/*+json": components["schemas"]["UpdatePropertyDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PropertyApiResponse"];
                        "application/json": components["schemas"]["PropertyApiResponse"];
                        "text/json": components["schemas"]["PropertyApiResponse"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreatePropertyDto"];
                    "text/json": components["schemas"]["CreatePropertyDto"];
                    "application/*+json": components["schemas"]["CreatePropertyDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PropertyApiResponse"];
                        "application/json": components["schemas"]["PropertyApiResponse"];
                        "text/json": components["schemas"]["PropertyApiResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/public/v1/customers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/public/v1/invoices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/public/v1/webhooks/subscribe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["PublicWebhookRequest"];
                    "text/json": components["schemas"]["PublicWebhookRequest"];
                    "application/*+json": components["schemas"]["PublicWebhookRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/public/v1/webhooks/subscribe/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/quote/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["QuoteResponseDto"];
                        "application/json": components["schemas"]["QuoteResponseDto"];
                        "text/json": components["schemas"]["QuoteResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["QuoteStatus"];
                    "text/json": components["schemas"]["QuoteStatus"];
                    "application/*+json": components["schemas"]["QuoteStatus"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["QuoteResponseDto"];
                        "application/json": components["schemas"]["QuoteResponseDto"];
                        "text/json": components["schemas"]["QuoteResponseDto"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/api/quote/workspace/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["QuoteResponseDtoPagedResultApiResponse"];
                        "application/json": components["schemas"]["QuoteResponseDtoPagedResultApiResponse"];
                        "text/json": components["schemas"]["QuoteResponseDtoPagedResultApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/quote/customer/{customerId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    customerId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["QuoteResponseDtoListApiResponse"];
                        "application/json": components["schemas"]["QuoteResponseDtoListApiResponse"];
                        "text/json": components["schemas"]["QuoteResponseDtoListApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/quote/workspace/{workspaceId}/filter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    Q?: string;
                    SortBy?: string;
                    Sort?: string;
                    Status?: string;
                    CreatedDateMin?: string;
                    CreatedDateMax?: string;
                    TotalMin?: number;
                    TotalMax?: number;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["QuoteResponseDtoPagedResultApiResponse"];
                        "application/json": components["schemas"]["QuoteResponseDtoPagedResultApiResponse"];
                        "text/json": components["schemas"]["QuoteResponseDtoPagedResultApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/quote/workspace/{workspaceId}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["QuoteStatsDtoApiResponse"];
                        "application/json": components["schemas"]["QuoteStatsDtoApiResponse"];
                        "text/json": components["schemas"]["QuoteStatsDtoApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/quote": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateQuoteDto"];
                    "text/json": components["schemas"]["UpdateQuoteDto"];
                    "application/*+json": components["schemas"]["UpdateQuoteDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["QuoteResponseDto"];
                        "application/json": components["schemas"]["QuoteResponseDto"];
                        "text/json": components["schemas"]["QuoteResponseDto"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateQuoteDto"];
                    "text/json": components["schemas"]["CreateQuoteDto"];
                    "application/*+json": components["schemas"]["CreateQuoteDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["QuoteResponseDto"];
                        "application/json": components["schemas"]["QuoteResponseDto"];
                        "text/json": components["schemas"]["QuoteResponseDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/quote/{quoteId}/customer-note": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    quoteId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateNoteDto"];
                    "text/json": components["schemas"]["CreateNoteDto"];
                    "application/*+json": components["schemas"]["CreateNoteDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/quote/{quoteId}/internal-note": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    quoteId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateNoteDto"];
                    "text/json": components["schemas"]["CreateNoteDto"];
                    "application/*+json": components["schemas"]["CreateNoteDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/quote/{quoteId}/attachment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    quoteId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["QuoteAttachmentDto"];
                    "text/json": components["schemas"]["QuoteAttachmentDto"];
                    "application/*+json": components["schemas"]["QuoteAttachmentDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/quote/{id}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/quote/{id}/send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["SendQuoteDto"];
                    "text/json": components["schemas"]["SendQuoteDto"];
                    "application/*+json": components["schemas"]["SendQuoteDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["QuoteResponseDtoApiResponse"];
                        "application/json": components["schemas"]["QuoteResponseDtoApiResponse"];
                        "text/json": components["schemas"]["QuoteResponseDtoApiResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/quote/{id}/pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/review/job/{jobId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    jobId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/review/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    token: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    token: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ReviewSubmission"];
                    "text/json": components["schemas"]["ReviewSubmission"];
                    "application/*+json": components["schemas"]["ReviewSubmission"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/service-item/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ServiceItem"];
                        "application/json": components["schemas"]["ServiceItem"];
                        "text/json": components["schemas"]["ServiceItem"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/service-item/workspace/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ServiceItemPagedResultApiResponse"];
                        "application/json": components["schemas"]["ServiceItemPagedResultApiResponse"];
                        "text/json": components["schemas"]["ServiceItemPagedResultApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/service-item/workspace/{workspaceId}/filter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    Q?: string;
                    SortBy?: string;
                    Sort?: string;
                    Category?: string;
                    Type?: string;
                    PriceMin?: number;
                    PriceMax?: number;
                    IsActive?: string;
                    HasImage?: string;
                    Description?: string;
                };
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ServiceItemPagedResultApiResponse"];
                        "application/json": components["schemas"]["ServiceItemPagedResultApiResponse"];
                        "text/json": components["schemas"]["ServiceItemPagedResultApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/service-item/workspace/{workspaceId}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/service-item": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateServiceItemDto"];
                    "text/json": components["schemas"]["UpdateServiceItemDto"];
                    "application/*+json": components["schemas"]["UpdateServiceItemDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ServiceItemApiResponse"];
                        "application/json": components["schemas"]["ServiceItemApiResponse"];
                        "text/json": components["schemas"]["ServiceItemApiResponse"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateServiceItemDto"];
                    "text/json": components["schemas"]["CreateServiceItemDto"];
                    "application/*+json": components["schemas"]["CreateServiceItemDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ServiceItem"];
                        "application/json": components["schemas"]["ServiceItem"];
                        "text/json": components["schemas"]["ServiceItem"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/service-item/import/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ImportedServiceItemDto"][];
                    "text/json": components["schemas"]["ImportedServiceItemDto"][];
                    "application/*+json": components["schemas"]["ImportedServiceItemDto"][];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ObjectApiResponse"];
                        "application/json": components["schemas"]["ObjectApiResponse"];
                        "text/json": components["schemas"]["ObjectApiResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/service-item/export/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/payments/stripe/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/subscription": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/subscription/plan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ChangePlanRequest"];
                    "text/json": components["schemas"]["ChangePlanRequest"];
                    "application/*+json": components["schemas"]["ChangePlanRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/{jobId}/time-entries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    jobId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    jobId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateTimeEntryDto"];
                    "text/json": components["schemas"]["CreateTimeEntryDto"];
                    "application/*+json": components["schemas"]["CreateTimeEntryDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/job/{jobId}/time-entries/{entryId}/clock-out": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    jobId: string;
                    entryId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": string;
                    "text/json": string;
                    "application/*+json": string;
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/upload": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "multipart/form-data": {
                        category?: string;
                        /** Format: binary */
                        file?: string;
                    };
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/upload/signed-url": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    path?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GetUserDtoApiResponse"];
                        "application/json": components["schemas"]["GetUserDtoApiResponse"];
                        "text/json": components["schemas"]["GetUserDtoApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GetUserDtoApiResponse"];
                        "application/json": components["schemas"]["GetUserDtoApiResponse"];
                        "text/json": components["schemas"]["GetUserDtoApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user/{email}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    email: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GetUserDtoApiResponse"];
                        "application/json": components["schemas"]["GetUserDtoApiResponse"];
                        "text/json": components["schemas"]["GetUserDtoApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateUserDto"];
                    "text/json": components["schemas"]["UpdateUserDto"];
                    "application/*+json": components["schemas"]["UpdateUserDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GetUserDtoApiResponse"];
                        "application/json": components["schemas"]["GetUserDtoApiResponse"];
                        "text/json": components["schemas"]["GetUserDtoApiResponse"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user/confirm-email-change": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: {
                    token?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspace/memberships": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspace/switch/{workspaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workspaceId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspace/{id}/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspace/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GetWorkspaceDtoApiResponse"];
                        "application/json": components["schemas"]["GetWorkspaceDtoApiResponse"];
                        "text/json": components["schemas"]["GetWorkspaceDtoApiResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspace": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["UpdateWorkspaceDto"];
                    "text/json": components["schemas"]["UpdateWorkspaceDto"];
                    "application/*+json": components["schemas"]["UpdateWorkspaceDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GetWorkspaceDto"];
                        "application/json": components["schemas"]["GetWorkspaceDto"];
                        "text/json": components["schemas"]["GetWorkspaceDto"];
                    };
                };
            };
        };
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["CreateWorkspaceDto"];
                    "text/json": components["schemas"]["CreateWorkspaceDto"];
                    "application/*+json": components["schemas"]["CreateWorkspaceDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GetWorkspaceDto"];
                        "application/json": components["schemas"]["GetWorkspaceDto"];
                        "text/json": components["schemas"]["GetWorkspaceDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AccountingConnectionRequest: {
            provider?: string | null;
        };
        ActivityHistory: {
            /** Format: uuid */
            id?: string;
            type?: string | null;
            action?: string | null;
            entityType?: string | null;
            /** Format: uuid */
            entityId?: string;
            /** Format: uuid */
            workspaceId?: string | null;
            /** Format: date-time */
            changedAt?: string;
            /** Format: uuid */
            changedBy?: string;
            changedByName?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        ActivityHistoryPagedResult: {
            items?: components["schemas"]["ActivityHistory"][] | null;
            /** Format: int32 */
            totalCount?: number;
            /** Format: int32 */
            pageNumber?: number;
            /** Format: int32 */
            pageSize?: number;
        };
        ActivityHistoryPagedResultApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["ActivityHistoryPagedResult"];
        };
        ActivityHistoryResponseDto: {
            /** Format: uuid */
            id?: string;
            type?: string | null;
            action?: string | null;
            entityType?: string | null;
            /** Format: uuid */
            entityId?: string;
            /** Format: uuid */
            workspaceId?: string | null;
            /** Format: date-time */
            changedAt?: string;
            /** Format: uuid */
            changedBy?: string;
            changedByName?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        CalendarEventsDto: {
            events?: components["schemas"]["Event"][] | null;
            jobs?: components["schemas"]["Job"][] | null;
            leads?: components["schemas"]["Lead"][] | null;
        };
        ChangePlanRequest: {
            plan?: string | null;
            /** Format: int32 */
            seatCount?: number;
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        CompanySize: 0 | 1 | 2 | 3;
        CompleteJobDto: {
            completionNote?: string | null;
            customerSignaturePath?: string | null;
            completionPhotoPaths?: string[] | null;
        };
        CreateActivityHistoryDto: {
            type?: string | null;
            action?: string | null;
            /** Format: uuid */
            changedBy?: string;
            changedByName?: string | null;
        };
        CreateApiKeyRequest: {
            name?: string | null;
            scopes?: string | null;
        };
        CreateCampaignRequest: {
            name?: string | null;
            subject?: string | null;
            body?: string | null;
            segment?: string | null;
        };
        CreateCustomFieldDto: {
            /** Format: uuid */
            workspaceId?: string;
            fieldName?: string | null;
            fieldType?: components["schemas"]["CustomFieldType"];
            defaultValue?: string | null;
            dropdownOptions?: string[] | null;
            isRequired?: boolean;
        };
        CreateCustomFieldValueDto: {
            /** Format: uuid */
            customerId?: string;
            /** Format: uuid */
            customFieldId?: string;
            value?: string | null;
        };
        CreateCustomerDto: {
            /** Format: uuid */
            workspaceId?: string;
            firstName: string;
            lastName: string;
            companyName?: string | null;
            displayName?: string | null;
            emails?: string[] | null;
            isReceiveJobNotifications?: boolean;
            isReceiveQuoteNotifications?: boolean;
            isReceiveInvoiceNotifications?: boolean;
            billingStreet?: string | null;
            billingCity?: string | null;
            billingState?: string | null;
            billingCountry?: string | null;
            billingPostalCode?: string | null;
            customFieldValues?: components["schemas"]["CreateCustomFieldValueDto"][] | null;
            properties?: components["schemas"]["CreatePropertyDto"][] | null;
            customerPhones?: components["schemas"]["CreateCustomerPhoneDto"][] | null;
        };
        CreateCustomerPhoneDto: {
            phoneType?: components["schemas"]["PhoneType"];
            phoneNumber?: string | null;
            isReceiveMessage?: boolean;
            /** Format: uuid */
            customerId?: string;
        };
        CreateEmployeeDto: {
            /** Format: uuid */
            userId?: string;
            /** Format: uuid */
            workspaceId?: string;
            position?: string | null;
            department?: string | null;
            status?: components["schemas"]["EmployeeStatus"];
            /** Format: date-time */
            hireDate?: string;
            phoneNumber?: string | null;
            imageUrl?: string | null;
            location?: string | null;
            isAvailable?: boolean;
            /** Format: double */
            hourlyCostRate?: number;
            /** Format: double */
            billableRate?: number;
            skills?: string[] | null;
            certifications?: string[] | null;
            workingDays?: components["schemas"]["DayOfWeek"][] | null;
            /** Format: date-span */
            workdayStart?: string | null;
            /** Format: date-span */
            workdayEnd?: string | null;
        };
        CreateEventDto: {
            /** Format: uuid */
            workspaceId: string;
            title: string;
            description?: string | null;
            category?: string | null;
            location?: string | null;
            /** Format: uuid */
            customerId?: string | null;
            assignedToIds?: string[] | null;
            /** Format: date-time */
            startDateTime: string;
            /** Format: date-time */
            endDateTime: string;
            isAllDay?: boolean;
            isRecurring?: boolean;
            /** Format: uuid */
            recurrenceRuleId?: string | null;
            recurrenceRule?: components["schemas"]["CreateRecurrenceRuleDto"];
            /** Format: uuid */
            createdBy: string;
        };
        CreateInvoiceDto: {
            /** Format: uuid */
            customerId?: string;
            /** Format: uuid */
            workspaceId?: string;
            /** Format: uuid */
            propertyId?: string;
            /** Format: uuid */
            jobId?: string | null;
            title?: string | null;
            lineItems?: components["schemas"]["CreateLineItemDto"][] | null;
            /** Format: double */
            taxRate?: number;
            /** Format: double */
            discount?: number;
            discountType?: components["schemas"]["DiscountType"];
            /** Format: date-time */
            issueDate?: string;
            /** Format: date-time */
            dueDate?: string | null;
            paymentTerms?: string | null;
            notes?: string | null;
            internalNotes?: string | null;
        };
        CreateJobDto: {
            /** Format: uuid */
            workspaceId?: string;
            title?: string | null;
            description?: string | null;
            /** Format: uuid */
            customerId?: string;
            /** Format: uuid */
            propertyId?: string | null;
            /** Format: uuid */
            quoteId?: string | null;
            /** Format: uuid */
            leadId?: string | null;
            jobType?: components["schemas"]["JobType"];
            lineItems?: components["schemas"]["CreateLineItemDto"][] | null;
            status?: components["schemas"]["JobStatus"];
            priority?: components["schemas"]["JobPriority"];
            /** Format: date-time */
            startDateTime?: string;
            /** Format: date-time */
            endDateTime?: string;
            /** Format: uuid */
            recurrenceRuleId?: string | null;
            recurrenceRule?: components["schemas"]["CreateRecurrenceRuleDto"];
            /** Format: int32 */
            arrivalWindow?: number | null;
            /** Format: int32 */
            estimatedDurationMinutes?: number;
            assignedTeamMemberIds?: string[] | null;
            paymentStatus?: components["schemas"]["PaymentStatus"];
            /** Format: double */
            depositAmount?: number;
            discountType?: components["schemas"]["DiscountType"];
            /** Format: double */
            discountValue?: number;
            /** Format: double */
            taxRate?: number;
            sendInvoice?: boolean;
            sendReminder?: boolean;
            /** Format: int32 */
            reminderDaysBefore?: number;
            confirmationSent?: boolean;
            reminderSent?: boolean;
            invoiceSent?: boolean;
            createdBy?: string | null;
            source?: string | null;
            tags?: string[] | null;
            customerNotes?: string | null;
            internalNotes?: string | null;
        };
        CreateLeadDto: {
            /** Format: uuid */
            customerId?: string | null;
            /** Format: uuid */
            quoteId?: string | null;
            /** Format: uuid */
            workspaceId?: string;
            firstName?: string | null;
            lastName?: string | null;
            email?: string | null;
            phoneNumber?: string | null;
            source?: string | null;
            description?: string | null;
            /** Format: date-time */
            startDateTime?: string | null;
            /** Format: date-time */
            endDateTime?: string | null;
            priority?: components["schemas"]["LeadPriority"];
            lineItems?: components["schemas"]["CreateLineItemDto"][] | null;
            notes?: string | null;
        };
        CreateLineItemDto: {
            /** Format: uuid */
            serviceItemId?: string | null;
            name?: string | null;
            description?: string | null;
            /** Format: double */
            unitPrice?: number;
            /** Format: double */
            cost?: number | null;
            /** Format: double */
            quantity?: number;
            isTaxable?: boolean | null;
            isOptional?: boolean;
            /** Format: uuid */
            jobId?: string | null;
            /** Format: uuid */
            invoiceId?: string | null;
            /** Format: uuid */
            quoteId?: string | null;
            /** Format: uuid */
            requestId?: string | null;
        };
        CreateNoteDto: {
            /** Format: uuid */
            customerId?: string | null;
            createdBy?: string | null;
            createdByName?: string | null;
            noteText?: string | null;
            pathFile?: string | null;
        };
        CreatePropertyDto: {
            street?: string | null;
            city?: string | null;
            state?: string | null;
            country?: string | null;
            postalCode?: string | null;
            /** Format: double */
            latitude?: number | null;
            /** Format: double */
            longitude?: number | null;
            isBillingAddress?: boolean | null;
            /** Format: uuid */
            customerId?: string;
        };
        CreateQuoteDto: {
            /** Format: uuid */
            workspaceId?: string;
            /** Format: uuid */
            customerId?: string;
            /** Format: uuid */
            createdByUserId?: string;
            /** Format: uuid */
            assignedToUserId?: string | null;
            status?: components["schemas"]["QuoteStatus"];
            title?: string | null;
            /** Format: uuid */
            propertyId?: string;
            lineItems?: components["schemas"]["CreateLineItemDto"][] | null;
            discountType?: components["schemas"]["DiscountType"];
            /** Format: double */
            discountValue?: number;
            /** Format: double */
            taxRate?: number;
            paymentTerms?: string | null;
            /** Format: double */
            depositAmount?: number | null;
            customerNotes?: components["schemas"]["CreateNoteDto"][] | null;
            internalNotes?: components["schemas"]["CreateNoteDto"][] | null;
            activityHistory?: components["schemas"]["CreateActivityHistoryDto"][] | null;
            source?: string | null;
        };
        CreateRecurrenceRuleDto: {
            frequency: components["schemas"]["RecurrenceFrequency"];
            /** Format: int32 */
            interval?: number;
            daysOfWeek?: components["schemas"]["DayOfWeek"][] | null;
            /** Format: int32 */
            dayOfMonth?: number | null;
            /** Format: int32 */
            weekOfMonth?: number | null;
            dayOfWeekInMonth?: components["schemas"]["DayOfWeek"];
            /** Format: int32 */
            monthOfYear?: number | null;
            endType: components["schemas"]["RecurrenceEndType"];
            /** Format: int32 */
            occurrenceCount?: number | null;
            /** Format: date-time */
            endDate?: string | null;
        };
        CreateServiceItemDto: {
            /** Format: uuid */
            workspaceId?: string;
            name?: string | null;
            description?: string | null;
            type?: components["schemas"]["ServiceItemType"];
            category?: string | null;
            sku?: string | null;
            unitOfMeasure?: string | null;
            /** Format: double */
            stockLevel?: number;
            /** Format: double */
            reorderPoint?: number;
            /** Format: int32 */
            defaultDurationMinutes?: number | null;
            /** Format: double */
            markupPercentage?: number;
            vendor?: string | null;
            /** Format: double */
            unitPrice?: number;
            /** Format: double */
            cost?: number;
            isTaxable?: boolean;
            isActive?: boolean;
            imageUrl?: string | null;
        };
        CreateTimeEntryDto: {
            type?: components["schemas"]["TimeEntryType"];
            /** Format: date-time */
            clockIn?: string;
            notes?: string | null;
        };
        CreateWebhookRequest: {
            url?: string | null;
            events?: string | null;
        };
        CreateWorkspaceDto: {
            name?: string | null;
            companyName?: string | null;
            companyUrl?: string | null;
            phoneNumber?: string | null;
            currency?: string | null;
            /** Format: double */
            defaultTaxRate?: number;
            defaultPaymentTerms?: string | null;
            taxRegistrationNumber?: string | null;
            addressLine1?: string | null;
            addressLine2?: string | null;
            city?: string | null;
            state?: string | null;
            postalCode?: string | null;
            country?: string | null;
            timeZoneId?: string | null;
            size?: components["schemas"]["CompanySize"];
            /** Format: uuid */
            createdByUserId?: string;
            logoUrl?: string | null;
            theme?: string | null;
            category?: string | null;
        };
        CustomField: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string;
            fieldName: string;
            fieldType: components["schemas"]["CustomFieldType"];
            defaultValue?: string | null;
            dropdownOptions?: string[] | null;
            isRequired?: boolean;
            isArchived?: boolean;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        CustomFieldApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["CustomField"];
        };
        CustomFieldListApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["CustomField"][] | null;
        };
        CustomFieldResponseDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string;
            fieldName?: string | null;
            fieldType?: components["schemas"]["CustomFieldType"];
            defaultValue?: string | null;
            dropdownOptions?: string[] | null;
            isRequired?: boolean;
            isArchived?: boolean;
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        CustomFieldType: 0 | 1 | 2 | 3 | 4;
        CustomFieldValue: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            customerId?: string;
            /** Format: uuid */
            customFieldId?: string;
            customField?: components["schemas"]["CustomField"];
            value?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        CustomFieldValueApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["CustomFieldValue"];
        };
        CustomFieldValueResponseDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            customerId?: string;
            /** Format: uuid */
            customFieldId?: string;
            value?: string | null;
            customField?: components["schemas"]["CustomFieldResponseDto"];
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        Customer: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string;
            firstName: string;
            lastName: string;
            readonly fullName?: string | null;
            companyName?: string | null;
            displayName?: string | null;
            readonly isCompany?: boolean;
            emails?: string[] | null;
            tags?: string[] | null;
            isReceiveJobNotifications?: boolean;
            isReceiveQuoteNotifications?: boolean;
            isReceiveInvoiceNotifications?: boolean;
            billingStreet?: string | null;
            billingCity?: string | null;
            billingState?: string | null;
            billingCountry?: string | null;
            billingPostalCode?: string | null;
            readonly billingAddress?: string | null;
            isArchived?: boolean;
            customFieldValues?: components["schemas"]["CustomFieldValue"][] | null;
            notes?: components["schemas"]["Note"][] | null;
            properties?: components["schemas"]["Property"][] | null;
            customerPhones?: components["schemas"]["CustomerPhone"][] | null;
            /** Format: date-time */
            lastActivity?: string;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
            /** Format: byte */
            rowVersion?: string | null;
        };
        CustomerCountsResponseDto: {
            /** Format: int32 */
            jobs?: number;
            /** Format: int32 */
            leads?: number;
            /** Format: int32 */
            quotes?: number;
            /** Format: int32 */
            invoices?: number;
        };
        CustomerDetailsResponseDto: {
            item?: components["schemas"]["CustomerResponseDto"];
            /** Format: double */
            totalInvoiceValue?: number;
            counts?: components["schemas"]["CustomerCountsResponseDto"];
        };
        CustomerDetailsResponseDtoApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["CustomerDetailsResponseDto"];
        };
        CustomerPhone: {
            /** Format: uuid */
            id?: string;
            phoneType?: components["schemas"]["PhoneType"];
            phoneNumber?: string | null;
            isReceiveMessage?: boolean;
            /** Format: uuid */
            customerId?: string;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        CustomerPhoneApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["CustomerPhone"];
        };
        CustomerPhoneResponseDto: {
            /** Format: uuid */
            id?: string;
            phoneType?: components["schemas"]["PhoneType"];
            phoneNumber?: string | null;
            isReceiveMessage?: boolean;
            /** Format: uuid */
            customerId?: string;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        CustomerResponseDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string;
            firstName?: string | null;
            lastName?: string | null;
            fullName?: string | null;
            companyName?: string | null;
            displayName?: string | null;
            isCompany?: boolean;
            emails?: string[] | null;
            isReceiveJobNotifications?: boolean;
            isReceiveQuoteNotifications?: boolean;
            isReceiveInvoiceNotifications?: boolean;
            billingStreet?: string | null;
            billingCity?: string | null;
            billingState?: string | null;
            billingCountry?: string | null;
            billingPostalCode?: string | null;
            billingAddress?: string | null;
            isArchived?: boolean;
            tags?: string[] | null;
            customFieldValues?: components["schemas"]["CustomFieldValueResponseDto"][] | null;
            notes?: components["schemas"]["NoteResponseDto"][] | null;
            properties?: components["schemas"]["PropertyResponseDto"][] | null;
            customerPhones?: components["schemas"]["CustomerPhoneResponseDto"][] | null;
            /** Format: date-time */
            lastActivity?: string;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        CustomerResponseDtoApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["CustomerResponseDto"];
        };
        CustomerResponseDtoListApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["CustomerResponseDto"][] | null;
        };
        CustomerResponseDtoPagedResult: {
            items?: components["schemas"]["CustomerResponseDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
            /** Format: int32 */
            pageNumber?: number;
            /** Format: int32 */
            pageSize?: number;
        };
        CustomerResponseDtoPagedResultApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["CustomerResponseDtoPagedResult"];
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        DayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
        /**
         * Format: int32
         * @enum {integer}
         */
        DiscountType: 0 | 1;
        Employee: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            userId?: string;
            user?: components["schemas"]["User"];
            /** Format: uuid */
            workspaceId?: string;
            workspace?: components["schemas"]["Workspace"];
            position?: string | null;
            department?: string | null;
            status?: components["schemas"]["EmployeeStatus"];
            /** Format: date-time */
            hireDate?: string;
            phoneNumber?: string | null;
            imageUrl?: string | null;
            location?: string | null;
            isAvailable?: boolean;
            /** Format: double */
            hourlyCostRate?: number;
            /** Format: double */
            billableRate?: number;
            skills?: string[] | null;
            certifications?: string[] | null;
            workingDays?: components["schemas"]["DayOfWeek"][] | null;
            /** Format: date-span */
            workdayStart?: string | null;
            /** Format: date-span */
            workdayEnd?: string | null;
            isArchived?: boolean;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        EmployeeApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["Employee"];
        };
        EmployeeInviteRequest: {
            emails?: string[] | null;
            role?: components["schemas"]["UserRole"];
        };
        EmployeeListApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["Employee"][] | null;
        };
        EmployeeResponseDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            userId?: string;
            user?: components["schemas"]["UserSummaryResponseDto"];
            /** Format: uuid */
            workspaceId?: string;
            position?: string | null;
            department?: string | null;
            status?: components["schemas"]["EmployeeStatus"];
            /** Format: date-time */
            hireDate?: string;
            phoneNumber?: string | null;
            imageUrl?: string | null;
            location?: string | null;
            isAvailable?: boolean;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        EmployeeStatsDto: {
            /** Format: int32 */
            totalEmployees?: number;
            /** Format: int32 */
            activeEmployees?: number;
            /** Format: int32 */
            availableEmployees?: number;
            /** Format: int32 */
            newHiresThisMonth?: number;
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        EmployeeStatus: 0 | 1 | 2;
        Event: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId: string;
            title: string;
            description?: string | null;
            category?: string | null;
            location?: string | null;
            /** Format: uuid */
            customerId?: string | null;
            customer?: components["schemas"]["Customer"];
            assignedTo?: components["schemas"]["Employee"][] | null;
            /** Format: date-time */
            startDateTime: string;
            /** Format: date-time */
            endDateTime: string;
            isAllDay?: boolean;
            isRecurring?: boolean;
            /** Format: uuid */
            recurrenceRuleId?: string | null;
            recurrenceRule?: components["schemas"]["RecurrenceRule"];
            /** Format: uuid */
            createdBy: string;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        ForgotPasswordDto: {
            email?: string | null;
        };
        GetUserDto: {
            /** Format: uuid */
            id?: string;
            email?: string | null;
            firstName?: string | null;
            lastName?: string | null;
            fullName?: string | null;
            role?: components["schemas"]["UserRole"];
            workspace?: components["schemas"]["WorkspaceLookupDto"];
            workspaces?: components["schemas"]["UserWorkspaceDto"][] | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        GetUserDtoApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["GetUserDto"];
        };
        GetWorkspaceDto: {
            /** Format: uuid */
            id?: string;
            name?: string | null;
            companyName?: string | null;
            companyUrl?: string | null;
            phoneNumber?: string | null;
            currency?: string | null;
            /** Format: double */
            defaultTaxRate?: number;
            defaultPaymentTerms?: string | null;
            taxRegistrationNumber?: string | null;
            addressLine1?: string | null;
            addressLine2?: string | null;
            city?: string | null;
            state?: string | null;
            postalCode?: string | null;
            country?: string | null;
            timeZoneId?: string | null;
            size?: components["schemas"]["CompanySize"];
            createdByUser?: components["schemas"]["UserLookupDto"];
            logoUrl?: string | null;
            theme?: string | null;
            category?: string | null;
            dunningEnabled?: boolean;
            dunningDays?: string | null;
            documentPrimaryColor?: string | null;
            documentFooterText?: string | null;
            documentHeaderLayout?: string | null;
            users?: components["schemas"]["UserLookupDto"][] | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        GetWorkspaceDtoApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["GetWorkspaceDto"];
        };
        GoogleAuthDto: {
            idToken?: string | null;
        };
        ImportedCustomerDto: {
            firstName?: string | null;
            lastName?: string | null;
            companyName?: string | null;
            displayName?: string | null;
            emails?: string[] | null;
            isReceiveJobNotifications?: boolean;
            isReceiveQuoteNotifications?: boolean;
            isReceiveInvoiceNotifications?: boolean;
            billingStreet?: string | null;
            billingCity?: string | null;
            billingState?: string | null;
            billingCountry?: string | null;
            billingPostalCode?: string | null;
            tags?: string[] | null;
            properties?: components["schemas"]["Property"][] | null;
            customerPhones?: components["schemas"]["CustomerPhone"][] | null;
        };
        ImportedServiceItemDto: {
            /** Format: uuid */
            workspaceId?: string;
            name?: string | null;
            description?: string | null;
            type?: components["schemas"]["ServiceItemType"];
            category?: string | null;
            sku?: string | null;
            unitOfMeasure?: string | null;
            /** Format: double */
            stockLevel?: number;
            /** Format: double */
            reorderPoint?: number;
            /** Format: int32 */
            defaultDurationMinutes?: number | null;
            /** Format: double */
            markupPercentage?: number;
            vendor?: string | null;
            /** Format: double */
            unitPrice?: number;
            /** Format: double */
            cost?: number;
            isTaxable?: boolean;
            isActive?: boolean;
            imageUrl?: string | null;
        };
        InventoryAdjustment: {
            /** Format: double */
            quantityDelta?: number;
            reason?: string | null;
            /** Format: uuid */
            jobId?: string | null;
        };
        InvoiceResponseDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string;
            /** Format: uuid */
            customerId?: string;
            customer?: components["schemas"]["CustomerResponseDto"];
            invoiceNumber?: string | null;
            /** Format: uuid */
            propertyId?: string;
            property?: components["schemas"]["PropertyResponseDto"];
            /** Format: uuid */
            jobId?: string | null;
            job?: components["schemas"]["JobSummaryResponseDto"];
            title?: string | null;
            lineItems?: components["schemas"]["LineItemResponseDto"][] | null;
            payments?: components["schemas"]["PaymentResponseDto"][] | null;
            /** Format: double */
            taxRate?: number;
            /** Format: double */
            discount?: number;
            discountType?: components["schemas"]["DiscountType"];
            /** Format: double */
            subtotal?: number;
            /** Format: double */
            taxAmount?: number;
            /** Format: double */
            total?: number;
            /** Format: double */
            amountPaid?: number;
            /** Format: double */
            balanceDue?: number;
            status?: components["schemas"]["InvoiceStatus"];
            isPaid?: boolean;
            /** Format: date-time */
            sentAt?: string | null;
            /** Format: date-time */
            issueDate?: string;
            /** Format: date-time */
            dueDate?: string;
            paymentTerms?: string | null;
            notes?: string | null;
            internalNotes?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        InvoiceResponseDtoApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["InvoiceResponseDto"];
        };
        InvoiceResponseDtoListApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["InvoiceResponseDto"][] | null;
        };
        InvoiceResponseDtoPagedResult: {
            items?: components["schemas"]["InvoiceResponseDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
            /** Format: int32 */
            pageNumber?: number;
            /** Format: int32 */
            pageSize?: number;
        };
        InvoiceResponseDtoPagedResultApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["InvoiceResponseDtoPagedResult"];
        };
        InvoiceStatsDto: {
            /** Format: double */
            totalOutstanding?: number;
            /** Format: double */
            totalPaidThisMonth?: number;
            /** Format: int32 */
            overdueCount?: number;
            /** Format: double */
            averageInvoiceValue?: number;
        };
        InvoiceStatsDtoApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["InvoiceStatsDto"];
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        InvoiceStatus: 0 | 1 | 2 | 3 | 4;
        Job: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string;
            title?: string | null;
            description?: string | null;
            /** Format: uuid */
            customerId?: string;
            customer?: components["schemas"]["Customer"];
            /** Format: uuid */
            propertyId?: string | null;
            property?: components["schemas"]["Property"];
            jobType?: components["schemas"]["JobType"];
            lineItems?: components["schemas"]["LineItem"][] | null;
            status?: components["schemas"]["JobStatus"];
            statusHistory?: components["schemas"]["StatusChange"][] | null;
            priority?: components["schemas"]["JobPriority"];
            /** Format: date-time */
            startDateTime?: string;
            /** Format: date-time */
            endDateTime?: string;
            /** Format: uuid */
            recurrenceRuleId?: string | null;
            recurrenceRule?: components["schemas"]["RecurrenceRule"];
            /** Format: int32 */
            arrivalWindow?: number | null;
            /** Format: int32 */
            estimatedDurationMinutes?: number;
            assignedTeamMembers?: components["schemas"]["Employee"][] | null;
            paymentStatus?: components["schemas"]["PaymentStatus"];
            /** Format: double */
            depositAmount?: number;
            payments?: components["schemas"]["Payment"][] | null;
            /** Format: double */
            readonly depositPaid?: number;
            /** Format: double */
            readonly depositBalanceDue?: number;
            readonly isDepositPaid?: boolean;
            discountType?: components["schemas"]["DiscountType"];
            /** Format: double */
            discountValue?: number;
            /** Format: double */
            readonly subtotal?: number;
            /** Format: double */
            readonly discount?: number;
            /** Format: double */
            taxRate?: number;
            /** Format: double */
            readonly taxAmount?: number;
            /** Format: double */
            readonly totalAmount?: number;
            sendInvoice?: boolean;
            sendReminder?: boolean;
            /** Format: int32 */
            reminderDaysBefore?: number;
            confirmationSent?: boolean;
            reminderSent?: boolean;
            invoiceSent?: boolean;
            jobNumber?: string | null;
            /** Format: date-time */
            completedAt?: string | null;
            completionNote?: string | null;
            customerSignaturePath?: string | null;
            completionPhotoPaths?: string[] | null;
            timeEntries?: components["schemas"]["TimeEntry"][] | null;
            createdBy?: string | null;
            source?: string | null;
            isArchived?: boolean;
            tags?: string[] | null;
            customerNotes?: string | null;
            internalNotes?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
            /** Format: byte */
            rowVersion?: string | null;
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        JobPriority: 0 | 1 | 2 | 3;
        JobProfitabilityDto: {
            /** Format: double */
            revenue?: number;
            /** Format: double */
            cost?: number;
            /** Format: double */
            grossProfit?: number;
            /** Format: double */
            marginPercent?: number;
            byJob?: components["schemas"]["ProfitabilityRowDto"][] | null;
            byServiceItem?: components["schemas"]["ProfitabilityRowDto"][] | null;
            byTechnician?: components["schemas"]["ProfitabilityRowDto"][] | null;
        };
        JobProfitabilityDtoApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["JobProfitabilityDto"];
        };
        JobResponseDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string;
            title?: string | null;
            description?: string | null;
            /** Format: uuid */
            customerId?: string;
            customer?: components["schemas"]["CustomerResponseDto"];
            /** Format: uuid */
            propertyId?: string | null;
            property?: components["schemas"]["PropertyResponseDto"];
            jobType?: components["schemas"]["JobType"];
            lineItems?: components["schemas"]["LineItemResponseDto"][] | null;
            status?: components["schemas"]["JobStatus"];
            statusHistory?: components["schemas"]["StatusChangeResponseDto"][] | null;
            priority?: components["schemas"]["JobPriority"];
            /** Format: date-time */
            startDateTime?: string;
            /** Format: date-time */
            endDateTime?: string;
            /** Format: uuid */
            recurrenceRuleId?: string | null;
            recurrenceRule?: components["schemas"]["RecurrenceRuleResponseDto"];
            /** Format: int32 */
            arrivalWindow?: number | null;
            /** Format: int32 */
            estimatedDurationMinutes?: number;
            assignedTeamMembers?: components["schemas"]["EmployeeResponseDto"][] | null;
            paymentStatus?: components["schemas"]["PaymentStatus"];
            /** Format: double */
            depositAmount?: number;
            payments?: components["schemas"]["PaymentResponseDto"][] | null;
            /** Format: double */
            depositPaid?: number;
            /** Format: double */
            depositBalanceDue?: number;
            isDepositPaid?: boolean;
            discountType?: components["schemas"]["DiscountType"];
            /** Format: double */
            discountValue?: number;
            /** Format: double */
            taxRate?: number;
            /** Format: double */
            taxAmount?: number;
            /** Format: double */
            subtotal?: number;
            /** Format: double */
            totalAmount?: number;
            sendInvoice?: boolean;
            sendReminder?: boolean;
            /** Format: int32 */
            reminderDaysBefore?: number;
            confirmationSent?: boolean;
            reminderSent?: boolean;
            invoiceSent?: boolean;
            jobNumber?: string | null;
            /** Format: date-time */
            completedAt?: string | null;
            completionNote?: string | null;
            customerSignaturePath?: string | null;
            completionPhotoPaths?: string[] | null;
            createdBy?: string | null;
            source?: string | null;
            tags?: string[] | null;
            customerNotes?: string | null;
            internalNotes?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        JobResponseDtoApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["JobResponseDto"];
        };
        JobResponseDtoListApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["JobResponseDto"][] | null;
        };
        JobResponseDtoPagedResult: {
            items?: components["schemas"]["JobResponseDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
            /** Format: int32 */
            pageNumber?: number;
            /** Format: int32 */
            pageSize?: number;
        };
        JobResponseDtoPagedResultApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["JobResponseDtoPagedResult"];
        };
        JobStatsDto: {
            /** Format: int32 */
            totalJobs?: number;
            /** Format: int32 */
            completedJobs?: number;
            /** Format: int32 */
            scheduledJobs?: number;
            /** Format: double */
            totalValue?: number;
        };
        JobStatsDtoApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["JobStatsDto"];
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        JobStatus: 0 | 1 | 2 | 3 | 4;
        JobSummaryResponseDto: {
            /** Format: uuid */
            id?: string;
            jobNumber?: string | null;
            title?: string | null;
            status?: components["schemas"]["JobStatus"];
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        JobType: 0 | 1;
        Lead: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            customerId?: string | null;
            customer?: components["schemas"]["Customer"];
            firstName?: string | null;
            lastName?: string | null;
            email?: string | null;
            phoneNumber?: string | null;
            source?: string | null;
            /** Format: uuid */
            quoteId?: string | null;
            quote?: components["schemas"]["Quote"];
            /** Format: uuid */
            convertedToJobId?: string | null;
            convertedToJob?: components["schemas"]["Job"];
            /** Format: uuid */
            workspaceId?: string;
            workspace?: components["schemas"]["Workspace"];
            description: string;
            /** Format: date-time */
            startDateTime?: string | null;
            /** Format: date-time */
            endDateTime?: string | null;
            status?: components["schemas"]["LeadStatus"];
            priority?: components["schemas"]["LeadPriority"];
            lineItems?: components["schemas"]["LineItem"][] | null;
            isArchived?: boolean;
            notes?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        LeadPriority: 0 | 1 | 2 | 3;
        LeadResponseDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            customerId?: string | null;
            customer?: components["schemas"]["CustomerResponseDto"];
            /** Format: uuid */
            quoteId?: string | null;
            /** Format: uuid */
            convertedToJobId?: string | null;
            /** Format: uuid */
            workspaceId?: string;
            firstName?: string | null;
            lastName?: string | null;
            email?: string | null;
            phoneNumber?: string | null;
            source?: string | null;
            description?: string | null;
            /** Format: date-time */
            startDateTime?: string | null;
            /** Format: date-time */
            endDateTime?: string | null;
            status?: components["schemas"]["LeadStatus"];
            priority?: components["schemas"]["LeadPriority"];
            lineItems?: components["schemas"]["LineItemResponseDto"][] | null;
            notes?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        LeadResponseDtoApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["LeadResponseDto"];
        };
        LeadResponseDtoListApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["LeadResponseDto"][] | null;
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        LeadStatus: 0 | 1 | 2 | 3 | 4;
        LineItem: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            serviceItemId?: string | null;
            serviceItem?: components["schemas"]["ServiceItem"];
            name?: string | null;
            description?: string | null;
            /** Format: double */
            unitPrice?: number;
            /** Format: double */
            cost?: number;
            isOptional?: boolean;
            isTaxable?: boolean;
            /** Format: double */
            quantity?: number;
            /** Format: double */
            readonly total?: number;
            /** Format: uuid */
            jobId?: string | null;
            /** Format: uuid */
            invoiceId?: string | null;
            /** Format: uuid */
            quoteId?: string | null;
            /** Format: uuid */
            leadId?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        LineItemResponseDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            serviceItemId?: string | null;
            name?: string | null;
            description?: string | null;
            /** Format: double */
            unitPrice?: number;
            /** Format: double */
            cost?: number;
            isOptional?: boolean;
            isTaxable?: boolean;
            /** Format: double */
            quantity?: number;
            /** Format: double */
            total?: number;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        Note: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string | null;
            createdBy?: string | null;
            createdByName?: string | null;
            noteText?: string | null;
            pathFile?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        NoteApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["Note"];
        };
        NoteListApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["Note"][] | null;
        };
        NoteResponseDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string | null;
            createdBy?: string | null;
            createdByName?: string | null;
            noteText?: string | null;
            pathFile?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        ObjectApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: unknown;
        };
        Payment: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            invoiceId?: string | null;
            /** Format: uuid */
            jobId?: string | null;
            /** Format: double */
            amount?: number;
            method?: components["schemas"]["PaymentMethod"];
            status?: components["schemas"]["PaymentRecordStatus"];
            processorReference?: string | null;
            /** Format: date-time */
            paidAt?: string | null;
            /** Format: uuid */
            recordedByUserId?: string | null;
            note?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        PaymentMethod: 0 | 1 | 2 | 3 | 4 | 5;
        /**
         * Format: int32
         * @enum {integer}
         */
        PaymentRecordStatus: 0 | 1 | 2 | 3 | 4;
        PaymentResponseDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            invoiceId?: string | null;
            /** Format: uuid */
            jobId?: string | null;
            /** Format: double */
            amount?: number;
            method?: components["schemas"]["PaymentMethod"];
            status?: components["schemas"]["PaymentRecordStatus"];
            processorReference?: string | null;
            /** Format: date-time */
            paidAt?: string | null;
            /** Format: uuid */
            recordedByUserId?: string | null;
            note?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        PaymentStatus: 0 | 1 | 2 | 3;
        /**
         * Format: int32
         * @enum {integer}
         */
        PhoneType: 0 | 1 | 2 | 3;
        ProfitabilityRowDto: {
            id?: string | null;
            name?: string | null;
            /** Format: double */
            revenue?: number;
            /** Format: double */
            cost?: number;
            /** Format: double */
            grossProfit?: number;
            /** Format: double */
            marginPercent?: number;
        };
        Property: {
            /** Format: uuid */
            id?: string;
            street?: string | null;
            city?: string | null;
            state?: string | null;
            country?: string | null;
            postalCode?: string | null;
            /** Format: double */
            latitude?: number | null;
            /** Format: double */
            longitude?: number | null;
            readonly address?: string | null;
            isBillingAddress?: boolean;
            /** Format: uuid */
            customerId?: string;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        PropertyApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["Property"];
        };
        PropertyResponseDto: {
            /** Format: uuid */
            id?: string;
            street?: string | null;
            city?: string | null;
            state?: string | null;
            country?: string | null;
            postalCode?: string | null;
            address?: string | null;
            /** Format: double */
            latitude?: number | null;
            /** Format: double */
            longitude?: number | null;
            isBillingAddress?: boolean;
            /** Format: uuid */
            customerId?: string;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        PublicBookingRequest: {
            firstName?: string | null;
            lastName?: string | null;
            email?: string | null;
            phoneNumber?: string | null;
            description?: string | null;
            /** Format: date-time */
            preferredStartDateTime?: string | null;
        };
        PublicWebhookRequest: {
            url?: string | null;
            events?: string | null;
        };
        Quote: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string;
            /** Format: uuid */
            jobId?: string | null;
            job?: components["schemas"]["Job"];
            /** Format: uuid */
            customerId?: string;
            customer?: components["schemas"]["Customer"];
            /** Format: uuid */
            createdByUserId?: string;
            createdByUser?: components["schemas"]["User"];
            /** Format: uuid */
            assignedToUserId?: string | null;
            assignedToUser?: components["schemas"]["User"];
            title?: string | null;
            /** Format: uuid */
            propertyId?: string | null;
            property?: components["schemas"]["Property"];
            quoteNumber?: string | null;
            status?: components["schemas"]["QuoteStatus"];
            /** Format: date-time */
            sentAt?: string | null;
            viewed?: boolean;
            /** Format: date-time */
            viewedAt?: string | null;
            /** Format: date-time */
            expiresAt?: string | null;
            paymentTerms?: string | null;
            /** Format: double */
            depositAmount?: number;
            lineItems?: components["schemas"]["LineItem"][] | null;
            discountType?: components["schemas"]["DiscountType"];
            /** Format: double */
            discountValue?: number;
            /** Format: double */
            taxRate?: number;
            /** Format: double */
            readonly subtotal?: number;
            /** Format: double */
            readonly discount?: number;
            /** Format: double */
            readonly taxAmount?: number;
            /** Format: double */
            readonly total?: number;
            customerNotes?: components["schemas"]["Note"][] | null;
            internalNotes?: components["schemas"]["Note"][] | null;
            customerMessages?: string[] | null;
            activityHistory?: components["schemas"]["ActivityHistory"][] | null;
            source?: string | null;
            attachments?: components["schemas"]["QuoteAttachment"][] | null;
            isArchived?: boolean;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
            /** Format: byte */
            rowVersion?: string | null;
        };
        QuoteAttachment: {
            /** Format: uuid */
            id?: string;
            fileName: string;
            url?: string | null;
            /** Format: uuid */
            quoteId?: string;
            /** Format: date-time */
            createdAt?: string;
        };
        QuoteAttachmentDto: {
            fileName?: string | null;
            url?: string | null;
        };
        QuoteAttachmentResponseDto: {
            /** Format: uuid */
            id?: string;
            fileName?: string | null;
            url?: string | null;
            /** Format: uuid */
            quoteId?: string;
            /** Format: date-time */
            createdAt?: string;
        };
        QuoteResponseDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string;
            /** Format: uuid */
            jobId?: string | null;
            /** Format: uuid */
            customerId?: string;
            customer?: components["schemas"]["CustomerResponseDto"];
            /** Format: uuid */
            createdByUserId?: string;
            createdByUser?: components["schemas"]["UserSummaryResponseDto"];
            /** Format: uuid */
            assignedToUserId?: string | null;
            assignedToUser?: components["schemas"]["UserSummaryResponseDto"];
            title?: string | null;
            /** Format: uuid */
            propertyId?: string | null;
            property?: components["schemas"]["PropertyResponseDto"];
            quoteNumber?: string | null;
            status?: components["schemas"]["QuoteStatus"];
            /** Format: date-time */
            sentAt?: string | null;
            viewed?: boolean;
            /** Format: date-time */
            viewedAt?: string | null;
            /** Format: date-time */
            expiresAt?: string | null;
            paymentTerms?: string | null;
            /** Format: double */
            depositAmount?: number;
            lineItems?: components["schemas"]["LineItemResponseDto"][] | null;
            discountType?: components["schemas"]["DiscountType"];
            /** Format: double */
            discountValue?: number;
            /** Format: double */
            taxRate?: number;
            /** Format: double */
            subtotal?: number;
            /** Format: double */
            discount?: number;
            /** Format: double */
            taxAmount?: number;
            /** Format: double */
            total?: number;
            customerNotes?: components["schemas"]["NoteResponseDto"][] | null;
            internalNotes?: components["schemas"]["NoteResponseDto"][] | null;
            customerMessages?: string[] | null;
            activityHistory?: components["schemas"]["ActivityHistoryResponseDto"][] | null;
            source?: string | null;
            attachments?: components["schemas"]["QuoteAttachmentResponseDto"][] | null;
            isArchived?: boolean;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        QuoteResponseDtoApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["QuoteResponseDto"];
        };
        QuoteResponseDtoListApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["QuoteResponseDto"][] | null;
        };
        QuoteResponseDtoPagedResult: {
            items?: components["schemas"]["QuoteResponseDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
            /** Format: int32 */
            pageNumber?: number;
            /** Format: int32 */
            pageSize?: number;
        };
        QuoteResponseDtoPagedResultApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["QuoteResponseDtoPagedResult"];
        };
        QuoteStatsDto: {
            /** Format: int32 */
            totalQuotes?: number;
            /** Format: double */
            totalValue?: number;
            /** Format: double */
            approvedValue?: number;
            /** Format: double */
            conversionRate?: number;
        };
        QuoteStatsDtoApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["QuoteStatsDto"];
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        QuoteStatus: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
        RecordInvoicePaymentDto: {
            /** Format: double */
            amount?: number;
            method?: components["schemas"]["PaymentMethod"];
            /** Format: date-time */
            paidAt?: string;
            note?: string | null;
        };
        RecordJobDepositPaymentDto: {
            /** Format: double */
            amount?: number;
            method?: components["schemas"]["PaymentMethod"];
            /** Format: date-time */
            paidAt?: string;
            note?: string | null;
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        RecurrenceEndType: 0 | 1 | 2;
        /**
         * Format: int32
         * @enum {integer}
         */
        RecurrenceFrequency: 0 | 1 | 2 | 3 | 4 | 5;
        RecurrenceRule: {
            /** Format: uuid */
            id?: string;
            frequency?: components["schemas"]["RecurrenceFrequency"];
            /** Format: int32 */
            interval?: number;
            daysOfWeek?: components["schemas"]["DayOfWeek"][] | null;
            /** Format: int32 */
            dayOfMonth?: number | null;
            /** Format: int32 */
            weekOfMonth?: number | null;
            dayOfWeekInMonth?: components["schemas"]["DayOfWeek"];
            /** Format: int32 */
            monthOfYear?: number | null;
            endType?: components["schemas"]["RecurrenceEndType"];
            /** Format: int32 */
            occurrenceCount?: number | null;
            /** Format: date-time */
            endDate?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        RecurrenceRuleResponseDto: {
            /** Format: uuid */
            id?: string;
            frequency?: components["schemas"]["RecurrenceFrequency"];
            /** Format: int32 */
            interval?: number;
            daysOfWeek?: components["schemas"]["DayOfWeek"][] | null;
            /** Format: int32 */
            dayOfMonth?: number | null;
            /** Format: int32 */
            weekOfMonth?: number | null;
            dayOfWeekInMonth?: components["schemas"]["DayOfWeek"];
            /** Format: int32 */
            monthOfYear?: number | null;
            endType?: components["schemas"]["RecurrenceEndType"];
            /** Format: int32 */
            occurrenceCount?: number | null;
            /** Format: date-time */
            endDate?: string | null;
        };
        ResetPasswordDto: {
            token?: string | null;
            newPassword?: string | null;
        };
        ReviewSubmission: {
            /** Format: int32 */
            rating?: number;
            comment?: string | null;
        };
        SendInvoiceAttachmentDto: {
            fileName?: string | null;
            contentType?: string | null;
            content?: string | null;
        };
        SendInvoiceDto: {
            recipients?: string[] | null;
            subject?: string | null;
            message?: string | null;
            attachPdf?: boolean;
            attachments?: components["schemas"]["SendInvoiceAttachmentDto"][] | null;
        };
        SendQuoteAttachmentDto: {
            fileName?: string | null;
            contentType?: string | null;
            content?: string | null;
        };
        SendQuoteDto: {
            recipients?: string[] | null;
            subject?: string | null;
            message?: string | null;
            attachPdf?: boolean;
            attachments?: components["schemas"]["SendQuoteAttachmentDto"][] | null;
        };
        ServiceItem: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string;
            name?: string | null;
            description?: string | null;
            type?: components["schemas"]["ServiceItemType"];
            category?: string | null;
            sku?: string | null;
            unitOfMeasure?: string | null;
            /** Format: double */
            stockLevel?: number;
            /** Format: double */
            reorderPoint?: number;
            /** Format: int32 */
            defaultDurationMinutes?: number | null;
            /** Format: double */
            markupPercentage?: number;
            vendor?: string | null;
            /** Format: double */
            unitPrice?: number;
            /** Format: double */
            cost?: number;
            isTaxable?: boolean;
            isActive?: boolean;
            isArchived?: boolean;
            imageUrl?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        ServiceItemApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["ServiceItem"];
        };
        ServiceItemPagedResult: {
            items?: components["schemas"]["ServiceItem"][] | null;
            /** Format: int32 */
            totalCount?: number;
            /** Format: int32 */
            pageNumber?: number;
            /** Format: int32 */
            pageSize?: number;
        };
        ServiceItemPagedResultApiResponse: {
            success?: boolean;
            errorMessage?: string | null;
            payload?: components["schemas"]["ServiceItemPagedResult"];
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        ServiceItemType: 0 | 1;
        StatusChange: {
            /** Format: uuid */
            id?: string;
            fromStatus?: string | null;
            toStatus?: string | null;
            /** Format: date-time */
            changedAt?: string;
            /** Format: uuid */
            changedBy?: string;
            notes?: string | null;
            /** Format: uuid */
            jobId?: string;
        };
        StatusChangeResponseDto: {
            /** Format: uuid */
            id?: string;
            fromStatus?: string | null;
            toStatus?: string | null;
            /** Format: date-time */
            changedAt?: string;
            /** Format: uuid */
            changedBy?: string;
            notes?: string | null;
            /** Format: uuid */
            jobId?: string;
        };
        TimeEntry: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            workspaceId?: string;
            /** Format: uuid */
            jobId?: string;
            job?: components["schemas"]["Job"];
            /** Format: uuid */
            employeeId?: string;
            employee?: components["schemas"]["Employee"];
            /** Format: date-time */
            clockIn?: string;
            /** Format: date-time */
            clockOut?: string | null;
            type?: components["schemas"]["TimeEntryType"];
            notes?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        TimeEntryType: 0 | 1 | 2;
        UpdateCustomFieldDto: {
            /** Format: uuid */
            id?: string | null;
            fieldName?: string | null;
            fieldType?: components["schemas"]["CustomFieldType"];
            defaultValue?: string | null;
            dropdownOptions?: string[] | null;
            isRequired?: boolean | null;
            isArchived?: boolean | null;
        };
        UpdateCustomFieldValueDto: {
            /** Format: uuid */
            id?: string;
            value?: string | null;
        };
        UpdateCustomerDto: {
            /** Format: uuid */
            id?: string;
            firstName?: string | null;
            lastName?: string | null;
            companyName?: string | null;
            displayName?: string | null;
            emails?: string[] | null;
            isReceiveJobNotifications?: boolean | null;
            isReceiveQuoteNotifications?: boolean | null;
            isReceiveInvoiceNotifications?: boolean | null;
            billingStreet?: string | null;
            billingCity?: string | null;
            billingState?: string | null;
            billingCountry?: string | null;
            billingPostalCode?: string | null;
            customFieldValues?: components["schemas"]["UpdateCustomFieldValueDto"][] | null;
            properties?: components["schemas"]["UpdatePropertyDto"][] | null;
            customerPhones?: components["schemas"]["UpdateCustomerPhoneDto"][] | null;
        };
        UpdateCustomerPhoneDto: {
            /** Format: uuid */
            id?: string;
            phoneType?: components["schemas"]["PhoneType"];
            phoneNumber?: string | null;
            isReceiveMessage?: boolean | null;
        };
        UpdateEmployeeDto: {
            /** Format: uuid */
            id?: string;
            position?: string | null;
            department?: string | null;
            status?: components["schemas"]["EmployeeStatus"];
            /** Format: date-time */
            hireDate?: string | null;
            phoneNumber?: string | null;
            imageUrl?: string | null;
            location?: string | null;
            isAvailable?: boolean | null;
            /** Format: double */
            hourlyCostRate?: number | null;
            /** Format: double */
            billableRate?: number | null;
            skills?: string[] | null;
            certifications?: string[] | null;
            workingDays?: components["schemas"]["DayOfWeek"][] | null;
            /** Format: date-span */
            workdayStart?: string | null;
            /** Format: date-span */
            workdayEnd?: string | null;
        };
        UpdateEventDto: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            workspaceId: string;
            title: string;
            description?: string | null;
            category?: string | null;
            location?: string | null;
            /** Format: uuid */
            customerId?: string | null;
            assignedToIds?: string[] | null;
            /** Format: date-time */
            startDateTime: string;
            /** Format: date-time */
            endDateTime: string;
            isAllDay?: boolean;
            isRecurring?: boolean;
            /** Format: uuid */
            recurrenceRuleId?: string | null;
            recurrenceRule?: components["schemas"]["UpdateRecurrenceRuleDto"];
        };
        UpdateInvoiceDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            propertyId?: string;
            title?: string | null;
            lineItems?: components["schemas"]["UpdateLineItemDto"][] | null;
            /** Format: double */
            taxRate?: number | null;
            /** Format: double */
            discount?: number | null;
            discountType?: components["schemas"]["DiscountType"];
            status?: components["schemas"]["InvoiceStatus"];
            /** Format: date-time */
            issueDate?: string | null;
            /** Format: date-time */
            dueDate?: string | null;
            paymentTerms?: string | null;
            notes?: string | null;
            internalNotes?: string | null;
        };
        UpdateJobDto: {
            /** Format: uuid */
            id?: string;
            title?: string | null;
            description?: string | null;
            /** Format: uuid */
            propertyId?: string | null;
            jobType?: components["schemas"]["JobType"];
            lineItems?: components["schemas"]["UpdateLineItemDto"][] | null;
            priority?: components["schemas"]["JobPriority"];
            status?: components["schemas"]["JobStatus"];
            /** Format: date-time */
            startDateTime?: string;
            /** Format: date-time */
            endDateTime?: string;
            recurrenceRule?: components["schemas"]["UpdateRecurrenceRuleDto"];
            /** Format: int32 */
            arrivalWindow?: number | null;
            /** Format: int32 */
            estimatedDurationMinutes?: number | null;
            assignedTeamMemberIds?: string[] | null;
            /** Format: double */
            depositAmount?: number | null;
            paymentStatus?: components["schemas"]["PaymentStatus"];
            discountType?: components["schemas"]["DiscountType"];
            /** Format: double */
            discountValue?: number | null;
            /** Format: double */
            taxRate?: number | null;
            sendInvoice?: boolean | null;
            sendReminder?: boolean | null;
            /** Format: int32 */
            reminderDaysBefore?: number | null;
            confirmationSent?: boolean | null;
            reminderSent?: boolean | null;
            invoiceSent?: boolean | null;
            source?: string | null;
            tags?: string[] | null;
            customerNotes?: string | null;
            internalNotes?: string | null;
        };
        UpdateLeadDto: {
            /** Format: uuid */
            id?: string;
            firstName?: string | null;
            lastName?: string | null;
            email?: string | null;
            phoneNumber?: string | null;
            source?: string | null;
            description?: string | null;
            /** Format: date-time */
            startDateTime?: string | null;
            /** Format: date-time */
            endDateTime?: string | null;
            status?: components["schemas"]["LeadStatus"];
            priority?: components["schemas"]["LeadPriority"];
            lineItems?: components["schemas"]["UpdateLineItemDto"][] | null;
            notes?: string | null;
        };
        UpdateLineItemDto: {
            /** Format: uuid */
            id?: string | null;
            /** Format: uuid */
            serviceItemId?: string | null;
            name?: string | null;
            description?: string | null;
            isOptional?: boolean | null;
            /** Format: double */
            unitPrice?: number | null;
            /** Format: double */
            cost?: number | null;
            isTaxable?: boolean | null;
            /** Format: double */
            quantity?: number | null;
        };
        UpdateNoteDto: {
            /** Format: uuid */
            id?: string;
            noteText?: string | null;
            pathFile?: string | null;
        };
        UpdatePropertyDto: {
            /** Format: uuid */
            id?: string;
            street?: string | null;
            city?: string | null;
            state?: string | null;
            country?: string | null;
            postalCode?: string | null;
            /** Format: double */
            latitude?: number | null;
            /** Format: double */
            longitude?: number | null;
            isBillingAddress?: boolean | null;
        };
        UpdateQuoteDto: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            assignedToUserId?: string | null;
            lineItems?: components["schemas"]["UpdateLineItemDto"][] | null;
            title?: string | null;
            /** Format: uuid */
            propertyId?: string | null;
            discountType?: components["schemas"]["DiscountType"];
            /** Format: double */
            discountValue?: number | null;
            /** Format: double */
            taxRate?: number | null;
            paymentTerms?: string | null;
            /** Format: double */
            depositAmount?: number | null;
            source?: string | null;
        };
        UpdateRecurrenceRuleDto: {
            /** Format: uuid */
            id: string;
            frequency: components["schemas"]["RecurrenceFrequency"];
            /** Format: int32 */
            interval?: number;
            daysOfWeek?: components["schemas"]["DayOfWeek"][] | null;
            /** Format: int32 */
            dayOfMonth?: number | null;
            /** Format: int32 */
            weekOfMonth?: number | null;
            dayOfWeekInMonth?: components["schemas"]["DayOfWeek"];
            /** Format: int32 */
            monthOfYear?: number | null;
            endType: components["schemas"]["RecurrenceEndType"];
            /** Format: int32 */
            occurrenceCount?: number | null;
            /** Format: date-time */
            endDate?: string | null;
        };
        UpdateServiceItemDto: {
            /** Format: uuid */
            id?: string;
            name?: string | null;
            description?: string | null;
            type?: components["schemas"]["ServiceItemType"];
            category?: string | null;
            sku?: string | null;
            unitOfMeasure?: string | null;
            /** Format: double */
            stockLevel?: number | null;
            /** Format: double */
            reorderPoint?: number | null;
            /** Format: int32 */
            defaultDurationMinutes?: number | null;
            /** Format: double */
            markupPercentage?: number | null;
            vendor?: string | null;
            /** Format: double */
            unitPrice?: number | null;
            /** Format: double */
            cost?: number | null;
            isTaxable?: boolean | null;
            isActive?: boolean | null;
            imageUrl?: string | null;
        };
        UpdateUserDto: {
            /** Format: uuid */
            id?: string;
            email?: string | null;
            firstName?: string | null;
            lastName?: string | null;
            role?: components["schemas"]["UserRole"];
        };
        UpdateWorkspaceDto: {
            /** Format: uuid */
            id?: string;
            name?: string | null;
            companyName?: string | null;
            companyUrl?: string | null;
            phoneNumber?: string | null;
            currency?: string | null;
            /** Format: double */
            defaultTaxRate?: number | null;
            defaultPaymentTerms?: string | null;
            taxRegistrationNumber?: string | null;
            addressLine1?: string | null;
            addressLine2?: string | null;
            city?: string | null;
            state?: string | null;
            postalCode?: string | null;
            country?: string | null;
            timeZoneId?: string | null;
            size?: components["schemas"]["CompanySize"];
            logoUrl?: string | null;
            theme?: string | null;
            category?: string | null;
            dunningEnabled?: boolean | null;
            dunningDays?: string | null;
            documentPrimaryColor?: string | null;
            documentFooterText?: string | null;
            documentHeaderLayout?: string | null;
        };
        User: {
            /** Format: uuid */
            id?: string;
            /** Format: email */
            email: string;
            passwordHash?: string | null;
            googleId?: string | null;
            firstName: string;
            lastName: string;
            readonly fullName?: string | null;
            /** Format: uuid */
            workspaceId?: string | null;
            workspace?: components["schemas"]["Workspace"];
            workspaceMemberships?: components["schemas"]["WorkspaceMembership"][] | null;
            role?: components["schemas"]["UserRole"];
            passwordResetToken?: string | null;
            /** Format: date-time */
            passwordResetTokenExpiresAt?: string | null;
            pendingEmail?: string | null;
            emailChangeToken?: string | null;
            /** Format: date-time */
            emailChangeTokenExpiresAt?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        UserLoginDto: {
            email?: string | null;
            password?: string | null;
            rememberMe?: boolean;
        };
        UserLookupDto: {
            /** Format: uuid */
            id?: string;
            fullName?: string | null;
        };
        UserRegisterDto: {
            email?: string | null;
            password?: string | null;
            firstName?: string | null;
            lastName?: string | null;
        };
        /**
         * Format: int32
         * @enum {integer}
         */
        UserRole: 0 | 1 | 2;
        UserSummaryResponseDto: {
            /** Format: uuid */
            id?: string;
            email?: string | null;
            firstName?: string | null;
            lastName?: string | null;
            fullName?: string | null;
            /** Format: uuid */
            workspaceId?: string | null;
            role?: components["schemas"]["UserRole"];
        };
        UserWorkspaceDto: {
            /** Format: uuid */
            id?: string;
            name?: string | null;
            role?: components["schemas"]["UserRole"];
        };
        Workspace: {
            /** Format: uuid */
            id?: string;
            name?: string | null;
            companyName?: string | null;
            companyUrl?: string | null;
            phoneNumber?: string | null;
            currency?: string | null;
            /** Format: double */
            defaultTaxRate?: number;
            defaultPaymentTerms?: string | null;
            taxRegistrationNumber?: string | null;
            addressLine1?: string | null;
            addressLine2?: string | null;
            city?: string | null;
            state?: string | null;
            postalCode?: string | null;
            country?: string | null;
            timeZoneId?: string | null;
            isDeleted?: boolean;
            /** Format: date-time */
            deletedAt?: string | null;
            /** Format: date-time */
            purgeAfter?: string | null;
            size?: components["schemas"]["CompanySize"];
            /** Format: uuid */
            createdByUserId?: string;
            createdByUser?: components["schemas"]["User"];
            logoUrl?: string | null;
            theme?: string | null;
            reviewRequestsEnabled?: boolean;
            googleReviewUrl?: string | null;
            /** Format: int32 */
            reviewRequestDelayHours?: number;
            dunningEnabled?: boolean;
            dunningDays?: string | null;
            documentPrimaryColor?: string | null;
            documentFooterText?: string | null;
            documentHeaderLayout?: string | null;
            category?: string | null;
            users?: components["schemas"]["User"][] | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        WorkspaceLookupDto: {
            /** Format: uuid */
            id?: string;
            name?: string | null;
        };
        WorkspaceMembership: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            userId?: string;
            user?: components["schemas"]["User"];
            /** Format: uuid */
            workspaceId?: string;
            workspace?: components["schemas"]["Workspace"];
            role?: components["schemas"]["UserRole"];
            isActive?: boolean;
            /** Format: date-time */
            joinedAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;

