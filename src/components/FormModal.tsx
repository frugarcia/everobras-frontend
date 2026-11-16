import type {ReactNode} from "react";
import {IconCancel, IconDeviceFloppy} from "@tabler/icons-react";
import ButtonBordered from "@/components/ButtonBordered";
import {ModalBody, ModalFooter, ModalHeader} from "@/components/Modal";

/** Formulario dentro de un Modal: título, campos y pie con Cancelar/Guardar. */
export default function FormModal({
  title,
  icon,
  isPending,
  onCancel,
  onSubmit,
  children,
  submitLabel = "Guardar",
}: {
  title: string;
  icon?: ReactNode;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  children: ReactNode;
  submitLabel?: string;
}) {
  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSubmit();
      }}
    >
      <ModalHeader>
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          {icon}
          {title}
        </h3>
      </ModalHeader>
      <ModalBody className="gap-4">{children}</ModalBody>
      <ModalFooter>
        <ButtonBordered
          label="Cancelar"
          color="red-600"
          onPress={onCancel}
          startContent={<IconCancel />}
          isDisabled={isPending}
        />
        <ButtonBordered
          label={submitLabel}
          color="green-600"
          type="submit"
          startContent={<IconDeviceFloppy />}
          isLoading={isPending}
          isDisabled={isPending}
        />
      </ModalFooter>
    </form>
  );
}
