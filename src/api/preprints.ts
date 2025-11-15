const API_BASE = "https://rvu-preprints-api.onrender.com/api";

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

export async function fetchPreprints(params?: Record<string, string>): Promise<Preprint[]> {
  const url = new URL(`${API_BASE}/preprints/`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error('Failed to fetch preprints');
  }

  return res.json();
}

export async function fetchPreprintById(id: number): Promise<Preprint> {
  const res = await fetch(`${API_BASE}/preprints/${id}/`);
  if (!res.ok) {
    throw new Error('Failed to fetch preprint');
  }

  return res.json();
}

export async function uploadPreprint(formValues: UploadFormData): Promise<Preprint> {
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
