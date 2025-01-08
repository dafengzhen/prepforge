import type { IError } from '@/app/interfaces';
import type { ChangeEvent, FormEvent } from 'react';

import { useCreateCustomQuestion, useFetchQuestions, useUpdateCustomQuestion } from '@/app/apis/questions';
import { useFetchQuestionsByTabId } from '@/app/apis/tabs';
import { useFetchQuestionsByTagId } from '@/app/apis/tags';
import CustomEditor from '@/app/components/custom-editor';
import LexicalProvider from '@/app/editor/provider';
import { getQueryClient } from '@/app/get-query-client';
import useToast from '@/app/hooks/toast';
import { sanitizeInput } from '@/app/tools';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button, ButtonGroup, Card, CardBody, CardHeader, Input, Label, Text } from 'bootstrap-react-logic';
import clsx from 'clsx';
import { $getRoot, $insertNodes } from 'lexical';
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
    question: isUpdate ? (question ?? '') : '',
  });
  const toastRef = useToast();
  const createCustomQuestion = useCreateCustomQuestion();
  const updateCustomQuestion = useUpdateCustomQuestion(questionId);
  const isLoading = isUpdate ? updateCustomQuestion.isPending : createCustomQuestion.isPending;
  const [editor] = useLexicalComposerContext();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    setForm({
      question: isUpdate ? (question ?? '') : '',
    });

    const _answer = isUpdate ? (answer ?? '') : '';
    if (isInitialized && isMounted && _answer) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(_answer, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.select();
        $insertNodes(nodes);
      });
    } else if (!isUpdate) {
      editor.update(() => $getRoot().clear());
    }

    return () => {
      isMounted = false;
    };
  }, [answer, editor, isInitialized, isUpdate, question]);
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  function getAnswer() {
    const htmlString = editor.read(() => $generateHtmlFromNodes(editor, null));
    return sanitizeInput(htmlString || '').trim();
  }

  // function onClickSave2(e: FormEvent<HTMLFormElement>) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //
  //   const answer = getAnswer();
  //   console.log(answer);
  // }

  async function onClickSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();

    const toast = toastRef.current;
    if (!toast) {
      return;
    }

    const { question } = form;
    const answer = getAnswer();

    if (!answer || !question.trim()) {
      toast.showToast('Answer and question cannot be empty', 'danger');
      return;
    }

    try {
      const newAnswer = answer;
      const newQuestion = question.trim();

      if (isUpdate) {
        await updateCustomQuestion.mutateAsync({
          answer: newAnswer,
          question: newQuestion,
          tabId,
          tagId,
        });
      } else {
        await createCustomQuestion.mutateAsync({
          answer: newAnswer,
          question: newQuestion,
          tabId,
          tagId,
        });
        setForm({ question: '' });
        editor.update(() => $getRoot().clear());
      }

      refreshQuery();

      toast.showToast('Saved successfully', 'success');
    } catch (error) {
      toast.showToast(`Failed to save: ${(error as IError).message}`, 'danger');
    }
  }

  function refreshQuery() {
    const queryClient = getQueryClient();

    if (tabId) {
      queryClient.refetchQueries({
        predicate: (query: { queryKey: string[] }) => query.queryKey.includes(useFetchQuestionsByTabId.key),
        type: 'active',
      });
    }

    if (tagId) {
      queryClient.refetchQueries({
        predicate: (query: { queryKey: string[] }) => query.queryKey.includes(useFetchQuestionsByTagId.key),
        type: 'active',
      });
    }

    if (!tabId && !tagId) {
      queryClient.refetchQueries({
        predicate: (query: { queryKey: string[] }) => query.queryKey.includes(useFetchQuestions.key),
        type: 'active',
      });
    }
  }

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <form onSubmit={onClickSave}>
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
        <CustomEditor placeholder="Enter the answer" />
        <Text>Providing a clear and concise answer helps improve understanding and retention.</Text>
      </div>

      <Button className="mt-5 px-5" disabled={isLoading} isLoading={isLoading} type="submit" variant="primary">
        Save
      </Button>
    </form>
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
    <LexicalProvider>
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
    </LexicalProvider>
  );
}
