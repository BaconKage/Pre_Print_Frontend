export const API_BASE = "https://rvu-preprints-api.onrender.com/api";

export interface Preprint {
  id: number;
  title: string;
  abstract: string;
  category: string;
  course_code: string | null;
  authors: string | null;
  faculty: string | null;
  pdf_file: string | null;
  uploaded_at: string;
  version: number;
  doi: string | null;
  status: string;
}

export interface UploadFormData {
  title: string;
  abstract: string;
  category: string;
  courseCode?: string;
  authors?: string;
  faculty?: string;
  mintDoi: boolean;
  pdfFile: File;
}

/* ---------------------------------------------------
   ✅ fetchPreprints — with retry logic for Render cold starts
--------------------------------------------------- */
export async function fetchPreprints(
  params?: Record<string, string>
): Promise<Preprint[]> {
  const url = new URL(`${API_BASE}/preprints/`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // Retry up to 4 times if Render backend is cold-starting
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        return res.json();
      }

      if (attempt === 4) {
        throw new Error("Failed after retries: could not fetch preprints.");
      }
    } catch {
      console.warn(`Backend cold — retrying (${attempt}/4)...`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  throw new Error("Server still starting. Try again in a moment.");
}

/* ---------------------------------------------------
   Get one preprint by ID
--------------------------------------------------- */
export async function fetchPreprintById(id: number): Promise<Preprint> {
  const res = await fetch(`${API_BASE}/preprints/${id}/`);
  if (!res.ok) {
    throw new Error("Failed to fetch preprint");
  }

  return res.json();
}

/* ---------------------------------------------------
   Upload a new preprint
--------------------------------------------------- */
export async function uploadPreprint(
  formValues: UploadFormData
): Promise<Preprint> {
  const fd = new FormData();
  fd.append("title", formValues.title);
  fd.append("abstract", formValues.abstract);
  fd.append("category", formValues.category || "cs");
  fd.append("course_code", formValues.courseCode || "");
  fd.append("authors", formValues.authors || "");
  fd.append("faculty", formValues.faculty || "");
  fd.append("mint_doi", formValues.mintDoi ? "true" : "false");
  fd.append("pdf_file", formValues.pdfFile);

  const res = await fetch(`${API_BASE}/preprints/`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed");
  }

  return res.json();
}

/* ---------------------------------------------------
   🔥 deletePreprint (Admin Only)
--------------------------------------------------- */
export async function deletePreprint(id: number): Promise<void> {
  const adminKey = import.meta.env.VITE_ADMIN_KEY;

  if (!adminKey) {
    throw new Error("VITE_ADMIN_KEY is not set in frontend .env");
  }

  const res = await fetch(`${API_BASE}/admin/preprints/${id}/`, {
    method: "DELETE",
    headers: {
      "X-ADMIN-KEY": adminKey,
    },
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Delete failed: ${res.status} ${err}`);
  }
}
