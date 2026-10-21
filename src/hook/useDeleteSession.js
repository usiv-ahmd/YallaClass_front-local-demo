import { useState } from 'react';

export default function useDeleteSession() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const requestDelete = (id) => {
    setSessionId(id);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return { isOpen, sessionId, requestDelete, close };
}