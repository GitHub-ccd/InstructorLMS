'use client';

import { useState } from 'react';
import { Megaphone, Copy, Check, Sparkles, Share2 } from 'lucide-react';

export default function AnnouncementsPage() {
  const [title, setTitle] = useState('Upcoming Exam & Project Submission Checklist');
  const [content, setContent] = useState(
    `Dear Students,\n\nPlease note that Assignment 3 is due this Friday by 11:59 PM. Make sure to double check your CSS Flexbox layouts before submitting your final repo link.\n\nOffice hours will be held on Thursday at 2 PM for any last-minute debugging questions.\n\nBest regards,\nDr. Vance`
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullText = `${title}\n\n${content}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-white tracking-tight">External Announcement Builder</h2>
        <p className="text-sm text-slate-400 mt-1">
          Paste announcements drafted in external AI assistants (e.g. DuckDuckGo AI, ChatGPT, Gemini) for quick reference and single-click copy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Form */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-base border-b border-slate-800 pb-3">
            <Megaphone className="w-5 h-5" /> Announcement Draft Editor
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Announcement Subject Line</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Subject line..."
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Announcement Message Body</label>
              <textarea
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste drafted announcement here..."
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-sans leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Live Preview & Action Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Format Preview
              </span>
              {copied ? (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Copied to Clipboard!
                </span>
              ) : (
                <span className="text-xs text-slate-500">Ready for distribution</span>
              )}
            </div>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-base">{title}</h3>
              <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {content}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">Zero AI token fees incurred.</p>
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy formatted text'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
