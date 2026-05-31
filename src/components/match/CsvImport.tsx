import { useRef, useState } from "react";
import { FileUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseCsv } from "@/lib/match-types";
import { toast } from "sonner";

type ParsedRow = { text: string; answer: string; points: number };

export function CsvImport({
  onImport,
  onImportCsv,
}: {
  onImport?: (rows: ParsedRow[]) => void;
  onImportCsv?: (csv: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ParsedRow[] | null>(null);
  const [csv, setCsv] = useState("");

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result ?? ""));
      if (!rows.length) {
        toast.error("Nenhuma pergunta válida encontrada no CSV.");
        return;
      }
      setCsv(String(reader.result ?? ""));
      setPreview(rows);
    };
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const csv =
      "pergunta,resposta,pontos\n" +
      '"Qual console popularizou controles com sensor de movimento?","Nintendo Wii",100\n' +
      '"Qual gênero usa fases, chefes e progressão por níveis?","Plataforma",100\n';
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-perguntas.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileUp className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium">Importar perguntas via CSV</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Formato: <code>pergunta, resposta, pontos</code>
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => inputRef.current?.click()}
          >
            <FileUp className="mr-1 size-4" /> Escolher arquivo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-lg"
            onClick={downloadTemplate}
          >
            <Download className="mr-1 size-4" /> Baixar modelo
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {preview && (
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pré-visualização ({preview.length} perguntas)
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-lg"
                onClick={() => setPreview(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="rounded-lg"
                onClick={() => {
                  onImportCsv?.(csv);
                  onImport?.(preview);
                  setPreview(null);
                  setCsv("");
                }}
              >
                Importar {preview.length}
              </Button>
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto rounded-lg border border-border bg-background/50">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Pergunta</th>
                  <th className="px-3 py-2 text-left">Resposta</th>
                  <th className="px-3 py-2 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2">{r.text}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.answer}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
