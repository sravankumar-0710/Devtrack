import { useCallback, useRef, useState } from "react";

/**
 * useDocumentPiP — pop a piece of UI out into its own small floating window.
 *
 * Primary path: the Document Picture-in-Picture API (Chrome / Edge 116+).
 * This gives a real always-on-top mini window with no browser chrome —
 * it stays visible even when you switch tabs or apps, same as a YouTube
 * video's PiP player.
 *
 * Fallback: a plain `window.open` popup for browsers that don't support
 * Document PiP yet (Firefox, Safari). It's a normal separate window —
 * not guaranteed to stay on top — but it still detaches from the page.
 *
 * Usage:
 *   const pip = useDocumentPiP();
 *   const win = await pip.open({ width: 260, height: 160 });
 *   // mount a React root into win.document, keep pip.rootRef.current
 *   // updated on every render you want reflected in the popped-out window
 *   pip.close();
 */
export function useDocumentPiP() {
  const [pipWindow, setPipWindow] = useState(null);
  const rootRef = useRef(null);

  const isPiPSupported =
    typeof window !== "undefined" && "documentPictureInPicture" in window;

  const copyStyles = useCallback((targetDoc) => {
    [...document.styleSheets].forEach((sheet) => {
      try {
        const css = [...sheet.cssRules].map((r) => r.cssText).join("\n");
        const style = targetDoc.createElement("style");
        style.textContent = css;
        targetDoc.head.appendChild(style);
      } catch {
        // Cross-origin/unreadable sheet — link it in instead
        if (sheet.href) {
          const link = targetDoc.createElement("link");
          link.rel = "stylesheet";
          link.href = sheet.href;
          targetDoc.head.appendChild(link);
        }
      }
    });
  }, []);

  const open = useCallback(async ({ width = 260, height = 160 } = {}) => {
    if (pipWindow) return pipWindow; // already open, reuse it

    if (isPiPSupported) {
      const pip = await window.documentPictureInPicture.requestWindow({ width, height });
      copyStyles(pip.document);
      pip.document.body.style.margin = "0";
      pip.document.body.style.background = "#0B1220";
      pip.document.title = "DevTrack Timer";

      pip.addEventListener("pagehide", () => {
        setPipWindow(null);
        rootRef.current = null;
      });

      setPipWindow(pip);
      return pip;
    }

    // Fallback — plain small popup window
    const popup = window.open(
      "",
      "devtrack-timer",
      `popup=yes,width=${width},height=${height},left=120,top=120`
    );
    if (!popup) return null; // blocked by the browser's popup blocker

    popup.document.title = "DevTrack Timer";
    popup.document.body.style.margin = "0";
    popup.document.body.style.background = "#0B1220";
    copyStyles(popup.document);

    const closeCheck = setInterval(() => {
      if (popup.closed) {
        clearInterval(closeCheck);
        setPipWindow(null);
        rootRef.current = null;
      }
    }, 500);

    setPipWindow(popup);
    return popup;
  }, [pipWindow, isPiPSupported, copyStyles]);

  const close = useCallback(() => {
    if (pipWindow) pipWindow.close();
    setPipWindow(null);
    rootRef.current = null;
  }, [pipWindow]);

  return { pipWindow, open, close, isPiPSupported, rootRef };
}
