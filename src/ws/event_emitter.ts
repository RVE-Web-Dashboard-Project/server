import { EventEmitter } from "stream";

interface MyEventEmitter {
    emit(event: "command_usage", commandId: number): boolean;

    on(event: "command_usage", listener: (commandId: number) => void): this;
}

export const eventEmitter: MyEventEmitter = new EventEmitter();
