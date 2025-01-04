import type { IError } from '@/app/interfaces';

import { useCreateCustomTag, useFetchTags, useUpdateCustomTag } from '@/app/apis/tags';
import { getQueryClient } from '@/app/get-query-client';
import useToast from '@/app/hooks/toast';
import { Button, ButtonGroup, Card, CardBody, CardHeader, Input, Label, Text } from 'bootstrap-react-logic';
import clsx from 'clsx';
import { type FormEvent, useEffect, useState } from 'react';

const SaveTag = ({
  isUpdate,
  tabId,
  tabName,
  tagId,
  tagName,
}: {
  isUpdate?: boolean;
  tabId?: number;
  tabName?: string;
  tagId?: number;
  tagName?: string;
}) => {
  const [name, setName] = useState(isUpdate ? (tagName ?? '') : '');
  const toastRef = useToast();
  const createCustomTag = useCreateCustomTag();
  const updateCustomTag = useUpdateCustomTag(tagId);
  const isLoading = isUpdate ? updateCustomTag.isPending : createCustomTag.isPending;

  useEffect(() => {
    setName(isUpdate ? (tagName ?? '') : '');
  }, [isUpdate, tagName]);

  async function onClickSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();

    const toast = toastRef.current;
    if (!toast) {
      return;
    }

    if (!name.trim()) {
      toast.showToast('The tag name cannot be empty', 'danger');
      return;
    }

    try {
      const newName = name.trim();
      if (isUpdate) {
        await updateCustomTag.mutateAsync({ name: newName });
      } else {
        await createCustomTag.mutateAsync({ name: newName, tabId });
        setName('');
      }

      refreshQuery();

      toast.showToast('Saved successfully', 'success');
    } catch (error) {
      toast.showToast((error as IError).message, 'danger');
    }
  }
  async function refreshQuery() {
    const queryClient = getQueryClient();
    await queryClient.refetchQueries({
      predicate: (query) => query.queryKey.includes(useFetchTags.key),
      type: 'active',
    });
  }

  return (
    <form onSubmit={onClickSave}>
      {tabName && (
        <div className="mb-3">
          <Label>Selected Tab</Label>
          <div className="hstack gap-1 px-075 py-037 text-secondary rounded border text-bg-secondary bg-opacity-10 cursor-not-allowed">
            <div className="hstack gap-1">
              <i className="bi bi-folder"></i>
              {tabName}
            </div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <Label>Tag Name</Label>
        <Input
          autoFocus
          disabled={isLoading}
          name="name"
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter the name"
          type="text"
          value={name}
        />
        <Text>
          Tags can increase the structuring of information and improve the efficiency of accessing information.
        </Text>
      </div>

      <Button className="mt-5 px-5" disabled={isLoading} isLoading={isLoading} type="submit" variant="primary">
        Save
      </Button>
    </form>
  );
};

export default function ManageTag({
  onBack,
  tabId,
  tabName,
  tagId,
  tagName,
}: {
  onBack?: () => void;
  tabId?: number;
  tabName?: string;
  tagId?: number;
  tagName?: string;
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
      <CardHeader>
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

          {!!tagId && !!tagName && (
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
        <SaveTag isUpdate={type === 'edit'} tabId={tabId} tabName={tabName} tagId={tagId} tagName={tagName} />
      </CardBody>
    </Card>
  );
}
