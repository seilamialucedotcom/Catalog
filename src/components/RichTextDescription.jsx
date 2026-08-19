import { useEffect, useRef } from 'react';
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

  const applyFormat = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    commit();
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
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-[#363636] hover:text-[#d99000] focus:outline-none focus:ring-1 focus:ring-[#d99000]"
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
        onInput={commit}
        onPaste={pastePlainText}
        className="product-rich-text rich-text-editor__content min-h-24 p-2.5 text-xs leading-relaxed text-slate-100 outline-none"
      />
    </div>
  );
}
