export class AiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiConfigurationError';
    Object.setPrototypeOf(this, AiConfigurationError.prototype);
  }
}

export class AiProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiProviderError';
    Object.setPrototypeOf(this, AiProviderError.prototype);
  }
}

export class AiResponseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiResponseValidationError';
    Object.setPrototypeOf(this, AiResponseValidationError.prototype);
  }
}
