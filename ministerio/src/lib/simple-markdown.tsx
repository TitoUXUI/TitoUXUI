import React from "react";

/**
 * Renderer minimo para el contenido de "Vision y estatuto": encabezados (#, ##),
 * listas (- item) y **negrita**. No es un parser de markdown completo a
 * proposito, alcanza para este texto institucional sin sumar una dependencia.
 */
export function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc space-y-1 pl-5">
        {listBuffer.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  }

  function inline(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
    );
  }

  lines.forEach((line, idx) => {
    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h2 key={idx} className="mt-4 text-base font-semibold">
          {inline(line.slice(3))}
        </h2>,
      );
    } else if (line.startsWith("# ")) {
      flushList();
      blocks.push(
        <h1 key={idx} className="text-xl font-bold">
          {inline(line.slice(2))}
        </h1>,
      );
    } else if (line.startsWith("- ")) {
      listBuffer.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      blocks.push(
        <p key={idx} className="text-sm leading-relaxed text-foreground/90">
          {inline(line)}
        </p>,
      );
    }
  });
  flushList();

  return <div className="space-y-2">{blocks}</div>;
}
