"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import Icon from "@/components/shared/atoms/Icon";

type UploadResult = {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string;
  size: number;
  individualId: string;
  property: string;
  sparqlSnippet: string;
};

const entityOptions = [
  ["paquetes", "Paquetes"],
  ["destinos", "Destinos"],
  ["sitios", "Sitios"],
  ["servicios", "Servicios"],
  ["comunidades", "Comunidades"],
  ["municipios", "Municipios"],
  ["prestadores", "Prestadores"],
  ["usuarios", "Usuarios"],
];

const propertyOptions = [
  ["urlImagen", "Imagen principal"],
  ["galeriaImagenes", "Galeria"],
];

const roleOptions = [
  ["principal", "Principal"],
  ["galeria", "Galeria"],
  ["portada", "Portada"],
  ["miniatura", "Miniatura"],
];

const examples = ["Paquete_0163", "Destino_005", "Servicio_004", "Comunidad_002"];

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const FieldLabel = ({ children }: { children: ReactNode }) => (
  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
    {children}
  </span>
);

export const BlobUploadTool = () => {
  const [entityType, setEntityType] = useState("paquetes");
  const [property, setProperty] = useState("urlImagen");
  const [imageRole, setImageRole] = useState("principal");
  const [individualId, setIndividualId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileMeta = useMemo(() => {
    if (!file) return "Sin archivo";
    return `${file.name} - ${formatBytes(file.size)}`;
  }, [file]);

  const onFileChange = (nextFile: File | null) => {
    setFile(nextFile);
    setResult(null);
    setError("");

    if (!nextFile) {
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
      return;
    }

    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(nextFile);
    });
  };

  const copyText = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setCopied("");
    setResult(null);

    if (!file) {
      setError("Selecciona una imagen.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("entityType", entityType);
    formData.set("individualId", individualId);
    formData.set("property", property);
    formData.set("imageRole", imageRole);

    setIsUploading(true);

    try {
      const response = await fetch("/api/blob/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as UploadResult & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo subir la imagen.");
      }

      setResult(payload);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <form
        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">Carga de imagen RDF</h2>
            <p className="mt-1 text-sm text-slate-500">
              Guarda el archivo en Blob y genera la triple para Fuseki.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
            <Icon name="cloud_done" className="text-base" />
            Publico
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <FieldLabel>Entidad</FieldLabel>
            <select
              className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-primary"
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
            >
              {entityOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <FieldLabel>Propiedad RDF</FieldLabel>
            <select
              className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-primary"
              value={property}
              onChange={(event) => setProperty(event.target.value)}
            >
              {propertyOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <FieldLabel>Individuo</FieldLabel>
            <input
              className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-primary"
              placeholder="Paquete_0163"
              value={individualId}
              onChange={(event) => setIndividualId(event.target.value)}
            />
          </label>

          <label className="space-y-2">
            <FieldLabel>Uso de imagen</FieldLabel>
            <select
              className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-primary"
              value={imageRole}
              onChange={(event) => setImageRole(event.target.value)}
            >
              {roleOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 transition hover:bg-primary/10 hover:text-primary"
              key={example}
              onClick={() => setIndividualId(example)}
              type="button"
            >
              {example}
            </button>
          ))}
        </div>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition hover:border-primary/60 hover:bg-primary/5">
          <Icon name="add_photo_alternate" className="text-4xl text-primary" />
          <span className="mt-3 text-sm font-black text-slate-900">{fileMeta}</span>
          <span className="mt-1 text-xs font-bold text-slate-400">PNG, JPG, WebP o GIF - maximo 4 MB</span>
          <input
            accept="image/*"
            className="sr-only"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>

        {error ? (
          <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          disabled={isUploading}
          type="submit"
        >
          <Icon name={isUploading ? "sync" : "cloud_upload"} className="text-xl" />
          {isUploading ? "Subiendo..." : "Subir imagen"}
        </button>
      </form>

      <aside className="space-y-6">
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="aspect-[4/3] bg-slate-100">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Vista previa" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <Icon name="image" className="text-5xl" />
                <span className="mt-2 text-sm font-bold">Vista previa</span>
              </div>
            )}
          </div>
          <div className="p-5">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Ruta Blob</p>
            <p className="mt-1 break-all text-sm font-bold text-slate-700">
              {result?.pathname ?? "individuos/entidad/individuo/archivo"}
            </p>
          </div>
        </section>

        {result ? (
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-slate-950">Resultado</h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                Listo
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">URL</p>
                <p className="mt-1 break-all text-sm font-bold text-slate-700">{result.url}</p>
                <button
                  className="mt-3 inline-flex items-center gap-2 text-xs font-black text-primary"
                  onClick={() => copyText("url", result.url)}
                  type="button"
                >
                  <Icon name="content_copy" className="text-base" />
                  {copied === "url" ? "Copiada" : "Copiar URL"}
                </button>
              </div>

              <div className="rounded-xl bg-slate-950 p-3 text-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-wider text-white/60">SPARQL</p>
                  <button
                    className="inline-flex items-center gap-2 text-xs font-black text-primary"
                    onClick={() => copyText("sparql", result.sparqlSnippet)}
                    type="button"
                  >
                    <Icon name="content_copy" className="text-base" />
                    {copied === "sparql" ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-white/85">
                  {result.sparqlSnippet}
                </pre>
              </div>
            </div>
          </section>
        ) : null}
      </aside>
    </div>
  );
};
