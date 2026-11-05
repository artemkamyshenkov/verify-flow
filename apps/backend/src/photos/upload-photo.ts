import { SessionRepository } from "../sessions/repository.js";
import { Photo, PhotoRepository } from "./repository.js";
import { getValidSession } from "../sessions/get-valid-session.js";
import { MobileClientNotJoinedError } from "../sessions/errors.js";
import { UnsupportedPhotoTypeError } from "./errors.js";
import { fileTypeFromBuffer } from "file-type";

export class UploadPhoto {
  constructor(
    private readonly repository: PhotoRepository,
    private readonly sessions: SessionRepository,
  ) {
    this.repository = repository;
    this.sessions = sessions;
  }

  async execute(photo: Photo) {
    const session = await getValidSession(this.sessions, photo.sessionId);

    if (!session.mobileClient) {
      throw new MobileClientNotJoinedError();
    }

    const detected = await fileTypeFromBuffer(photo.data);

    if (
      !detected ||
      (detected.mime !== "image/jpeg" && detected.mime !== "image/png")
    ) {
      throw new UnsupportedPhotoTypeError();
    }

    await this.repository.save({ ...photo, mimeType: detected.mime });
  }
}
