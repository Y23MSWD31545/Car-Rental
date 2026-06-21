import { useState, useCallback } from "react";

/**
 * useToast — lightweight toast notification hook.
 *
 * Returns:
 *   toasts        — current list of toast objects
 *   showToast     — (lines, type, duration?) => void
 *   dismissToast  — (id) => void
 *   ToastContainer — ready-to-render component (no props needed)
 */
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  /** Show a toast.
   * @param {string|string[]} lines  — one line or array of lines
   * @param {"success"|"error"|"info"} type
   * @param {number} duration        — ms before auto-dismiss (default 4000)
   */
  const showToast = useCallback((lines, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    const lineArr = Array.isArray(lines) ? lines : [lines];

    setToasts((prev) => [...prev, { id, lines: lineArr, type, visible: true }]);

    // Start fade-out slightly before removal
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
      );
    }, duration - 400);

    // Remove from DOM
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  }, []);

  /** Drop-in component — render once per page, needs no props */
  const ToastContainer = useCallback(() => (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-item toast-${toast.type} ${toast.visible ? "toast-enter" : "toast-exit"}`}
          role="alert"
        >
          <div className="toast-lines">
            {toast.lines.map((line, i) => (
              <span key={i} className="toast-line">{line}</span>
            ))}
          </div>
          <button
            className="toast-dismiss"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  ), [toasts, dismissToast]);

  return { toasts, showToast, dismissToast, ToastContainer };
};

export default useToast;
