import type { Deck, Slide } from '../content';
import { cx } from '../lib/cx';

type Props = {
  deck: Deck;
  layout: 'wide' | 'portrait';
  onOpen: (slides: Slide[], index: number) => void;
};

export function SlideStrip({ deck, layout, onOpen }: Props) {
  return (
    <div className={cx('deck', `deck-${layout}`)}>
      <p className="deck-label">{deck.label}</p>
      <div className="deck-strip">
        {deck.slides.map((slide, i) => (
          <button
            key={slide.full}
            type="button"
            className="deck-thumb"
            aria-label={`Open ${slide.label}`}
            onClick={() => onOpen(deck.slides, i)}
          >
            <img src={slide.thumb} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
