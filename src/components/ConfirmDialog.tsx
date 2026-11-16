import {IconTrash} from "@tabler/icons-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/app-button";
import Modal, {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/Modal";
import useModalStore, {type TMetaModalContext} from "@/store/useModalStore";

const TYPES: Record<
  TMetaModalContext["type"],
  {
    icon: React.ReactNode;
    iconBg: string;
    badgeBg: string;
    badgeText: string;
    buttonClass: string;
    label: string;
  }
> = {
  delete: {
    icon: <IconTrash className="size-6 text-white" strokeWidth={2} />,
    iconBg: "bg-red-600",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    buttonClass: "bg-red-600 text-white hover:bg-red-700",
    label: "Eliminar",
  },
};

/**
 * Diálogo de confirmación global. Se lanza desde cualquier sitio con
 * `useModalStore.getState().handleLaunchModal({...})`.
 */
export default function ConfirmDialog() {
  const isOpen = useModalStore((state) => state.isOpen);
  const loading = useModalStore((state) => state.loading);
  const meta = useModalStore((state) => state.meta);
  const close = useModalStore((state) => state.close);
  const setLoading = useModalStore((state) => state.setLoading);
  const type = (meta?.type && TYPES[meta.type]) || TYPES.delete;

  async function handleAction() {
    if (!meta?.fn && !meta?.promise) {
      throw new Error("[fn] or [promise] must be provided");
    }
    if (meta.fn) {
      meta.fn();
      close();
    }
    if (meta.promise) {
      setLoading(true);
      try {
        await meta.promise();
      } finally {
        close();
        setLoading(false);
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={close} size="md">
      <ModalContent>
        <ModalHeader className="items-center gap-4 pt-4">
          <div
            className={cn(
              "flex size-16 items-center justify-center rounded-full shadow-md",
              type.iconBg,
            )}
          >
            {type.icon}
          </div>
          <h3 className="text-center text-xl font-semibold">{meta?.title}</h3>
        </ModalHeader>
        <ModalBody className="p-2">
          <p className="text-center leading-relaxed text-muted-foreground">
            {meta?.text}
          </p>
          {meta?.description ? (
            <div className="flex justify-center">
              <span
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium",
                  type.badgeBg,
                  type.badgeText,
                )}
              >
                {meta.description}
              </span>
            </div>
          ) : null}
          {meta?.subText ? (
            <p className="mt-3 text-center text-sm text-muted-foreground italic">
              {meta.subText}
            </p>
          ) : null}
        </ModalBody>
        <ModalFooter className="justify-between">
          <Button variant="outline" onPress={close} isDisabled={loading}>
            Cerrar
          </Button>
          <Button
            onPress={handleAction}
            isLoading={loading}
            isDisabled={loading}
            startContent={type.icon}
            className={type.buttonClass}
          >
            {type.label}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
