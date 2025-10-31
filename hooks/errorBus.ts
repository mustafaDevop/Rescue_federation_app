type Listener = (error: unknown) => void;

class ErrorBus {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(error: unknown) {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch {}
    });
  }
}

export const ApiErrorBus = new ErrorBus();
