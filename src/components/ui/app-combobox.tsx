import {useState, type ReactNode} from "react"
import {Combobox as ComboboxPrimitive} from "@base-ui/react"
import {PlusIcon} from "lucide-react"
import {cn} from "@/lib/utils"
import Modal, {ModalContent} from "@/components/Modal"
import {Field} from "@/components/ui/app-input"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import type {TOption} from "@/components/ui/app-select"

/**
 * Combobox con el mismo envoltorio (label, error) que AppSelect.
 * `value` vacío ("") muestra el placeholder. Se puede escribir para filtrar.
 * `renderCreateForm` añade una acción fija que abre el modal de alta del maestro.
 */
export function AppCombobox({
  label,
  placeholder = "Seleccione",
  options,
  value,
  onChange,
  isInvalid,
  errorMessage,
  isRequired,
  isDisabled,
  className,
  inputClassName,
  emptyMessage = "Sin resultados",
  createLabel,
  renderCreateForm,
}: {
  label?: ReactNode
  placeholder?: string
  options: TOption[]
  value: string
  onChange: (value: string) => void
  isInvalid?: boolean
  errorMessage?: ReactNode
  isRequired?: boolean
  isDisabled?: boolean
  className?: string
  inputClassName?: string
  emptyMessage?: string
  createLabel?: string
  renderCreateForm?: (onClose: () => void) => ReactNode
}) {
  const {contains} = ComboboxPrimitive.useFilter({locale: "es"})
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const selected = options.find((option) => option.value === value) ?? null

  function openCreate() {
    setOpen(false)
    setCreateOpen(true)
  }

  return (
    <Field
      label={isRequired && typeof label === "string" ? `${label} *` : label}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      className={className}
    >
      <Combobox
        items={options}
        value={selected}
        onValueChange={(next) => onChange(next?.value ?? "")}
        filter={contains}
        isItemEqualToValue={(item, current) => item.value === current.value}
        autoHighlight
        disabled={isDisabled}
        open={open}
        onOpenChange={setOpen}
      >
        <ComboboxInput
          placeholder={placeholder}
          aria-invalid={isInvalid || undefined}
          disabled={isDisabled}
          className={cn("h-9 w-full", inputClassName)}
        />
        <ComboboxContent>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(option: TOption) => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
          {renderCreateForm && createLabel ? (
            <div className="border-t p-1">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md p-1.5 text-left text-sm font-medium text-primary hover:bg-accent"
                onMouseDown={(event) => event.preventDefault()}
                onClick={openCreate}
              >
                <PlusIcon className="size-4" />
                {createLabel}
              </button>
            </div>
          ) : null}
        </ComboboxContent>
      </Combobox>
      {renderCreateForm ? (
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          size="lg"
        >
          <ModalContent>
            {createOpen ? renderCreateForm(() => setCreateOpen(false)) : null}
          </ModalContent>
        </Modal>
      ) : null}
    </Field>
  )
}
