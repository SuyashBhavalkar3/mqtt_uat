'use client';

import React from 'react';
import { CalendarCheck, ShieldCheck, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      {/* Background soft ambient glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="max-w-xl w-full text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold tracking-wide uppercase shadow-sm mb-8">
          <CalendarCheck className="w-4 h-4 text-blue-600" />
          <span>Dealer Meet 2026 • Event Concluded</span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xl shadow-zinc-200/40 p-8 sm:p-10 relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400"></div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Live Dashboard is Closed
          </h1>

          {/* Description */}
          <p className="text-zinc-600 mt-3 text-sm sm:text-base leading-relaxed">
            The live performance tracking session for the Dealer Meet has officially concluded. 
            All order bookings and collections from the event have been recorded and saved.
          </p>

          {/* Status info box */}
          <div className="mt-8 pt-6 border-t border-zinc-100 grid grid-cols-2 gap-4 text-left">
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">Session Status</span>
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Archived & Finalized
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">Access Mode</span>
              <span className="text-sm font-bold text-zinc-700 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Read Only
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-xs text-zinc-400 mt-8">
          © {new Date().getFullYear()} Shoption Dealer Performance Portal • Thank you for your participation!
        </p>
      </div>
    </div>
  );
}
