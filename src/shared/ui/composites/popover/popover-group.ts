import { createContext } from 'react';

/** Open state shared by the popovers of one `PopoverGroup`: at most one id is open. */
export interface PopoverGroupState {
  readonly openId: string | null;
  readonly setOpenId: (update: (current: string | null) => string | null) => void;
}

export const PopoverGroupContext = createContext<PopoverGroupState | null>(null);
