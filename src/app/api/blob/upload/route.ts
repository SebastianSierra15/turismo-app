import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BASE_IRI = "http://amaturis.org/ontology#";
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const VALID_PROPERTIES = new Set(["urlImagen", "galeriaImagenes"]);

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

const getFormValue = (formData: FormData, key: string, fallback = "") => {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
};

const slugify = (value: string) => {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);

  return slug || "sin-identificar";
};

const toRdfIri = (value: string) => {
  const trimmed = value.trim();

  if (/^https?:\/\/[^\s<>"{}|\\^`]+$/i.test(trimmed)) {
    return `<${trimmed}>`;
  }

  if (!/^[A-Za-z][A-Za-z0-9_.-]*$/.test(trimmed)) {
    throw new Error(
      "El individuo debe ser un identificador local como Paquete_0001 o una URI completa.",
    );
  }

  return `<${BASE_IRI}${trimmed}>`;
};

const escapeSparqlLiteral = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const buildSparqlSnippet = ({
  individualIri,
  property,
  imageUrl,
}: {
  individualIri: string;
  property: string;
  imageUrl: string;
}) => {
  const datatype = property === "urlImagen" ? "xsd:anyURI" : "xsd:string";

  return `PREFIX ex: <${BASE_IRI}>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

INSERT DATA {
  ${individualIri} ex:${property} "${escapeSparqlLiteral(imageUrl)}"^^${datatype} .
}`;
};

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json(
      {
        error:
          "Falta BLOB_READ_WRITE_TOKEN. Conecta el Blob Store al proyecto en Vercel o trae las variables a .env.local.",
      },
      500,
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return json({ error: "Selecciona una imagen para subir." }, 400);
  }

  if (!file.type.startsWith("image/")) {
    return json({ error: "El archivo debe ser una imagen." }, 400);
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return json({ error: "La imagen no debe superar 4 MB." }, 400);
  }

  const individualId = getFormValue(formData, "individualId");
  const entityType = getFormValue(formData, "entityType", "entidad");
  const imageRole = getFormValue(formData, "imageRole", "principal");
  const property = getFormValue(formData, "property", "urlImagen");

  if (!individualId) {
    return json({ error: "Indica el ID del individuo RDF." }, 400);
  }

  if (!VALID_PROPERTIES.has(property)) {
    return json({ error: "La propiedad RDF no es valida." }, 400);
  }

  try {
    const individualIri = toRdfIri(individualId);
    const originalName = slugify(file.name.replace(/\.[^.]+$/, ""));
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const pathname = [
      "individuos",
      slugify(entityType),
      slugify(individualId),
      `${slugify(imageRole)}-${originalName}.${extension}`,
    ].join("/");

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    return json({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: file.size,
      individualId,
      property,
      sparqlSnippet: buildSparqlSnippet({
        individualIri,
        property,
        imageUrl: blob.url,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo subir la imagen.";
    return json({ error: message }, 500);
  }
}
