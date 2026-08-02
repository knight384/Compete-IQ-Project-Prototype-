export class DatasetNotFoundError extends Error {
  constructor(message: string = 'Dataset not found') {
    super(message);
    this.name = 'DatasetNotFoundError';
  }
}

export class DatasetValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatasetValidationError';
  }
}

export class DatasetFormatError extends Error {
  constructor(message: string = 'Unsupported dataset format') {
    super(message);
    this.name = 'DatasetFormatError';
  }
}

export class DatasetStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatasetStateError';
  }
}

export class DatasetMappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatasetMappingError';
  }
}

export class DatasetIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatasetIntegrityError';
  }
}
