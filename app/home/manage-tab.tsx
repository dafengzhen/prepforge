import type { IError } from '@/app/interfaces';
import type { MouseEvent } from 'react';

import { useCreateCustomTab } from '@/app/apis/tabs';
import useToast from '@/app/hooks/toast';
import { Button, ButtonGroup, Card, CardBody, CardHeader, Input, Label, Text } from 'bootstrap-react-logic';
import Link from 'next/link';
import { useState } from 'react';

const AddTab = () => {
  const [name, setName] = useState('');
  const toastRef = useToast();
  const createCustomTab = useCreateCustomTab();
  const isLoading = createCustomTab.isPending;

  async function onClickSave() {
    const toast = toastRef.current;
    if (!toast) {
      return;
    }

    if (!name.trim()) {
      toast.showToast('The tab name cannot be empty', 'danger');
      return;
    }

    try {
      await createCustomTab.mutateAsync({ name: name.trim() });
      setName('');
      toast.showToast('Saved successfully', 'success');
    } catch (error) {
      toast.showToast((error as IError).message, 'danger');
    }
  }

  return (
    <div>
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

      <Button className="mt-5 px-5" disabled={isLoading} isLoading={isLoading} onClick={onClickSave} variant="primary">
        Save
      </Button>
    </div>
  );
};

export default function ManageTab({ onBack }: { onBack?: () => void }) {
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
      <CardBody>{type === 'add' && <AddTab />}</CardBody>
    </Card>
  );
}
