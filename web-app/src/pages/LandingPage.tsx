import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-gray-100 overflow-x-hidden">
      {/* Hero */}
      <header className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-12 sm:pb-24">
        <nav className="flex items-center justify-between max-w-6xl mx-auto mb-16 sm:mb-24">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>🧠</span>
            <span className="font-display font-semibold text-xl text-white">Neuro-Recover</span>
          </div>
          <Link
            to="/app"
            className="tap-target rounded-xl bg-brand-500 text-white font-medium px-5 py-2.5 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-surface transition-colors"
          >
            Start Rehab
          </Link>
        </nav>

        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <p className="text-brand-400 font-medium text-sm sm:text-base uppercase tracking-wider mb-4">
            AI-Powered Stroke Rehabilitation
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
            Turn recovery into&nbsp;<span className="text-brand-400">games</span>.
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Hand tracking, adaptive exercises, and objective progress metrics — like Duolingo meets your physio, powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/app"
              className="tap-target w-full sm:w-auto rounded-xl bg-brand-500 text-white font-semibold px-8 py-4 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-surface transition-all shadow-lg shadow-brand-500/20"
            >
              Get started
            </Link>
            <a
              href="#how-it-works"
              className="tap-target w-full sm:w-auto rounded-xl border border-gray-600 text-gray-200 font-medium px-8 py-4 hover:border-brand-500 hover:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-surface transition-colors"
            >
              How it works
            </a>
          </div>
        </div>

        {/* Subtle gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl pointer-events-none" aria-hidden />
      </header>

      {/* How it works */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-surface-elevated">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white text-center mb-4">
            How it works
          </h2>
          <p className="text-gray-400 text-center max-w-xl mx-auto mb-12">
            Vision and voice for motor and speech practice, with AI-generated progress reports.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: '🎹', title: 'Virtual Piano', desc: 'Each finger mapped to a key. Improves finger isolation, reaction time, and extension.' },
              { icon: '🫧', title: 'Bubble Popper', desc: 'Reach, pinch, and pop bubbles. Builds reach and pinch control.' },
              { icon: '📊', title: 'Progress analytics', desc: 'ROM, smoothness, tremor, and fatigue — objective biomarkers of recovery.' },
              { icon: '🔘', title: 'Button', desc: 'Pinch or tap the button. ADL: buttoning.' },
              { icon: '🎯', title: 'Reach & hold', desc: 'Reach the target and hold. Builds reach and stability.' },
              { icon: '👆', title: 'Finger tap', desc: 'Tap in sequence. Finger isolation and coordination.' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="rounded-2xl bg-surface p-6 sm:p-8 border border-gray-800 hover:border-gray-700 transition-colors animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="text-3xl mb-4 block" aria-hidden>{item.icon}</span>
                <h3 className="font-display font-semibold text-lg text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-4">
            Ready to start?
          </h2>
          <p className="text-gray-400 mb-8">
            Use your device camera for hand tracking. Works best in good lighting.
          </p>
          <Link
            to="/app"
            className="tap-target inline-flex rounded-xl bg-brand-500 text-white font-semibold px-8 py-4 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-surface transition-colors"
          >
            Open Neuro-Recover
          </Link>
        </div>
      </section>

      <footer className="px-4 py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <span>© 2026 Neuro-Recover — AI-Powered Stroke Rehabilitation</span>
          <span>The MedGemma Impact Challenge</span>
        </div>
      </footer>
    </div>
  );
}
