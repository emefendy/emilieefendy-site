import { useEffect, useRef, useState } from 'react';
import { FAQ, SCENES, type SceneId } from '../content';
import { cx } from '../lib/cx';
import { PixelMe } from './PixelMe';
import { usePoke } from './usePoke';
import { useTypewriter } from './useTypewriter';

type Props = { onGo: (scene: SceneId) => void };

type Mode = { kind: 'prompt' } | { kind: 'menu' } | { kind: 'answer'; i: number };

/** Pixel me under my name, and a speech bubble that answers a few questions. */
export function AskMe({ onGo }: Props) {
  const [mode, setMode] = useState<Mode>({ kind: 'prompt' });
  const faq = mode.kind === 'answer' ? FAQ[mode.i] : undefined;
  const { shown, done, finish } = useTypewriter(faq?.a ?? '');
  const bubble = useRef<HTMLDivElement>(null);
  const [poked, poke] = usePoke();

  // keep focus inside the bubble as it changes, so keyboard users aren't dropped
  useEffect(() => {
    if (mode.kind === 'prompt') return;
    bubble.current?.querySelector<HTMLElement>('button, a')?.focus({ preventScroll: true });
  }, [mode]);

  const ask = (i: number) => setMode({ kind: 'answer', i });
  const close = () => setMode({ kind: 'prompt' });

  // » finishes the line, then moves on to the next question
  const fastForward = () => {
    if (mode.kind !== 'answer') return;
    if (!done) return finish();
    ask((mode.i + 1) % FAQ.length);
  };

  const talking = mode.kind === 'answer' && !done;
  const scene = faq?.go ? SCENES.find((s) => s.id === faq.go) : undefined;

  return (
    <div className="askme">
      <button
        type="button"
        className={cx('askme-me', poked && 'poked')}
        onClick={poke}
        aria-label="Poke Emilie"
        tabIndex={-1}
      >
        <PixelMe mood={poked ? 'surprised' : talking ? 'talk' : mode.kind === 'menu' ? 'think' : 'idle'} height={150} />
      </button>

      <div className={cx('bubble', `bubble-${mode.kind}`)} ref={bubble} aria-live="polite">
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
            <CloseButton onClick={close} />
          </>
        )}

        {mode.kind === 'answer' && faq && (
          <>
            <CloseButton onClick={close} />
            <p className="bubble-q">{faq.q}</p>
            <p className="bubble-a" onClick={finish}>
              <span aria-hidden="true">{shown}</span>
              <span className="sr-only">{faq.a}</span>
            </p>
            <div className={cx('bubble-acts', done && 'on')}>
              {scene && (
                <button type="button" className="bubble-go" onClick={() => onGo(scene.id)}>
                  View {scene.label} <span aria-hidden="true">▸</span>
                </button>
              )}
              {faq.links?.map((l) => (
                <a
                  key={l.href}
                  className="bubble-go"
                  href={l.href}
                  {...(l.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener' })}
                >
                  {l.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
              <button type="button" className="bubble-more" onClick={() => setMode({ kind: 'menu' })}>
                Ask something else
              </button>
            </div>
            <button
              type="button"
              className={cx('bubble-ff', done && 'ready')}
              onClick={fastForward}
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

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="bubble-x" onClick={onClick} aria-label="Close">
      ×
    </button>
  );
}
