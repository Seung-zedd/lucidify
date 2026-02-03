/**
 * Simple Toast logic using Svelte 5 Runes.
 */
class ToastState {
  message = $state<string | null>(null);
  type = $state<"success" | "error" | "info">("info");
  isVisible = $state(false);
  private timeoutId: any = null;

  show(msg: string, type: "success" | "error" | "info" = "info") {
    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.message = msg;
    this.type = type;
    this.isVisible = true;

    this.timeoutId = setTimeout(() => {
      this.isVisible = false;
    }, 3000);
  }

  hide() {
    this.isVisible = false;
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}

export const toast = new ToastState();
