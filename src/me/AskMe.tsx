import { useEffect, useRef, useState } from 'react';
import { FAQ, SCENES, type SceneId } from '../content';
import { PixelMe } from './PixelMe';
import { useTypewriter } from './useTypewriter';

type Props = { onGo: (scene: SceneId) => void; onReplay: () => void; hidden?: boolean };

type Mode = { kind: 'prompt' } | { kind: 'menu' } | { kind: 'answer'; i: number };

/** Pixel me under my name, with a speech bubble you can ask questions through. */
export function AskMe({ onGo, onReplay, hidden }: Props) {
  const [mode, setMode] = useState<Mode>({ kind: 'prompt' });
  const faq = mode.kind === 'answer' ? FAQ[mode.i] : undefined;
  const { shown, done, finish } = useTypewriter(faq?.a ?? '');
  const bubble = useRef<HTMLDivElement>(null);

  // keep focus inside the bubble as it changes, so keyboard users aren't dropped
  useEffect(() => {
    if (mode.kind === 'prompt') return;
    bubble.current?.querySelector<HTMLElement>('button, a')?.focus({ preventScroll: true });
  }, [mode]);

  const ask = (i: number) => {
    const f = FAQ[i];
    if (f?.special === 'replay') {
      setMode({ kind: 'prompt' });
      return onReplay();
    }
    setMode({ kind: 'answer', i });
  };

  // >> in the corner: finish the line, or once it's out, go on to the next question
  const nextQuestion = () => {
    if (mode.kind !== 'answer') return;
    if (!done) return finish();
    let i = mode.i;
    do i = (i + 1) % FAQ.length;
    while (FAQ[i]?.special);
    setMode({ kind: 'answer', i });
  };

  const talking = mode.kind === 'answer' && !done;
  const scene = faq?.go ? SCENES.find((s) => s.id === faq.go) : undefined;

  return (
    <div className={'askme' + (hidden ? ' gone' : '')}>
      <button
        type="button"
        className="askme-me"
        onClick={() => setMode(mode.kind === 'prompt' ? { kind: 'menu' } : mode)}
        aria-label="Ask Emilie a question"
        tabIndex={-1}
      >
        <PixelMe mood={talking ? 'talk' : mode.kind === 'menu' ? 'think' : 'idle'} height={150} />
      </button>

      <div className={'bubble bubble-' + mode.kind} ref={bubble} aria-live="polite">
        {mode.kind === 'prompt' && (
          <button type="button" className="bubble-ask" onClick={() => setMode({ kind: 'menu' })}>
            Ask me anything! <span aria-hidden="true">▸</span>
          </button>
        )}

        {mode.kind === 'menu' && (
          <>
            <p className="bubble-h">What would you like to know?</p>
            <ul className="bubble-qs">
              {FAQ.map((f, i) => (
                <li key={f.q}>
                  <button type="button" onClick={() => ask(i)}>
                    <span aria-hidden="true">▸</span> {f.q}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="bubble-x" onClick={() => setMode({ kind: 'prompt' })} aria-label="Close">
              ×
            </button>
          </>
        )}

        {mode.kind === 'answer' && faq && (
          <>
            <p className="bubble-q">{faq.q}</p>
            <p className="bubble-a" onClick={finish}>
              <span aria-hidden="true">{shown}</span>
              <span className="sr-only">{faq.a}</span>
            </p>
            <div className={'bubble-acts' + (done ? ' on' : '')}>
              {scene && (
                <button type="button" className="bubble-go" onClick={() => onGo(scene.id)}>
                  View {scene.label} <span aria-hidden="true">▸</span>
                </button>
              )}
              {faq.links?.map((l) => (
                <a key={l.href} className="bubble-go" href={l.href} target={l.href.startsWith('mailto') ? undefined : '_blank'} rel="noopener">
                  {l.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
              <button type="button" className="bubble-more" onClick={() => setMode({ kind: 'menu' })}>
                Ask something else
              </button>
            </div>
            <button
              type="button"
              className={'bubble-ff' + (done ? ' ready' : '')}
              onClick={nextQuestion}
              aria-label={done ? 'Next question' : 'Skip to the end'}
            >
              »
            </button>
          </>
        )}
      </div>
    </div>
  );
}
