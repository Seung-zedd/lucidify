<script lang="ts">
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import X from "@lucide/svelte/icons/x";
  import { fade, fly } from "svelte/transition";
  import { useModal } from "$lib/modal.svelte";

  type ModalType = "danger" | "warning" | "info";

  interface Props {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: ModalType;
    onconfirm: () => void;
    oncancel: () => void;
  }

  let {
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    type: modalType = "danger",
    onconfirm,
    oncancel,
  }: Props = $props();

  const colors: Record<ModalType, string> = {
    danger: "bg-red-500 hover:bg-red-600 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-black",
    info: "bg-blue-500 hover:bg-blue-600 text-white",
  };

  const iconColors: Record<ModalType, string> = {
    danger: "text-red-500 bg-red-500/10",
    warning: "text-amber-500 bg-amber-500/10",
    info: "text-blue-500 bg-blue-500/10",
  };

  const { handleBackdropClick, handleKeydown } = useModal(() => oncancel);
</script>

<div
  class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  transition:fade={{ duration: 200 }}
  onclick={handleBackdropClick}
  role="button"
  tabindex="-1"
  onkeydown={handleKeydown}
>
  <div
    class="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
    transition:fly={{ y: 20, duration: 300 }}
  >
    <div class="p-6">
      <div class="flex items-start gap-4">
        <div class="p-3 rounded-xl {iconColors[modalType]} shrink-0">
          <TriangleAlert class="w-6 h-6" />
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-bold text-white mb-2">{title}</h3>
          <p class="text-zinc-400 leading-relaxed">{message}</p>
        </div>
        <button
          onclick={oncancel}
          class="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="flex gap-3 mt-8">
        <button
          onclick={oncancel}
          class="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onclick={onconfirm}
          class="flex-1 px-4 py-2.5 rounded-xl {colors[
            modalType
          ]} font-bold transition-all shadow-lg active:scale-95"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
</div>
