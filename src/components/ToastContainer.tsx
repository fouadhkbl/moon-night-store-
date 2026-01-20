import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';

export const ToastContainer = ({ toasts, removeToast }: { toasts: any[], removeToast: (id: string) => void }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border transition-all duration-300 transform translate-y-0 opacity-100 ${
            toast.type === 'success' ? 'bg-green-900/90 border-green-500 text-white' : 
            toast.type === 'error' ? 'bg-red-900/90 border-red-500 text-white' : 
            'bg-blue-900/90 border-blue-500 text-white'
          }`}
        >
          {toast.type === 'success' && <Check className="w-5 h-5 text-green-400" />}
          {toast.type === 'error' && <X className="w-5 h-5 text-red-400" />}
          {toast.type === 'info' && <ShieldCheck className="w-5 h-5 text-blue-400" />}
          <div>
            <h4 className="font-bold text-sm">{toast.title}</h4>
            <p className="text-xs text-gray-200">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-50 hover:opacity-100"><X className="w-4 h-4"/></button>
        </div>
      ))}
    </div>
  );
};