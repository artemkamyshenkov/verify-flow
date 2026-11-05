export class UnsupportedPhotoTypeError extends Error {
  constructor() {
    super("Unsupported photo type. Only JPEG and PNG are allowed");
    this.name = "UnsupportedPhotoTypeError";
  }
}
