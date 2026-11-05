import { Photo, PhotoRepository } from "./repository.js";

export class InMemoryPhotoRepository implements PhotoRepository {
  private readonly photos = new Map<string, Photo>();

  async save(photo: Photo): Promise<void> {
    this.photos.set(photo.sessionId, photo);
  }

  async findBySessionId(id: string): Promise<Photo | null> {
    return this.photos.get(id) ?? null;
  }
}
