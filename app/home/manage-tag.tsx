import type { IError } from '@/app/interfaces';
import type { MouseEvent } from 'react';

import { useCreateCustomTag } from '@/app/apis/tags';
import useToast from '@/app/hooks/toast';
import { Button, ButtonGroup, Card, CardBody, CardHeader, Input, Label, Text } from 'bootstrap-react-logic';
import Link from 'next/link';
import { useState } from 'react';

const AddTag = ({ tabId, tabName }: { tabId?: number; tabName?: string }) => {
  const [name, setName] = useState('');
  const toastRef = useToast();
  const createCustomTag = useCreateCustomTag();
  const isLoading = createCustomTag.isPending;

  async function onClickSave() {
    const toast = toastRef.current;
    if (!toast) {
      return;
    }

    if (!name.trim()) {
      toast.showToast('The tag name cannot be empty', 'danger');
      return;
    }

    try {
      await createCustomTag.mutateAsync({ name: name.trim(), tabId });
      setName('');
      toast.showToast('Saved successfully', 'success');
    } catch (error) {
      toast.showToast((error as IError).message, 'danger');
    }
  }

  return (
    <div>
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

      <Button className="mt-5 px-5" disabled={isLoading} isLoading={isLoading} onClick={onClickSave} variant="primary">
        Save
      </Button>
    </div>
  );
};

export default function ManageTag({
  onBack,
  tabId,
  tabName,
}: {
  onBack?: () => void;
  tabId?: number;
  tabName?: string;
}) {
  const [type] = useState<'add' | null>('add');

  function handleBack(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    onBack?.();
  }

  return (
    <Card className="border">
      <CardHeader className="">
        <ButtonGroup className="justify-content-between align-items-center gap-2" toolbar>
          <Link
            className="link-secondary link-offset-2 link-underline link-underline-opacity-0 link-underline-opacity-100-hover"
            href=""
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back
          </Link>

          {!type && (
            <Button startContent={<i className="bi bi-plus-lg me-1"></i>} variant="secondary">
              Add
            </Button>
          )}
        </ButtonGroup>
      </CardHeader>
      <CardBody>{type === 'add' && <AddTag tabId={tabId} tabName={tabName} />}</CardBody>
    </Card>
  );
}
