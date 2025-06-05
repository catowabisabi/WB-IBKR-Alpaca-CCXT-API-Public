// ibkr-connection.exception.ts
export class IbkrConnectionException extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'IbkrConnectionException';
    }
  }