interface SendCommandParams {
    commandId: Command["id"];
    coordinatorId: number;
    nodeId?: number;
    parameters?: number[];
}