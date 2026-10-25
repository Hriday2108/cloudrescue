import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const iconMap = {
  success: <CheckCircle2 size={18} color="var(--color-green)" />,
  error: <XCircle size={18} color="var(--color-red)" />,
  warning: <AlertTriangle size={18} color="var(--color-yellow)" />,
  info: <Info size={18} color="var(--color-blue)" />,
};

export default function ToastContainer() {
  const { toasts } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map(toast => (
        <div className="toast" key={toast.id}>
          <span className="toast-icon">{iconMap[toast.type] || iconMap.info}</span>
          <div className="toast-text">
            <div className="toast-title">{toast.title}</div>
            {toast.desc && <div className="toast-desc">{toast.desc}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
