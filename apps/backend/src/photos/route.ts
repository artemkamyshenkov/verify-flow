import type { FastifyPluginAsync } from "fastify";
import type { UploadPhoto } from "./upload-photo.js";
import type { Photo } from "./repository.js";
import { UnsupportedPhotoTypeError } from "./errors.js";
import {
  MobileClientNotJoinedError,
  SessionExpiredError,
  SessionNotFoundError,
} from "../sessions/errors.js";

type PhotoRoutesOptions = {
  uploadPhoto: UploadPhoto;
};

export const photoRoutes: FastifyPluginAsync<PhotoRoutesOptions> = async (
  app,
  { uploadPhoto },
) => {
  app.post<{ Params: { sessionId: string } }>(
    "/sessions/:sessionId/photo",
    {
      schema: {
        params: {
          type: "object",
          required: ["sessionId"],
          properties: {
            sessionId: { type: "string", format: "uuid" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        let photo: Photo | undefined;

        for await (const part of request.parts()) {
          if (part.type !== "file" || part.fieldname !== "photo") {
            return reply.code(400).send({ message: "Expected a single file in the photo field" });
          }

          if (part.mimetype !== "image/jpeg" && part.mimetype !== "image/png") {
            throw new UnsupportedPhotoTypeError();
          }

          photo = {
            sessionId: request.params.sessionId,
            data: await part.toBuffer(),
            mimeType: part.mimetype,
          };
        }

        if (!photo || photo.data.length === 0) {
          return reply.code(400).send({ message: "Photo is required" });
        }

        await uploadPhoto.execute(photo);
        return reply.code(201).send({ message: "Photo uploaded" });
      } catch (error) {
        if (error instanceof SessionNotFoundError) {
          return reply.code(404).send({ message: error.message });
        }
        if (error instanceof SessionExpiredError) {
          return reply.code(410).send({ message: error.message });
        }
        if (error instanceof MobileClientNotJoinedError) {
          return reply.code(409).send({ message: error.message });
        }
        if (error instanceof UnsupportedPhotoTypeError) {
          return reply.code(415).send({ message: error.message });
        }
        if (error instanceof app.multipartErrors.RequestFileTooLargeError) {
          return reply.code(413).send({ message: "Photo exceeds the 5 MiB limit" });
        }
        if (error instanceof app.multipartErrors.FilesLimitError) {
          return reply.code(400).send({ message: "Only one photo is allowed" });
        }
        throw error;
      }
    },
  );
};
