import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  LifeBuoy,
  Layers
} from 'lucide-react';
import { useDigiSolia } from '../hooks/useDigiSolia';
import { DigiSoliaLogo } from '../components/DigiSoliaLogo';

interface WelcomePageProps {
  onStart: () => void;
  onOpenSupport?: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onStart,
  onOpenSupport
}) => {
  const { config, completeWelcome } = useDigiSolia();

  const handleGetStarted = () => {
    completeWelcome();
    onStart();
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#09111a] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 lg:p-12">
      <div className="max-w-5xl w-full mx-auto space-y-8 my-auto">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <DigiSoliaLogo config={config} size="lg" showTagline />
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
            <span>{config.appCategory}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-[#163B65] dark:text-sky-400 font-bold">
              Version {config.version}
            </span>
          </div>
        </div>

        {/* Hero Card */}
        <section className="rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Intro */}
            <div className="lg:col-span-7 p-6 sm:p-10 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2783C7] dark:text-sky-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Écosystème {config.brand.name}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#163B65] dark:text-white leading-tight">
                  {config.appName}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {config.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="h-12 px-6 rounded-xl bg-[#163B65] hover:bg-[#1e4c82] dark:bg-[#2783C7] dark:hover:bg-sky-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-sm transition"
                >
                  <span>Commencer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onOpenSupport && (
                  <button
                    type="button"
                    onClick={() => {
                      completeWelcome();
                      onOpenSupport();
                    }}
                    className="h-12 px-5 rounded-xl border border-[#E1E7EF] dark:border-slate-700 hover:bg-[#F4F7FB] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center gap-2 transition"
                  >
                    <LifeBuoy className="w-4 h-4 text-[#2783C7]" />
                    <span>Centre d’assistance</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Brand Highlights */}
            <div className="lg:col-span-5 bg-[#163B65] dark:bg-[#11263f] text-white p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Avantages clés</span>
                </div>

                <ul className="space-y-3.5">
                  {config.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-sky-50/95 leading-snug">
                      <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-white/15 text-xs text-sky-100/80 space-y-1">
                <div className="font-semibold text-white">
                  Éditeur : {config.brand.editor}
                </div>
                <div>
                  {config.brand.city}, {config.brand.country} · {config.contact.email}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Functionalities Grid */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Layers className="w-4 h-4 text-[#2783C7]" />
            <span>Présentation des fonctionnalités</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F4F7FB] dark:bg-slate-800 border border-[#E1E7EF] dark:border-slate-700 text-[#163B65] dark:text-sky-400 font-extrabold text-xs flex items-center justify-center tabular-nums">
                  0{idx + 1}
                </div>
                <h2 className="font-bold text-sm text-[#163B65] dark:text-white">
                  {feat.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto mt-10 pt-5 border-t border-[#E1E7EF] dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          © {new Date().getFullYear()} {config.brand.editor} — {config.brand.tagline}
        </span>
        <span className="tabular-nums">
          {config.appShortName} · v{config.version}
        </span>
      </footer>
    </div>
  );
};
