document.addEventListener("DOMContentLoaded", function () {
  const textarea = document.querySelector("#id_content");

  if (!textarea) {
    console.error("textarea #id_content not found");
    return;
  }

  // 💥 INLINE CSS FIX (ВАРИАНТ 3)
  const style = document.createElement("style");
  style.textContent = `
    .toastui-editor,
    .toastui-editor * {
      background: #ffffff !important;
      color: #111111 !important;
      color-scheme: light !important;
    }

    .toastui-editor-defaultUI {
      background: #ffffff !important;
    }

    .toastui-editor-contents {
      background: #ffffff !important;
      color: #111111 !important;
    }
  `;
  document.head.appendChild(style);

  const editorDiv = document.createElement("div");
  editorDiv.style.minHeight = "600px";

  textarea.style.display = "none";
  textarea.parentNode.appendChild(editorDiv);

  const editor = new toastui.Editor({
    el: editorDiv,
    height: "600px",
    initialEditType: "markdown",
    previewStyle: "vertical",
    initialValue: textarea.value || "",

    theme: "white",
  });

  editor.on("change", () => {
    textarea.value = editor.getMarkdown();
  });
});