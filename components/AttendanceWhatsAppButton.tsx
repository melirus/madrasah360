"use client";

import {
  MessageCircle,
} from "lucide-react";

export default function AttendanceWhatsAppButton({
  guardianName,
  whatsappNumber,
  studentName,
  date,
  status,
}: {
  guardianName: string;
  whatsappNumber: string;
  studentName: string;
  date: string;
  status: string;
}) {
  function send() {
    const statusText =
      status === "absent"
        ? "tidak hadir"
        : status === "late"
        ? "hadir lewat"
        : status === "excused"
        ? "tidak hadir dengan kebenaran"
        : status;

    const message =
`Assalamualaikum ${guardianName},

Makluman kehadiran ${studentName} pada ${date}:

Status: ${statusText}

Sekiranya terdapat sebarang maklumat tambahan, mohon hubungi pihak madrasah.

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
  }

  return (
    <button
      type="button"
      onClick={send}
      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
    >
      <MessageCircle size={15} />
      WhatsApp Parent
    </button>
  );
}