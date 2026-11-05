// hooks/useSessionEditor.js
import { useState } from "react";

export function useSessionEditor(sessions) {
  const [formOpen, setFormOpen]     = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Form modal ─────────────────────────────────
  const formModal = {
    isOpen: formOpen,
    open:   () => setFormOpen(true),
    close:  () => setFormOpen(false),
  };

  // ── Delete modal ───────────────────────────────
  const deleteModal = {
    isOpen: deleteOpen,
    open:   () => setDeleteOpen(true),
    close:  () => setDeleteOpen(false),
  };

  // ── عمليات مدمجة (save + close / reset + close) — async ─
  const saveSession = async (formData) => {
    try {
      await sessions.saveSession(formData);
    } catch (e) {
      console.error("[useSessionEditor.saveSession]", e);
    } finally {
      setFormOpen(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await sessions.resetSession();
    } catch (e) {
      console.error("[useSessionEditor.confirmDelete]", e);
    } finally {
      setDeleteOpen(false);
    }
  };

  return {
    formModal,
    deleteModal,
    saveSession,
    confirmDelete,
  };
}