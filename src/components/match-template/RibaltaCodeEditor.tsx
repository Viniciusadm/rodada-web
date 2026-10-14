import { useEffect, useRef } from "react";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";
import { lintGutter, setDiagnostics } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import type { Diagnostic, Theme } from "@ribaltalang/compiler";
import { ribaltaCompletions, type ExternSuggestion } from "@ribaltalang/codemirror/completions";
import { toEditorDiagnostics } from "@ribaltalang/codemirror/diagnostics";
import { ribaltaHighlight, ribaltaLanguage } from "@ribaltalang/codemirror/language";
import { completionsPt } from "@ribaltalang/codemirror/messages";

type Props = {
  value: string;
  onChange: (value: string) => void;
  diagnostics: Diagnostic[];
  theme: Theme | null;
  variables: string[];
  externs: ExternSuggestion[];
};

const editorTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "12px", backgroundColor: "transparent" },
  ".cm-scroller": {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    lineHeight: "1.6",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--muted-foreground)",
  },
  ".cm-activeLine, .cm-activeLineGutter": {
    backgroundColor: "color-mix(in oklab, var(--muted) 50%, transparent)",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-tooltip": {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  ".cm-tooltip-autocomplete > ul > li": { padding: "2px 8px" },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
    backgroundColor: "var(--accent)",
    color: "var(--accent-foreground)",
  },
  ".cm-completionDetail": { color: "var(--muted-foreground)", marginLeft: "8px" },
  ".cm-diagnostic": { padding: "6px 10px" },
});

export function RibaltaCodeEditor({
  value,
  onChange,
  diagnostics,
  theme,
  variables,
  externs,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const initialValue = useRef(value);
  const latest = useRef({ onChange, theme, variables, externs });
  latest.current = { onChange, theme, variables, externs };

  useEffect(() => {
    if (!host.current) return;
    const instance = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: initialValue.current,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          drawSelection(),
          history(),
          closeBrackets(),
          bracketMatching(),
          ribaltaLanguage,
          ribaltaHighlight,
          lintGutter(),
          autocompletion({
            override: [
              ribaltaCompletions(() => ({
                theme: latest.current.theme,
                styles: [],
                components: [],
                variables: latest.current.variables,
                externs: latest.current.externs,
                labels: completionsPt,
              })),
            ],
          }),
          keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            ...completionKeymap,
            indentWithTab,
          ]),
          editorTheme,
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) latest.current.onChange(update.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = instance;
    return () => {
      instance.destroy();
      view.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = view.current;
    if (!instance || instance.state.doc.toString() === value) return;
    instance.dispatch({ changes: { from: 0, to: instance.state.doc.length, insert: value } });
  }, [value]);

  useEffect(() => {
    const instance = view.current;
    if (!instance) return;
    instance.dispatch(
      setDiagnostics(instance.state, toEditorDiagnostics(instance.state.doc, diagnostics)),
    );
  }, [diagnostics]);

  return <div ref={host} className="h-full min-h-[420px] overflow-hidden" />;
}
