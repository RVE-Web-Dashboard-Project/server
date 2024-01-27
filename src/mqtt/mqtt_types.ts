export enum MQTTConnectionStatus {
    Connected = "connected",
    Disconnecting = "disconnecting",
    Disconnected = "disconnected",
}

export interface AckResponse {
    command: 5
    coord_id: number;
    node_id: number;
    order_id?: number;
    params: {
        param1: number
    }
}

export interface NoAckResponse {
    command: 10
    coord_id: number;
    node_id: number;
    order_id?: number;
    params: {
        param1: number
    }
}

export interface PingResponse {
    command: 15,
    coord_id: number;
    node_id: number;
    order_id?: number;
    params: {
        param1: 0
    }
}

export interface GetRestartCountResponse {
    command: 20,
    coord_id: number;
    node_id: number;
    order_id?: number;
    params: {
        param1: number
    }
}

export interface SetRestartCountResponse {
    command: 25,
    coord_id: number;
    node_id: number;
    order_id?: number;
    params: {
        param1: 0
    }
}

export interface SanityCheckResponse {
    command: 35,
    coord_id: number;
    node_id: number;
    order_id?: number;
    params: {
        param1: 0
    }
}

export interface GetNonResponseCountResponse {
    command: 40,
    coord_id: number;
    node_id: 0;
    order_id?: number;
    params: {
        param1: number
    }
}

export interface GetSamplingTimeResponse {
    command: 45,
    coord_id: number;
    node_id: 0;
    order_id?: number;
    params: {
        param1: number
    }
}

export interface SetSamplingTimeResponse {
    command: 50,
    coord_id: number;
    node_id: 0;
    order_id?: number;
    params: {
        param1: 0
    }
}

export interface PauseSamplingResponse {
    command: 55,
    coord_id: number;
    node_id: 0;
    order_id?: number;
    params: {
        param1: 0
    }
}

export interface ResumeSamplingResponse {
    command: 60,
    coord_id: number;
    node_id: 0;
    order_id?: number;
    params: {
        param1: 1
    }
}

export interface GetSamplingStateResponse {
    command: 65,
    coord_id: number;
    node_id: 0;
    order_id?: number;
    params: {
        param1: 0 | 1
    }
}


export type MQTTReceivedMessage = AckResponse
    | NoAckResponse
    | PingResponse
    | GetRestartCountResponse
    | SetRestartCountResponse
    | SanityCheckResponse
    | GetNonResponseCountResponse
    | GetSamplingTimeResponse
    | SetSamplingTimeResponse
    | PauseSamplingResponse
    | ResumeSamplingResponse
    | GetSamplingStateResponse
;
