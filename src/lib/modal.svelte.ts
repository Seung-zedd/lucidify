/**
 * Svelte 5 utility for common modal behaviors.
 * Handles Escape key to close and provides a backdrop click handler.
 */
export function useModal(onClose: () => void) {
  function handleBackdropClick(e: MouseEvent) {
    // Only close if the click was directly on the backdrop (currentTarget),
    // not on its children (modal content).
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    }
  }

  $effect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });

  return {
    handleBackdropClick,
    handleKeydown,
  };
}
