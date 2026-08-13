"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function StudentDocumentUpload({
  studentId,
}: {
  studentId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [documentType, setDocumentType] =
    useState("birth_certificate");

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function uploadDocument() {
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a file.");
      return;
    }

      // 2. Check file size
    if (file.size > 10 * 1024 * 1024) {
      setError("Maximum file size is 10MB.");
      return;
    }

      // 3. Continue upload
      setLoading(true);

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Not authenticated."
        );
      }

      const { data: profile } =
        await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

      if (!profile?.organization_id) {
        throw new Error(
          "Organization not found."
        );
      }

      const extension =
        file.name.split(".").pop();

      const storagePath =
        `${profile.organization_id}/${studentId}/${Date.now()}-${documentType}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("student-documents")
        .upload(
          storagePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

      if (uploadError) {
        throw new Error(
          uploadError.message
        );
      }

      const {
        error: documentError,
      } = await supabase
        .from("documents")
        .insert({
          organization_id:
            profile.organization_id,

          student_id:
            studentId,

          document_type:
            documentType,

          file_name:
            file.name,

          storage_path:
            storagePath,

          file_size:
            file.size,

          mime_type:
            file.type,

          uploaded_by:
            user.id,
        });

      if (documentError) {
        throw new Error(
          documentError.message
        );
      }

      setSuccess(
        "Document uploaded successfully."
      );

      setFile(null);

      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <FileText size={20} />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Upload Document
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload student supporting documents.
          </p>
        </div>

      </div>

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Document Type
          </label>

          <select
            value={documentType}
            onChange={(e) =>
              setDocumentType(
                e.target.value
              )
            }
            className={inputStyle}
          >
            <option value="birth_certificate">
              Birth Certificate
            </option>

            <option value="mykid">
              MyKid / IC
            </option>

            <option value="application_form">
              Application Form
            </option>

            <option value="parent_ic">
              Parent IC
            </option>

            <option value="medical">
              Medical Document
            </option>

            <option value="other">
              Other
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            File
          </label>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) =>
              setFile(
                e.target.files?.[0] ??
                null
              )
            }
            className={inputStyle}
          />
        </div>

      </div>

      <button
        type="button"
        onClick={uploadDocument}
        disabled={loading}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        <Upload size={17} />

        {loading
          ? "Uploading..."
          : "Upload Document"}
      </button>

    </section>
  );
}

const inputStyle =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500";