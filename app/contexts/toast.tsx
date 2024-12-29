import CustomToast, { type CustomToastHandle } from '@/app/components/custom-toast';
import { createContext, type ReactNode, type RefObject, useRef } from 'react';

export type ToastContextType = RefObject<CustomToastHandle | null>;

export const ToastContext = createContext<ToastContextType>({ current: null });

export const ToastProvider = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const toastRef = useRef<CustomToastHandle>(null);

  return (
    <ToastContext.Provider value={toastRef}>
      {children}
      <CustomToast ref={toastRef} />
    </ToastContext.Provider>
  );
};
