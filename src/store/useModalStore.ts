import { create } from "zustand"

export type TMetaModalContext = {
  title: string
  text: string
  description?: string | string[]
  subText?: string
  promise?: () => Promise<unknown>
  fn?: () => void
  type: "delete"
}

type ModalState = {
  isOpen: boolean
  loading: boolean
  meta: TMetaModalContext | null
  handleLaunchModal: (meta: TMetaModalContext) => void
  close: () => void
  setLoading: (loading: boolean) => void
}

const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  loading: false,
  meta: null,
  handleLaunchModal: (meta) => set({ meta, isOpen: true }),
  close: () => set({ isOpen: false, loading: false }),
  setLoading: (loading) => set({ loading }),
}))

export default useModalStore
