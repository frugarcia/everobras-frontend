import {useEffect, useRef, useState} from "react";
import {IconPaperclip, IconTrash} from "@tabler/icons-react";
import {toast} from "sonner";
import ButtonBordered from "@/components/ButtonBordered";
import ButtonTable from "@/components/ButtonTable";
import Modal, {ModalBody, ModalContent, ModalHeader} from "@/components/Modal";
import {Field} from "@/components/ui/app-input";
import {uploadsApi, type ScanFolder} from "@/lib/api";
import {getErrorMessage} from "@/lib/errors";

const ACCEPT =
  "application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif";

function previewKind(type: string) {
  if (type === "application/pdf") return "pdf";
  if (type === "image/jpeg" || type === "image/png" || type === "image/webp") {
    return "image";
  }
  return "other";
}

export function ScanLink({
  fileKey,
  fileName,
}: {
  fileKey: string;
  fileName: string;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [kind, setKind] = useState<"image" | "pdf" | "other">("other");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  async function openFile() {
    setLoading(true);
    try {
      const blob = await uploadsApi.getBlob(fileKey);
      const nextKind = previewKind(blob.type);
      const nextUrl = URL.createObjectURL(blob);
      if (nextKind === "other") {
        const link = document.createElement("a");
        link.href = nextUrl;
        link.download = fileName;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(nextUrl), 1000);
        return;
      }
      setUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return nextUrl;
      });
      setKind(nextKind);
      setOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "No se ha podido abrir el archivo"));
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  }

  return (
    <>
      <button
        type="button"
        className="truncate text-left text-sm text-primary underline"
        onClick={openFile}
        disabled={loading}
      >
        {loading ? "Abriendo..." : fileName}
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} size="5xl">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-base font-semibold">{fileName}</span>
              <ButtonBordered
                label="Descargar"
                color="blue-600"
                onPress={download}
              />
            </div>
          </ModalHeader>
          <ModalBody>
            {kind === "image" && url ? (
              <img
                src={url}
                alt={fileName}
                className="max-h-[70vh] w-full object-contain"
              />
            ) : null}
            {kind === "pdf" && url ? (
              <iframe title={fileName} src={url} className="h-[70vh] w-full rounded-md" />
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export function AttachmentField({
  folder,
  fileKey,
  fileName,
  onChange,
  onBusyChange,
}: {
  folder: ScanFolder;
  fileKey: string | null;
  fileName: string | null;
  onChange: (next: {key: string | null; fileName: string | null}) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const busyRef = useRef(false);
  const onBusyChangeRef = useRef(onBusyChange);
  onBusyChangeRef.current = onBusyChange;

  function setBusy(busy: boolean) {
    if (busyRef.current === busy) return;
    busyRef.current = busy;
    setUploading(busy);
    onBusyChangeRef.current?.(busy);
  }

  useEffect(() => {
    return () => {
      if (busyRef.current) onBusyChangeRef.current?.(false);
    };
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const stored = await uploadsApi.create(file, folder);
      onChange({key: stored.key, fileName: stored.fileName});
    } catch (err) {
      toast.error(getErrorMessage(err, "No se ha podido subir el archivo"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Field label="Escaneo">
      <div className="flex min-h-9 flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        <ButtonBordered
          type="button"
          label={uploading ? "Subiendo..." : fileKey ? "Cambiar escaneo" : "Adjuntar escaneo"}
          color="blue-600"
          startContent={<IconPaperclip />}
          isLoading={uploading}
          onPress={() => inputRef.current?.click()}
        />
        {fileKey && fileName ? (
          <>
            <ScanLink fileKey={fileKey} fileName={fileName} />
            <ButtonTable
              tooltip="Quitar adjunto"
              icon={<IconTrash size={20} className="stroke-red-600" />}
              onClick={() => onChange({key: null, fileName: null})}
            />
          </>
        ) : (
          <span className="text-sm text-muted-foreground">PDF o imagen, hasta 20 MB</span>
        )}
      </div>
    </Field>
  );
}
