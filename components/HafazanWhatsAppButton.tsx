"use client";

import {
  MessageCircle,
} from "lucide-react";


export default function HafazanWhatsAppButton({
  guardianName,
  whatsappNumber,
  studentName,
  recordType,
  juzuk,
  surah,
  ayatFrom,
  ayatTo,
  rating,
  comment,
}: {
  guardianName: string;
  whatsappNumber: string;
  studentName: string;
  recordType: string;
  juzuk: number | null;
  surah: string | null;
  ayatFrom: number | null;
  ayatTo: number | null;
  rating: number | null;
  comment: string | null;
}) {

  function sendWhatsApp() {

    const type =
      recordType === "hafazan_baru"
        ? "Hafazan Baru"
        : recordType === "tasmi"
        ? "Tasmi'"
        : "Murajaah";


    const message =
`Assalamualaikum ${guardianName},

Makluman hafazan ${studentName} hari ini:

Jenis: ${type}
Juzuk: ${juzuk ?? "-"}
Surah: ${surah ?? "-"}
Ayat: ${
  ayatFrom && ayatTo
    ? `${ayatFrom}-${ayatTo}`
    : "-"
}
Penilaian: ${
  rating
    ? `${rating}/5`
    : "-"
}

Ulasan Ustaz/Ustazah:
${comment || "-"}

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
      onClick={sendWhatsApp}
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
    >

      <MessageCircle size={17} />

      WhatsApp Parent

    </button>
  );
}