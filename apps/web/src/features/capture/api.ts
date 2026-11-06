import { UploadPhotoResponse } from "@verify/contracts";
import { Result, request } from "../../utils/request";

export async function uploadPhoto(
  photo: Blob,
  sessionId: string,
): Promise<Result<null>> {
  try {
    const formData = new FormData();
    formData.append("photo", photo);

    await request<UploadPhotoResponse>(`/sessions/${sessionId}/photo`, {
      method: "POST",
      body: formData,
    });

    return { ok: true, data: null };
  } catch (error) {
    console.error(error);

    return { ok: false, error: "upload photo error" };
  }
}
