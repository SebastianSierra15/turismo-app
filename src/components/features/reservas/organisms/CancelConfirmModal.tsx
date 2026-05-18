"use client";

import React from "react";

type CancelConfirmModalProps = {
  open: boolean;
  reservationId: string;
  submitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  open,
  reservationId,
  submitting = false,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-black text-slate-900">
          Confirmar cancelación
        </h3>
        <p className="mt-3 text-sm text-slate-600">
          ¿Seguro que quieres cancelar la reserva{" "}
          <span className="font-bold">{reservationId}</span>?
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Cancelando..." : "Sí, cancelar"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmModal;
