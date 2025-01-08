import type { IError } from '@/app/interfaces';
import type { FormEvent } from 'react';

import { useCreateCustomTab, useFetchTabs, useUpdateCustomTab } from '@/app/apis/tabs';
import { getQueryClient } from '@/app/get-query-client';
import useToast from '@/app/hooks/toast';
import { Button, ButtonGroup, Card, CardBody, CardHeader, Input, Label, Text } from 'bootstrap-react-logic';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

const SaveTab = ({ isUpdate, tabId, tabName }: { isUpdate?: boolean; tabId?: number; tabName?: string }) => {
  const [name, setName] = useState(isUpdate ? (tabName ?? '') : '');
  const toastRef = useToast();
  const createCustomTab = useCreateCustomTab();
  const updateCustomTab = useUpdateCustomTab(tabId);
  const isLoading = isUpdate ? updateCustomTab.isPending : createCustomTab.isPending;

  useEffect(() => {
    setName(isUpdate ? (tabName ?? '') : '');
  }, [isUpdate, tabName]);

  async function onClickSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();

    const toast = toastRef.current;
    if (!toast) {
      return;
    }

    if (!name.trim()) {
      toast.showToast('The tab name cannot be empty', 'danger');
      return;
    }

    try {
      const newName = name.trim();
      if (isUpdate) {
        await updateCustomTab.mutateAsync({ name: newName });
      } else {
        await createCustomTab.mutateAsync({ name: newName });
        setName('');
      }

      refreshQuery();

      toast.showToast('Saved successfully', 'success');
    } catch (error) {
      toast.showToast((error as IError).message, 'danger');
    }
  }

  function refreshQuery() {
    const queryClient = getQueryClient();
    queryClient.refetchQueries({
      predicate: (query) => query.queryKey.includes(useFetchTabs.key),
      type: 'active',
    });
  }

  return (
    <form onSubmit={onClickSave}>
      <Label>Tab Name</Label>
      <Input
        autoFocus
        disabled={isLoading}
        name="name"
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter the name"
        type="text"
        value={name}
      />
      <Text>Tabs can help organize information and improve navigation efficiency.</Text>

      <Button className="mt-5 px-5" disabled={isLoading} isLoading={isLoading} type="submit" variant="primary">
        Save
      </Button>
    </form>
  );
};

export default function ManageTab({
  onBack,
  tabId,
  tabName,
}: {
  onBack?: () => void;
  tabId?: number;
  tabName?: string;
}) {
  const [type, setType] = useState<'add' | 'edit' | null>('add');

  function handleBack() {
    onBack?.();
  }

  function onClickType(type: 'add' | 'edit') {
    setType(type);
  }

  return (
    <Card className="border">
      <CardHeader className="text-end">
        <ButtonGroup>
          <Button
            onClick={handleBack}
            outline="secondary"
            size="sm"
            startContent={<i className="bi bi-arrow-left me-1"></i>}
          >
            Back
          </Button>

          <Button
            className={clsx(type === 'add' && 'active')}
            onClick={() => onClickType('add')}
            outline="secondary"
            size="sm"
            startContent={<i className="bi bi-plus-lg me-1"></i>}
          >
            Add
          </Button>

          {!!tabId && !!tabName && (
            <Button
              className={clsx(type === 'edit' && 'active')}
              onClick={() => onClickType('edit')}
              outline="secondary"
              size="sm"
              startContent={<i className="bi bi-pencil-square me-1"></i>}
            >
              Edit
            </Button>
          )}
        </ButtonGroup>
      </CardHeader>
      <CardBody>
        <SaveTab isUpdate={type === 'edit'} tabId={tabId} tabName={tabName} />
      </CardBody>
    </Card>
  );
}
