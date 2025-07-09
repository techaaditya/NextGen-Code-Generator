declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

interface ImportMeta {
  env: {
    VITE_GEMINI_API_KEY: string;
    [key: string]: any;
  };
}
