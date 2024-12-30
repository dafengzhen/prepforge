import type { IError } from '@/app/interfaces';
import type { ChangeEvent } from 'react';

import { useCreateCustomQuestion, useUpdateCustomQuestion } from '@/app/apis/questions';
import useToast from '@/app/hooks/toast';
import { sanitizeInput } from '@/app/tools';
import { Button, ButtonGroup, Card, CardBody, CardHeader, Input, Label, Text, Textarea } from 'bootstrap-react-logic';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

const SaveQuestion = ({
  answer,
  isUpdate,
  question,
  questionId,
  tabId,
  tabName,
  tagId,
  tagName,
}: {
  answer?: string;
  isUpdate?: boolean;
  question?: string;
  questionId?: number;
  tabId?: number;
  tabName?: string;
  tagId?: number;
  tagName?: string;
}) => {
  const [form, setForm] = useState({
    answer: isUpdate ? (answer ?? '') : '',
    question: isUpdate ? (question ?? '') : '',
  });
  const toastRef = useToast();
  const createCustomQuestion = useCreateCustomQuestion();
  const updateCustomQuestion = useUpdateCustomQuestion(questionId);
  const isLoading = isUpdate ? updateCustomQuestion.isPending : createCustomQuestion.isPending;

  useEffect(() => {
    setForm({
      answer: isUpdate ? (answer ?? '') : '',
      question: isUpdate ? (question ?? '') : '',
    });
  }, [answer, isUpdate, question]);

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
      const newAnswer = sanitizeInput(answer.trim());
      const newQuestion = question.trim();

      if (isUpdate) {
        await updateCustomQuestion.mutateAsync({
          answer: newAnswer,
          question: newQuestion,
        });
      } else {
        await createCustomQuestion.mutateAsync({
          answer: newAnswer,
          question: newQuestion,
          tabId,
          tagId,
        });
        setForm({ answer: '', question: '' });
      }

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
  answer,
  manageType = 'add',
  onBack,
  question,
  questionId,
  tabId,
  tabName,
  tagId,
  tagName,
}: {
  answer?: string;
  manageType?: 'add' | 'edit' | null;
  onBack?: () => void;
  question?: string;
  questionId?: number;
  tabId?: number;
  tabName?: string;
  tagId?: number;
  tagName?: string;
}) {
  const [type, setType] = useState<'add' | 'edit' | null>(manageType);

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

          {!!questionId && (!!question || !!answer) && (
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
        <SaveQuestion
          answer={answer}
          isUpdate={type === 'edit'}
          question={question}
          questionId={questionId}
          tabId={tabId}
          tabName={tabName}
          tagId={tagId}
          tagName={tagName}
        />
      </CardBody>
    </Card>
  );
}
