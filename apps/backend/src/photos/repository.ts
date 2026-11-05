export type PhotoRepository = {
  save(photo: Photo): Promise<void>;
  findBySessionId(sessionId: string): Promise<Photo | null>;
};

export type Photo = {
  sessionId: string;
  data: Buffer;
  mimeType: "image/jpeg" | "image/png";
};
