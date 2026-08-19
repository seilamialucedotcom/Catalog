import { useEffect, useRef, useState } from 'react';
import { Bold, Highlighter, Italic, List, ListOrdered, Underline } from 'lucide-react';

const allowedTags = {
  P: 'p',
  BR: 'br',
  STRONG: 'strong',
  B: 'strong',
  EM: 'em',
  I: 'em',
  UL: 'ul',
  OL: 'ol',
  LI: 'li',
  MARK: 'mark',
  U: 'u',
  UNDERLINE: 'u',
};

const ignoredTags = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'SVG', 'MATH']);

function plainTextToHtml(value) {
  const container = document.createElement('div');
  String(value).split(/\r?\n/).forEach((line) => {
    const paragraph = document.createElement('p');
    if (line) paragraph.textContent = line;
    else paragraph.append(document.createElement('br'));
    container.append(paragraph);
  });
  return container.innerHTML;
}

// Solo se conserva el formato que este editor puede crear. No se aceptan atributos.
export function sanitizeRichText(value) {
  const source = String(value || '').trim();
  if (!source) return '';

  if (typeof DOMParser === 'undefined') return source.replace(/<[^>]*>/g, '');
  if (!/<\/?[a-z][^>]*>/i.test(source)) return plainTextToHtml(source);

  const parsed = new DOMParser().parseFromString(source, 'text/html');
  const container = document.createElement('div');

  const appendSafeNode = (node, parent) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.append(document.createTextNode(node.textContent || ''));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName === 'SPAN' && node.style.backgroundColor
      ? 'mark'
      : allowedTags[node.tagName];
    if (ignoredTags.has(node.tagName)) return;

    const destination = tag ? document.createElement(tag) : parent;
    Array.from(node.childNodes).forEach((child) => appendSafeNode(child, destination));
    if (tag) parent.append(destination);
  };

  Array.from(parsed.body.childNodes).forEach((node) => appendSafeNode(node, container));
  return container.textContent?.trim() ? container.innerHTML : '';
}

export function RichTextContent({ value, className = '' }) {
  const html = sanitizeRichText(value);
  return <div className={`product-rich-text ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function RichTextDescriptionEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [activeCommands, setActiveCommands] = useState({});

  useEffect(() => {
    const editor = editorRef.current;
    const html = sanitizeRichText(value);
    if (editor && editor.innerHTML !== html) editor.innerHTML = html;
  }, [value]);

  const commit = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = sanitizeRichText(editor.innerHTML);
    if (editor.innerHTML !== html) editor.innerHTML = html;
    onChange(html);
  };

  const updateActiveStates = () => {
    const editor = editorRef.current;
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    if (!editor || !sel || !sel.anchorNode) {
      setActiveCommands((prev) => ({ ...prev, bold: false, italic: false, underline: false, insertUnorderedList: false, insertOrderedList: false, hiliteColor: false }));
      return;
    }

    const isInside = editor.contains(sel.anchorNode) || editor.contains(sel.focusNode);
    if (!isInside) return;

    const states = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    };

    // underline: prefer queryCommandState, but fallback to detecting <u> ancestors
    let underlineState = false;
    try {
      underlineState = document.queryCommandState('underline');
    } catch (e) {
      underlineState = false;
    }
    if (!underlineState) {
      const anchorNode = sel.anchorNode;
      const focusNode = sel.focusNode;
      const nodeHasU = (node) => {
        if (!node) return false;
        if (node.nodeType === 3) node = node.parentElement;
        return !!(node && node.closest && node.closest('u'));
      };
      if (nodeHasU(anchorNode) || nodeHasU(focusNode)) underlineState = true;
    }
    states.underline = underlineState;

    let hilite = false;
    try {
      const val = document.queryCommandValue('hiliteColor') || document.queryCommandValue('backColor');
      if (val && String(val).trim() && val !== 'transparent' && val !== 'none') hilite = true;
    } catch (e) {
      // ignore
    }
    states.hiliteColor = hilite;

    setActiveCommands(states);
  };

  useEffect(() => {
    // update when selection or mouse/keyboard interaction changes
    document.addEventListener('selectionchange', updateActiveStates);
    document.addEventListener('keyup', updateActiveStates);
    document.addEventListener('mouseup', updateActiveStates);
    return () => {
      document.removeEventListener('selectionchange', updateActiveStates);
      document.removeEventListener('keyup', updateActiveStates);
      document.removeEventListener('mouseup', updateActiveStates);
    };
  }, []);

  const applyFormat = (command, value = null) => {
    editorRef.current?.focus();

    // Fallback for underline if execCommand is not supported
    if (command === 'underline' && !(document.queryCommandSupported && document.queryCommandSupported('underline'))) {
      const sel = typeof window !== 'undefined' ? window.getSelection() : null;
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        if (!range.collapsed) {
          const u = document.createElement('u');
          u.appendChild(range.extractContents());
          range.insertNode(u);
          commit();
          setTimeout(updateActiveStates, 0);
          return;
        }
      }
    }

    document.execCommand(command, false, value);
    // commit changes and refresh active state after the browser applies the command
    commit();
    setTimeout(updateActiveStates, 0);
  };

  const pastePlainText = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    commit();
  };

  const tools = [
    { command: 'bold', label: 'Negrita', Icon: Bold },
    { command: 'italic', label: 'Cursiva', Icon: Italic },
    { command: 'underline', label: 'Subrayado', Icon: Underline },
    { command: 'hiliteColor', value: '#facc15', label: 'Resaltar en amarillo', Icon: Highlighter },
    { command: 'insertUnorderedList', label: 'Lista con viñetas', Icon: List },
    { command: 'insertOrderedList', label: 'Lista numerada', Icon: ListOrdered },
  ];

  return (
    <div className="rich-text-editor rounded-xl border border-[#333333] bg-[#242424] focus-within:border-[#d99000]">
      <div className="flex items-center gap-1 border-b border-[#333333] p-1.5" role="toolbar" aria-label="Formato de descripción">
        {tools.map(({ command, value: toolValue, label, Icon }) => (
          <button
            key={command}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat(command, toolValue)}
            className={`rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-[#363636] hover:text-[#d99000] focus:outline-none focus:ring-1 focus:ring-[#d99000] ${activeCommands[command] ? 'bg-[#363636] text-[#d99000]' : ''}`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder="Escribe la descripción del producto"
        onInput={() => { commit(); updateActiveStates(); }}
        onPaste={pastePlainText}
        className="product-rich-text rich-text-editor__content min-h-24 p-2.5 text-xs leading-relaxed text-slate-100 outline-none"
      />
    </div>
  );
}
