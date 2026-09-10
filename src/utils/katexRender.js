import katex from 'katex';

/**
 * Convierte un string de LaTeX a HTML usando KaTeX de manera segura
 */
export function renderLatex(latexString) {
  if (!latexString) return '';
  try {
    return katex.renderToString(latexString, {
      displayMode: false,
      throwOnError: false
    });
  } catch (err) {
    console.error('Error renderizando KaTeX:', err);
    return latexString;
  }
}

export function renderBlockLatex(latexString) {
  if (!latexString) return '';
  try {
    return katex.renderToString(latexString, {
      displayMode: true,
      throwOnError: false
    });
  } catch (err) {
    console.error('Error renderizando KaTeX:', err);
    return latexString;
  }
}
