import { Node, mergeAttributes } from "@tiptap/core";
import { tableEditing, columnResizing } from "@tiptap/pm/tables";
export const GalleryBlock = Node.create({
  name: "galleryBlock",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      images: { default: [] },
      layout: { default: "editorial-grid" },
      columns: { default: 3 },
      showCaptions: { default: true },
    };
  },
  parseHTML() {
    return [{ tag: "figure[data-gallery-block]" }];
  },
  renderHTML({ node }) {
    return [
      "figure",
      { "data-gallery-block": "true", class: "editor-gallery-placeholder" },
      [
        "strong",
        {},
        `Galéria · ${node.attrs.images.length} kép · ${node.attrs.layout}`,
      ],
      ["p", {}, "A megjelenést az Előnézet fülön ellenőrizheted."],
    ];
  },
});
export const EmbedBlock = Node.create({
  name: "embedBlock",
  group: "block",
  atom: true,
  addAttributes() {
    return { url: { default: "" }, title: { default: "Videó" } };
  },
  parseHTML() {
    return [{ tag: "figure[data-embed-block]" }];
  },
  renderHTML({ node }) {
    return [
      "figure",
      { "data-embed-block": "true", class: "editor-embed-placeholder" },
      ["strong", {}, `Videó · ${node.attrs.title}`],
      ["p", {}, "Kattintásra betöltődő, külső tartalom."],
    ];
  },
});
export const TaskList = Node.create({
  name: "taskList",
  group: "block list",
  content: "taskItem+",
  parseHTML() {
    return [{ tag: 'ul[data-type="taskList"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "ul",
      mergeAttributes(HTMLAttributes, { "data-type": "taskList" }),
      0,
    ];
  },
});
export const TaskItem = Node.create({
  name: "taskItem",
  content: "paragraph block*",
  defining: true,
  addAttributes() {
    return {
      checked: {
        default: false,
        parseHTML: (el) => el.getAttribute("data-checked") === "true",
        renderHTML: (attrs) => ({ "data-checked": String(attrs.checked) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'li[data-type="taskItem"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "li",
      mergeAttributes(HTMLAttributes, { "data-type": "taskItem" }),
      0,
    ];
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement("li");
      dom.dataset.type = "taskItem";
      const label = document.createElement("label");
      label.contentEditable = "false";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = !!node.attrs.checked;
      input.setAttribute("aria-label", "Feladat elkészült");
      label.append(input);
      const contentDOM = document.createElement("div");
      dom.append(label, contentDOM);
      input.addEventListener("change", () => {
        const pos = getPos();
        if (typeof pos === "number")
          editor.view.dispatch(
            editor.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              checked: input.checked,
            }),
          );
      });
      return {
        dom,
        contentDOM,
        update(updated) {
          if (updated.type.name !== "taskItem") return false;
          input.checked = !!updated.attrs.checked;
          return true;
        },
      };
    };
  },
});
export const Table = Node.create({
  name: "table",
  group: "block",
  content: "tableRow+",
  isolating: true,
  extendNodeSchema(extension) {
    const roles: Record<string, string> = {
      table: "table",
      tableRow: "row",
      tableCell: "cell",
      tableHeader: "header_cell",
    };
    return roles[extension.name] ? { tableRole: roles[extension.name] } : {};
  },
  parseHTML() {
    return [{ tag: "table" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "tableWrapper" },
      ["table", HTMLAttributes, ["tbody", 0]],
    ];
  },
  addProseMirrorPlugins() {
    return [columnResizing(), tableEditing()];
  },
});
export const TableRow = Node.create({
  name: "tableRow",
  content: "(tableCell | tableHeader)+",
  parseHTML() {
    return [{ tag: "tr" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["tr", HTMLAttributes, 0];
  },
});
const cellAttrs = () => ({
  colspan: { default: 1 },
  rowspan: { default: 1 },
  colwidth: { default: null },
});
export const TableCell = Node.create({
  name: "tableCell",
  content: "block+",
  isolating: true,
  addAttributes: cellAttrs,
  parseHTML() {
    return [{ tag: "td" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["td", HTMLAttributes, 0];
  },
});
export const TableHeader = Node.create({
  name: "tableHeader",
  content: "block+",
  isolating: true,
  addAttributes: cellAttrs,
  parseHTML() {
    return [{ tag: "th" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["th", HTMLAttributes, 0];
  },
});
export const tableTemplate = () => ({
  type: "table",
  content: [0, 1, 2].map((row) => ({
    type: "tableRow",
    content: [0, 1, 2].map(() => ({
      type: row === 0 ? "tableHeader" : "tableCell",
      content: [{ type: "paragraph" }],
    })),
  })),
});
