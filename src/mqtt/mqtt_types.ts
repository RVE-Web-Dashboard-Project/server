export enum MQTTConnectionStatus {
    Connected = "connected",
    Disconnecting = "disconnecting",
    Disconnected = "disconnected",
}

export interface AckResponse {
    command: 5
    coord_id: number;
    node_id: number;
    params: {
        param1: number,
        param2: 0,
    }
}

export interface NoAckResponse {
    command: 10
    coord_id: number;
    node_id: number;
    params: {
        param1: number,
        param2: 0,
    }
}

export interface PingResponse {
    command: 15,
    coord_id: number;
    node_id: number;
    params: {
        param1: 0,
        param2: 0,
    }
}

export interface GetRestartCountResponse {
    command: 20,
    coord_id: number;
    node_id: number;
    params: {
        param1: number,
        param2: 0,
    }
}

export interface SetRestartCountResponse {
    command: 25,
    coord_id: number;
    node_id: number;
    params: {
        param1: 0,
        param2: 0,
    }
}

export interface SanityCheckResponse {
    command: 35,
    coord_id: number;
    node_id: number;
    params: {
        param1: 0,
        param2: 0,
    }
}


export type ReceivedMessage = NoAckResponse
    | AckResponse
    | PingResponse
    | GetRestartCountResponse
    | SetRestartCountResponse
;
