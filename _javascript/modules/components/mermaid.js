/**
 * Mermaid-js loader
 */

const MERMAID = 'mermaid';
const themeMapper = Theme.getThemeMapper('default', 'dark');

function refreshTheme(event) {
  if (event.source === window && event.data && event.data.id === Theme.ID) {
    // Re-render the SVG › <https://github.com/mermaid-js/mermaid/issues/311#issuecomment-332557344>
    const mermaidList = document.getElementsByClassName(MERMAID);

    [...mermaidList].forEach((elem) => {
      const svgCode = elem.previousSibling.children.item(0).textContent;
      elem.textContent = svgCode;
      elem.removeAttribute('data-processed');
    });

    const newTheme = themeMapper[Theme.visualState];

    mermaid.initialize({ theme: newTheme });
    mermaid.init(null, `.${MERMAID}`);
  }
}

function setNode(elem) {
  const svgCode = elem.textContent;
  const backup = elem.parentElement;
  backup.classList.add('d-none');
  // Create mermaid node
  const mermaid = document.createElement('pre');
  mermaid.classList.add(MERMAID);
  const text = document.createTextNode(svgCode);
  mermaid.appendChild(text);
  backup.after(mermaid);
}

export function loadMermaid() {
  if (
    typeof mermaid === 'undefined' ||
    typeof mermaid.initialize !== 'function'
  ) {
    return;
  }

  const initTheme = themeMapper[Theme.visualState];

  let mermaidConf = {
    theme: initTheme
  };

  // 이미 처리된 요소들을 추적하기 위한 Set
  const processedNodes = new Set();

  const basicList = document.getElementsByClassName('language-mermaid-init');
  [...basicList].forEach((elem) => {
    if (!processedNodes.has(elem)) {
      setNode(elem);
      processedNodes.add(elem);
    }
  });

  // Also handle regular mermaid blocks
  const mermaidList = document.getElementsByClassName('language-mermaid');
  [...mermaidList].forEach((elem) => {
    if (!processedNodes.has(elem)) {
      setNode(elem);
      processedNodes.add(elem);
    }
  });

  // Additional check for mermaid code blocks that might not have the language-mermaid class
  const allCodeBlocks = document.querySelectorAll('pre code');
  allCodeBlocks.forEach((codeBlock) => {
    if (!processedNodes.has(codeBlock) &&
        (codeBlock.textContent.trim().startsWith('graph') || 
         codeBlock.textContent.trim().startsWith('sequenceDiagram') ||
         codeBlock.textContent.trim().startsWith('flowchart') ||
         codeBlock.textContent.trim().startsWith('classDiagram'))) {
      codeBlock.classList.add('language-mermaid');
      setNode(codeBlock);
      processedNodes.add(codeBlock);
    }
  });

  mermaid.initialize(mermaidConf);

  if (Theme.switchable) {
    window.addEventListener('message', refreshTheme);
  }
}
