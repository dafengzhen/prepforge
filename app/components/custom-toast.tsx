import { CloseButton, Toast } from 'bootstrap-react-logic';
import clsx from 'clsx';
import { forwardRef, useImperativeHandle, useState } from 'react';

export interface CustomToastHandle {
  hideToast: () => void;
  showToast: (message: string, type?: 'danger' | 'primary' | 'success' | 'warning') => void;
}

export interface CustomToastProps {
  initialVisible?: boolean;
}

const CustomToast = forwardRef<CustomToastHandle, CustomToastProps>(({ initialVisible = false }, ref) => {
  const [visible, setVisible] = useState(initialVisible);
  const [message, setMessage] = useState('Loading');
  const [type, setType] = useState<'danger' | 'primary' | 'success' | 'warning'>('primary');

  useImperativeHandle(ref, () => ({
    hideToast: () => {
      setVisible(false);
    },
    showToast: (msg: string, msgType = 'primary') => {
      setMessage(msg);
      setType(msgType);
      setVisible(true);
    },
  }));

  return (
    <Toast
      container
      containerProps={{ className: 'p-3' }}
      options={[
        {
          body: message,
          header: (
            <>
              <div
                className={clsx('rounded', {
                  'bg-danger': type === 'danger',
                  'bg-primary': type === 'primary',
                  'bg-success': type === 'success',
                  'bg-warning': type === 'warning',
                })}
                style={{ height: 20, width: 20 }}
              />
              <strong className="ms-2 me-auto">PrepForge</strong>
              <CloseButton onClick={() => setVisible(false)} />
            </>
          ),
          onChange: setVisible,
          position: 'fixed',
          role: 'alert',
          visible,
        },
      ]}
      placement="top-center"
    />
  );
});

CustomToast.displayName = 'CustomToast';

export default CustomToast;
