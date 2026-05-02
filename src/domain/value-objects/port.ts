import { InvalidPortError } from '../errors/invalid-port.error.js';

export class Port {
  private constructor(private readonly _value: number) {}

  static create(value: number): Port {
    if (!Number.isInteger(value) || value < 1 || value > 65535)
      throw new InvalidPortError('Port must be between 1 and 65535');

    return new Port(value);
  }

  get value(): number {
    return this._value;
  }
}
