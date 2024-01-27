interface SendCommandParams {
    commandId: Command["id"];
    coordinatorIds: number[];
    nodeIds?: number[];
    orderId?: number;
    parameters?: number[];
}