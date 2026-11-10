import 'react';

// React 18 passes `inert` through but its types don't know it yet. An empty string turns it on.
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- must match React's own signature to merge
  interface HTMLAttributes<T> {
    inert?: '' | undefined;
  }
}
