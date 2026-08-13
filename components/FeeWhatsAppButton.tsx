"use client";

import {
  MessageCircle,
} from "lucide-react";

export default function FeeWhatsAppButton({
  guardianName,
  whatsappNumber,
  studentName,
  invoiceNo,
  description,
  total,
  paid,
  balance,
}: {
  guardianName: string;
  whatsappNumber: string;
  studentName: string;
  invoiceNo: string;
  description: string;
  total: number;
  paid: number;
  balance: number;
}) {
  function send() {
    const message =
`Assalamualaikum ${guardianName},

Makluman yuran ${studentName}.

No. Invois: ${invoiceNo}
Yuran: ${description}

Jumlah: RM${total.toFixed(2)}
Bayaran diterima: RM${paid.toFixed(2)}
Baki: RM${balance.toFixed(2)}

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
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
    >
      <MessageCircle size={17} />
      WhatsApp Fee Reminder
    </button>
  );
}