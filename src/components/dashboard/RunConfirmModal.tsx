import { AlertTriangle, X } from 'lucide-react';

interface Props {
  runDate: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function RunConfirmModal({ runDate, onConfirm, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-bold">실행 확인</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900">{runDate}</span>에 기사를 이미
            호출했습니다. 다시 실행하겠습니까?
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-1.5 rounded border border-slate-200 hover:border-slate-400 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="text-xs font-semibold text-white bg-cc-slate hover:opacity-80 px-4 py-1.5 rounded transition-opacity"
          >
            실행
          </button>
        </div>
      </div>
    </div>
  );
}
