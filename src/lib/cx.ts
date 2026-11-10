/** Joins the truthy class names: cx('row', open && 'open') */
export const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ');
