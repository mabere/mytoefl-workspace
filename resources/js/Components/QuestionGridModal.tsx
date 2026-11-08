import React from "react";
import { X, CheckCircle2, Bookmark, Circle } from "lucide-react";
import { useExamStore } from "@/lib/examStore";

interface QuestionGridModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionGridModal: React.FC<QuestionGridModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    questions,
    answers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
  } = useExamStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Question Navigation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a number to jump to a question.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 py-3 border-b border-slate-100 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-400 text-amber-900 flex items-center justify-center text-[10px] font-bold">
              ★
            </span>
            <span>Marked for Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold">
              -
            </span>
            <span>Unanswered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded ring-2 ring-blue-500 ring-offset-1 bg-white border border-slate-300"></span>
            <span>Current Question</span>
          </div>
        </div>

        {/* Grid of question numbers */}
        <div className="overflow-y-auto py-4 flex-1">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isAnswered = ans && ans.selectedAnswer !== null;
              const isFlagged = ans && ans.isMarkedForReview;
              const isCurrent = idx === currentQuestionIndex;

              let btnClass = "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300";

              if (isFlagged) {
                btnClass =
                  "bg-amber-400 text-amber-950 hover:bg-amber-500 font-bold border border-amber-500 shadow-xs";
              } else if (isAnswered) {
                btnClass =
                  "bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-xs";
              }

              if (isCurrent) {
                btnClass += " ring-3 ring-blue-500 ring-offset-2 scale-105 z-10";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    onClose();
                  }}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all relative ${btnClass}`}
                >
                  <span>{q.questionNumber}</span>
                  {ans?.selectedAnswer && (
                    <span className="text-[10px] opacity-90 uppercase leading-none">
                      {ans.selectedAnswer}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
