// hooks/useSessionEditor.js
import { useState } from "react";

export function useSessionEditor(sessions) {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("edit"); // "create" | "edit"
  const [deleteOpen, setDeleteOpen] = useState(false);

  const formModal = {
    isOpen: formOpen,
    mode:   formMode,
    openEdit:   () => { setFormMode("edit");   setFormOpen(true); },
    openCreate: () => { setFormMode("create"); setFormOpen(true); },
    open:       () => { setFormMode("edit");   setFormOpen(true); }, // backward-compat
    close:      () => { setFormOpen(false); setFormMode("edit"); },
  };

  const deleteModal = {
    isOpen: deleteOpen,
    open:   () => setDeleteOpen(true),
    close:  () => setDeleteOpen(false),
  };

  const saveSession = async (formData) => {
    try {
      const res = await sessions.saveSession(formData, { isNew: formMode === "create" });
      if (!res) {
        alert("حدث خطأ أثناء حفظ الحصة. تأكد من البيانات وحاول مرة أخرى.");
      }
    } catch (e) {
      console.error("[useSessionEditor.saveSession]", e);
      alert("حدث خطأ غير متوقع أثناء الحفظ: " + (e.message || ""));
    } finally {
      setFormOpen(false);
      setFormMode("edit");
    }
  };

  const confirmDelete = async () => {
    try {
      const ok = await sessions.resetSession();
      if (!ok) {
        alert("حدث خطأ أثناء حذف الحصة.");
      }
    } catch (e) {
      console.error("[useSessionEditor.confirmDelete]", e);
      alert("حدث خطأ غير متوقع أثناء الحذف.");
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