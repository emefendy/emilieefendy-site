import { REPO } from './content';

/** For anyone who opens the console. */
export function sayHello() {
  console.log(
    '%cHey! Glad you’re here :)',
    'font: 600 20px/1.4 "Departure Mono", ui-monospace, monospace; color: #e8b25c; padding: 6px 0;',
  );
  console.log(
    `%cThanks for poking around. The site is React and TypeScript, and the source maps are on so you can read it in the Sources tab. The repo is ${REPO}.\n\nTry clicking a bird, or press ⌘K.`,
    'font: 13px/1.6 ui-monospace, monospace; color: #b9ad98;',
  );
}
