import { useEffect, useRef, useState } from 'react';
import { EMAIL, SOCIALS } from '../content';
import { copyText } from '../lib/clipboard';

export function Footer() {
  const addr = useRef<HTMLSpanElement>(null);
  const [label, setLabel] = useState<'copy' | 'copied' | 'selected'>('copy');

  useEffect(() => {
    if (label === 'copy') return;
    const id = setTimeout(() => setLabel('copy'), 1600);
    return () => clearTimeout(id);
  }, [label]);

  const onCopy = async () => {
    if (await copyText(EMAIL)) return setLabel('copied');
    // clipboard blocked: select the address so a manual copy is one keystroke
    const el = addr.current;
    if (!el) return;
    const r = document.createRange();
    r.selectNodeContents(el);
    const s = getSelection();
    s?.removeAllRanges();
    s?.addRange(r);
    setLabel('selected');
  };

  return (
    <footer>
      <div className="say">
        <span>Say hi:</span>
        <span className="addr" ref={addr}>
          {EMAIL}
        </span>
        <button className="copy" type="button" onClick={onCopy} aria-live="polite">
          {label}
        </button>
      </div>
      <div className="foot-links">
        <a href={SOCIALS.github} target="_blank" rel="noopener">
          github
        </a>
        <a href={SOCIALS.linkedin} target="_blank" rel="noopener">
          linkedin
        </a>
      </div>
    </footer>
  );
}
