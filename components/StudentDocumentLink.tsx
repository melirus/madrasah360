"use client";

import { useState } from "react";
import {
  ExternalLink,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function StudentDocumentLink({
  storagePath,
}: {
  storagePath: string;
}) {
  const supabase = createClient();

  const [loading, setLoading] =
    useState(false);

  async function openDocument() {
    setLoading(true);

    const {
      data,
      error,
    } = await supabase.storage
      .from("student-documents")
      .createSignedUrl(
        storagePath,
        60 * 10
      );

    setLoading(false);

    if (
      error ||
      !data?.signedUrl
    ) {
      alert(
        error?.message ??
          "Unable to open document."
      );
      return;
    }

    window.open(
      data.signedUrl,
      "_blank"
    );
  }

  return (
    <button
      type="button"
      onClick={openDocument}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
    >
      <ExternalLink size={15} />

      {loading
        ? "Opening..."
        : "Open"}
    </button>
  );
}