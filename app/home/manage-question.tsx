import type { IError } from '@/app/interfaces';
import type { ChangeEvent, MouseEvent } from 'react';

import { useCreateCustomQuestion } from '@/app/apis/questions';
import useToast from '@/app/hooks/toast';
import { sanitizeInput } from '@/app/tools';
import { Button, ButtonGroup, Card, CardBody, CardHeader, Input, Label, Text, Textarea } from 'bootstrap-react-logic';
import Link from 'next/link';
import { useState } from 'react';

const AddQuestion = ({
  tabId,
  tabName,
  tagId,
  tagName,
}: {
  tabId?: number;
  tabName?: string;
  tagId?: number;
  tagName?: string;
}) => {
  const [form, setForm] = useState({
    answer: '',
    question: '',
  });
  const toastRef = useToast();
  const createCustomQuestion = useCreateCustomQuestion();
  const isLoading = createCustomQuestion.isPending;

  async function onClickSave() {
    const toast = toastRef.current;
    if (!toast) {
      return;
    }

    const { answer, question } = form;

    if (!answer.trim() || !question.trim()) {
      toast.showToast('Answer and question cannot be empty', 'danger');
      return;
    }

    try {
      await createCustomQuestion.mutateAsync({
        answer: sanitizeInput(answer.trim()),
        question: question.trim(),
        tabId,
        tagId,
      });
      setForm({ answer: '', question: '' });
      toast.showToast('Saved successfully', 'success');
    } catch (error) {
      toast.showToast(`Failed to save: ${(error as IError).message}`, 'danger');
    }
  }

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div>
      {(tabName || tagName) && (
        <div className="mb-3">
          <Label>Selected Tag</Label>
          <div className="hstack gap-1 px-075 py-037 text-secondary rounded border text-bg-secondary bg-opacity-10 cursor-not-allowed">
            {tabName && (
              <div className="hstack gap-1">
                <i className="bi bi-folder"></i>
                {tabName}
              </div>
            )}
            {tabName && tagName && <div>/</div>}
            {tagName && (
              <div className="hstack gap-1">
                <i className="bi bi-tag"></i>
                {tagName}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-3">
        <Label>Question</Label>
        <Input
          autoFocus
          disabled={isLoading}
          name="question"
          onChange={onChange}
          placeholder="Enter the question"
          type="text"
          value={form.question}
        />
        <Text>Formulating precise questions enhances the learning process and helps identify knowledge gaps.</Text>
      </div>

      <div className="mb-3">
        <Label>Answer</Label>
        <Textarea
          disabled={isLoading}
          name="answer"
          onChange={onChange}
          placeholder="Enter the answer"
          rows={4}
          value={form.answer}
        />
        <Text>Providing a clear and concise answer helps improve understanding and retention.</Text>
      </div>

      <Button className="mt-5 px-5" disabled={isLoading} isLoading={isLoading} onClick={onClickSave} variant="primary">
        Save
      </Button>
    </div>
  );
};

export default function ManageQuestion({
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
      <CardBody>
        {type === 'add' && <AddQuestion tabId={tabId} tabName={tabName} tagId={tagId} tagName={tagName} />}
      </CardBody>
    </Card>
  );
}
