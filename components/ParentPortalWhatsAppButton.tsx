"use client";

import { useState } from "react";
import {
  MessageCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";


export default function ParentPortalWhatsAppButton({
  guardianId,
  guardianName,
  whatsappNumber,
  studentName,
}: {
  guardianId: string;
  guardianName: string;
  whatsappNumber: string;
  studentName: string;
}) {

  const supabase =
    createClient();

  const [loading, setLoading] =
    useState(false);


  async function send() {

    setLoading(true);


    const {
      data: token,
      error,
    } = await supabase.rpc(
      "get_or_create_guardian_portal_token",
      {
        p_guardian_id:
          guardianId,
      }
    );


    if (
      error ||
      !token
    ) {

      alert(
        error?.message ??
          "Unable to create parent portal link."
      );

      setLoading(false);

      return;
    }


    const portalUrl =
      `${window.location.origin}/parent/${token}`;


    const message =
`Assalamualaikum ${guardianName},

Pihak Madrasah MUTQAN menyediakan portal maklumat bagi ${studentName}.

Portal ini membolehkan tuan/puan melihat:

• Rekod Hafazan
• Kehadiran
• Keputusan Akademik
• Maklumat Yuran

Klik pautan berikut:

${portalUrl}

Sila simpan pautan ini untuk kegunaan tuan/puan.

Terima kasih.
Madrasah MUTQAN`;


    const url =
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`;


    window.open(
      url,
      "_blank"
    );


    setLoading(false);

  }


  return (
    <button
      type="button"
      onClick={send}
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
    >

      <MessageCircle size={17} />

      {loading
        ? "Preparing..."
        : "WhatsApp Parent Portal"}

    </button>
  );
}