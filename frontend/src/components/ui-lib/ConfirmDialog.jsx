"use client";

import { C } from "./theme";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-md f-body text-[13px]"
            style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium"
            style={{ background: danger ? C.stamp : C.ink, color: C.paper }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="f-body text-[13px]" style={{ color: C.slateMute }}>{message}</p>
    </Modal>
  );
}
