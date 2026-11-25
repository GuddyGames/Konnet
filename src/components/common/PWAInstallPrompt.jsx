import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIOS(ios);

    if (standalone || localStorage.getItem('konnet_install_dismissed') === 'true') {
      setDismissed(true);
      return;
    }

    const handleInstallAvailable = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };

    const handleInstalled = () => {
      setInstallEvent(null);
      setDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallAvailable);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem('konnet_install_dismissed', 'true');
    setDismissed(true);
    setShowIOSHelp(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice?.outcome === 'accepted') setDismissed(true);
  };

  if (dismissed || (!installEvent && !isIOS)) return null;

  return (
    <aside className="fixed bottom-24 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start gap-3">
        <img src="/icons/konnet-icon.svg" alt="" className="h-12 w-12 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 dark:text-white">Install Konnet</p>
          <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-300">
            Add Konnet to your home screen for an app-like experience.
          </p>
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss install prompt" className="rounded-full px-2 text-xl text-gray-400">×</button>
      </div>

      {isIOS ? (
        <>
          <button type="button" onClick={() => setShowIOSHelp((value) => !value)} className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
            How to install on iPhone
          </button>
          {showIOSHelp && (
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-300">
              <li>Open this page in Safari.</li>
              <li>Tap the Share icon.</li>
              <li>Choose “Add to Home Screen”, then tap Add.</li>
            </ol>
          )}
        </>
      ) : (
        <button type="button" onClick={install} className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
          Install app
        </button>
      )}
    </aside>
  );
}
