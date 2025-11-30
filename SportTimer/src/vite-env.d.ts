/// <reference types="vite/client" />

declare module '*.svg?raw' {
  const content: string;
  export default content;
}

declare module '@static/shared/assets/icons/*.svg?raw' {
  const content: string;
  export default content;
}

