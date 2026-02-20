import { Link } from 'react-router-dom';

/**
 * Placeholder for VR/AR mode (Phase 5 / enhancement 17).
 * See docs/VR_AR_ROADMAP.md for implementation roadmap.
 */
export function VrPlaceholder() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-4">
          VR/AR mode
        </h1>
        <p className="text-gray-400 mb-6">
          Immersive rehab with hand tracking in headset (Quest, Vision Pro) is planned for a future release.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          See <code className="bg-surface-muted px-1 rounded">docs/VR_AR_ROADMAP.md</code> for the implementation roadmap.
        </p>
        <Link
          to="/app"
          className="tap-target inline-flex rounded-xl bg-brand-500 px-4 py-2 text-white font-medium hover:bg-brand-600"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
