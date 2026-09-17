import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  addColumnAfter,
  addRowAfter,
  deleteColumn,
  deleteRow,
  deleteTable,
} from "@tiptap/pm/tables";
import { Icon } from "../../ui/Icon";
import { Modal } from "../Modal";
import { safeUrl } from "../../../lib/safety";
import {
  embedUrl,
  wordCount,
  type DocNode,
  type ImageAsset,
} from "../../../lib/creator/model";
import {
  GalleryBlock,
  EmbedBlock,
  TaskList,
  TaskItem,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  tableTemplate,
} from "./extensions";
import type { AssetUrls } from "./DocumentPreview";
const EnhancedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      asset: { default: null, renderHTML: () => ({}) },
      decorative: { default: false, renderHTML: () => ({}) },
      caption: { default: "", renderHTML: () => ({}) },
      credit: { default: "", renderHTML: () => ({}) },
    };
  },
});
export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    link: {
      openOnClick: false,
      protocols: ["http", "https"],
      isAllowedUri: (url: string) => !!safeUrl(url),
    },
    codeBlock: { HTMLAttributes: { class: "code-block" } },
  }),
  EnhancedImage.configure({ allowBase64: false }),
  Placeholder.configure({
    placeholder:
      "Írj valamit, ami megérdemel egy kis figyelmet…\nTipp: a / billentyűvel blokkot szúrhatsz be.",
  }),
  CharacterCount,
  GalleryBlock,
  EmbedBlock,
  TaskList,
  TaskItem,
  Table,
  TableRow,
  TableCell,
  TableHeader,
];
export function BlockEditor({
  document,
  onChange,
  onReady,
  onMedia,
  urls,
}: {
  document: DocNode;
  onChange: (d: DocNode) => void;
  onReady: (e: Editor | null) => void;
  onMedia: () => void;
  urls: AssetUrls;
}) {
  const changed = useRef(onChange);
  changed.current = onChange;
  const [version, redraw] = useState(0),
    [slash, setSlash] = useState(false),
    [selected, setSelected] = useState(0),
    [dialog, setDialog] = useState<"link" | "video" | null>(null),
    [value, setValue] = useState(""),
    [error, setError] = useState("");
  const editor = useEditor({
    extensions: editorExtensions,
    content: document,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": "Cikk tartalma",
        role: "textbox",
        "aria-multiline": "true",
        spellcheck: "true",
      },
      handleKeyDown: (_view, e) => {
        if (e.key === "Escape") {
          setSlash(false);
          return false;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      changed.current(e.getJSON() as DocNode);
      const { from } = e.state.selection;
      const before = e.state.doc.textBetween(Math.max(0, from - 2), from, "\n");
      setSlash(before.endsWith("/") && e.state.selection.empty);
      setSelected(0);
      redraw((x) => x + 1);
    },
    onSelectionUpdate: () => redraw((x) => x + 1),
  });
  useEffect(() => {
    onReady(editor);
    return () => onReady(null);
  }, [editor, onReady]);
  // Blob URLs are for rendering only; canonical /media/uploads paths remain in the saved JSON.
  useEffect(() => {
    if (!editor) return;
    const root = editor.view.dom;
    const update = () =>
      root.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
        const nodes: ImageAsset[] = [];
        editor.state.doc.descendants((n) => {
          if (n.type.name === "image" && n.attrs.asset)
            nodes.push(n.attrs.asset);
        });
        const asset = nodes.find(
          (a) =>
            a.src === img.getAttribute("src") ||
            urls[a.id] === img.getAttribute("src"),
        );
        if (asset && urls[asset.id] && img.src !== urls[asset.id])
          img.src = urls[asset.id];
      });
    update();
    const ob = new MutationObserver(update);
    ob.observe(root, { childList: true, subtree: true });
    return () => ob.disconnect();
  }, [editor, urls, version]);
  if (!editor)
    return (
      <div className="tiptap" role="status">
        Szerkesztő betöltése…
      </div>
    );
  const commands = [
    {
      label: "Címsor",
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Idézet",
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Felsorolás",
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Számozott lista",
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Kódblokk",
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: "Feladatlista",
      run: () =>
        editor
          .chain()
          .focus()
          .insertContent({
            type: "taskList",
            content: [
              {
                type: "taskItem",
                attrs: { checked: false },
                content: [{ type: "paragraph" }],
              },
            ],
          })
          .run(),
    },
    {
      label: "Táblázat",
      run: () => editor.chain().focus().insertContent(tableTemplate()).run(),
    },
    { label: "Kép vagy galéria", run: onMedia },
    {
      label: "Videó beágyazása",
      run: () => {
        setValue("");
        setError("");
        setDialog("video");
      },
    },
    {
      label: "Elválasztó",
      run: () => editor.chain().focus().setHorizontalRule().run(),
    },
  ];
  const runSlash = (i: number) => {
    const from = editor.state.selection.from;
    editor
      .chain()
      .focus()
      .deleteRange({ from: Math.max(0, from - 1), to: from })
      .run();
    setSlash(false);
    commands[i].run();
  };
  const tool = (
    label: string,
    name: Parameters<typeof Icon>[0]["name"],
    run: () => void,
    active = false,
    disabled = false,
  ) => (
    <button
      type="button"
      className="icon-btn"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={run}
    >
      <Icon name={name} />
    </button>
  );
  const tableCommand = (command: typeof addRowAfter) => {
    editor
      .chain()
      .focus()
      .command(({ state, dispatch }) => command(state, dispatch))
      .run();
  };
  return (
    <div
      style={{ position: "relative" }}
      onKeyDownCapture={(e) => {
        if (!slash) return;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          e.stopPropagation();
          setSelected(
            (i) =>
              (i + (e.key === "ArrowDown" ? 1 : -1) + commands.length) %
              commands.length,
          );
        }
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          runSlash(selected);
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setSlash(false);
        }
      }}
    >
      <div className="block-toolbar" role="toolbar" aria-label="Szövegformázás">
        <select
          aria-label="Bekezdés típusa"
          value={
            editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
                ? "3"
                : editor.isActive("heading", { level: 4 })
                  ? "4"
                  : "p"
          }
          onChange={(e) =>
            e.target.value === "p"
              ? editor.chain().focus().setParagraph().run()
              : editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: Number(e.target.value) as 2 | 3 | 4 })
                  .run()
          }
        >
          <option value="p">Bekezdés</option>
          <option value="2">Címsor 2</option>
          <option value="3">Címsor 3</option>
          <option value="4">Címsor 4</option>
        </select>
        <span className="toolbar-separator" />
        {tool(
          "Félkövér",
          "bold",
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive("bold"),
        )}
        {tool(
          "Dőlt",
          "italic",
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive("italic"),
        )}
        <button
          type="button"
          className="icon-btn text-tool"
          aria-label="Aláhúzás"
          aria-pressed={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </button>
        <button
          type="button"
          className="icon-btn text-tool"
          aria-label="Áthúzás"
          aria-pressed={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </button>
        {tool(
          "Hivatkozás",
          "link",
          () => {
            setValue(editor.getAttributes("link").href || "");
            setError("");
            setDialog("link");
          },
          editor.isActive("link"),
        )}
        <span className="toolbar-separator" />
        {tool(
          "Felsorolás",
          "list",
          () => editor.chain().focus().toggleBulletList().run(),
          editor.isActive("bulletList"),
        )}
        {tool(
          "Idézet",
          "quote",
          () => editor.chain().focus().toggleBlockquote().run(),
          editor.isActive("blockquote"),
        )}
        {tool(
          "Kódblokk",
          "code",
          () => editor.chain().focus().toggleCodeBlock().run(),
          editor.isActive("codeBlock"),
        )}
        {tool("Média beszúrása", "image", onMedia)}
        <select
          aria-label="Blokk beszúrása"
          value=""
          onChange={(e) => {
            const i = Number(e.target.value);
            if (e.target.value !== "") commands[i].run();
          }}
        >
          <option value="">+ Blokk</option>
          {commands.map((c, i) => (
            <option key={c.label} value={i}>
              {c.label}
            </option>
          ))}
        </select>
        <span className="toolbar-separator" />
        {tool(
          "Visszavonás",
          "undo",
          () => editor.chain().focus().undo().run(),
          false,
          !editor.can().undo(),
        )}
        {tool(
          "Újra",
          "redo",
          () => editor.chain().focus().redo().run(),
          false,
          !editor.can().redo(),
        )}
      </div>
      {editor.isActive("table") && (
        <div className="block-toolbar" aria-label="Táblázatműveletek">
          {[
            ["Sor +", addRowAfter],
            ["Oszlop +", addColumnAfter],
            ["Sor −", deleteRow],
            ["Oszlop −", deleteColumn],
            ["Táblázat törlése", deleteTable],
          ].map(([label, command]) => (
            <button
              key={String(label)}
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => tableCommand(command as typeof addRowAfter)}
            >
              {String(label)}
            </button>
          ))}
        </div>
      )}
      <EditorContent editor={editor} />
      {slash && (
        <div className="slash-menu" role="listbox" aria-label="Blokk beszúrása">
          <div className="slash-menu-title">Válassz blokkot · ↑ ↓ Enter</div>
          {commands.map((c, i) => (
            <button
              key={c.label}
              type="button"
              role="option"
              aria-selected={selected === i}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runSlash(i)}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      <div className="editor-bottom">
        <span>
          {wordCount(document)} szó ·{" "}
          {Math.max(1, Math.ceil(wordCount(document) / 210))} perc olvasás
        </span>
        <span>Formázás: Ctrl/⌘ B, I, Z · Blokkok: /</span>
      </div>
      {dialog && (
        <Modal
          title={
            dialog === "link" ? "Hivatkozás szerkesztése" : "Videó beágyazása"
          }
          onClose={() => setDialog(null)}
          footer={
            <>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setDialog(null)}
              >
                Mégse
              </button>
              {dialog === "link" && (
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetLink().run();
                    setDialog(null);
                  }}
                >
                  Eltávolítás
                </button>
              )}
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  if (dialog === "link") {
                    const href = safeUrl(value.trim());
                    if (!href) {
                      setError(
                        "Adj meg biztonságos HTTPS/HTTP vagy helyi hivatkozást.",
                      );
                      return;
                    }
                    const chain = editor
                      .chain()
                      .focus()
                      .extendMarkRange("link");
                    if (editor.state.selection.empty)
                      chain
                        .insertContent({
                          type: "text",
                          text: value,
                          marks: [{ type: "link", attrs: { href } }],
                        })
                        .run();
                    else chain.setLink({ href }).run();
                  } else {
                    if (!embedUrl(value)) {
                      setError(
                        "YouTube- vagy Vimeo-videó HTTPS-hivatkozása szükséges.",
                      );
                      return;
                    }
                    editor
                      .chain()
                      .focus()
                      .insertContent({
                        type: "embedBlock",
                        attrs: { url: value, title: "Videó" },
                      })
                      .run();
                  }
                  setDialog(null);
                }}
              >
                Beszúrás
              </button>
            </>
          }
        >
          <label className="form-label" htmlFor="block-url">
            {dialog === "link" ? "Hivatkozás címe" : "YouTube vagy Vimeo URL"}
          </label>
          <input
            id="block-url"
            autoFocus
            className="form-input"
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={!!error}
          />
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          {dialog === "video" && (
            <p className="form-hint">
              Külső kód nem illeszthető be. A videó az olvasónál csak külön
              kattintás után töltődik be.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
