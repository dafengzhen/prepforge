'use client';

import type { IError } from '@/app/interfaces';
import type { IQuestion } from '@/app/interfaces/question';
import type { ITab } from '@/app/interfaces/tab';
import type { ITag } from '@/app/interfaces/tag';
import type { SidebarOption } from 'bootstrap-react-logic';
import type { MouseEvent } from 'react';

import { useDeleteCustomQuestion, useFetchQuestions } from '@/app/apis/questions';
import { useFetchQuestionsByTabId, useFetchTabs, useFetchTagsByTabId } from '@/app/apis/tabs';
import { useFetchQuestionsByTagId, useFetchTags } from '@/app/apis/tags';
import { useFetchUserProfile } from '@/app/apis/users';
import { getQueryClient } from '@/app/get-query-client';
import ManageQuestion from '@/app/home/manage-question';
import ManageTab from '@/app/home/manage-tab';
import ManageTag from '@/app/home/manage-tag';
import useThemeMode from '@/app/hooks/theme-mode';
import useToast from '@/app/hooks/toast';
import { getPublicPath } from '@/app/tools';
import { eventBus } from '@/app/tools/event-bus';
import { EVENT_UNAUTHORIZED } from '@/app/tools/event-types';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardText,
  CardTitle,
  Checkbox,
  CloseButton,
  Input,
  Label,
  Modal,
  Sidebar,
} from 'bootstrap-react-logic';
import clsx from 'clsx';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';

const publicPath = getPublicPath();

const loadingPlaceholderOption: SidebarOption = {
  icon: <i className="bi bi-folder"></i>,
  id: 'loading',
  name: 'Loading...',
};

const addTabOption: SidebarOption = {
  icon: <i className="bi bi-plus-lg"></i>,
  id: 'addTab',
  name: 'Add Tab',
};

export default function Home() {
  const itemsPerPage = 10;

  const [sidebarOptions, setSidebarOptions] = useState<SidebarOption[]>([loadingPlaceholderOption]);
  const [activeManagementType, setActiveManagementType] = useState<'manageQuestion' | 'manageTab' | 'manageTag' | null>(
    null,
  );
  const [selectedTab, setSelectedTab] = useState<ITab | null>(null);
  const [selectedTag, setSelectedTag] = useState<ITag | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<IQuestion | null>(null);
  const [tagList, setTagList] = useState<ITag[]>([]);
  const [questionList, setQuestionList] = useState<IQuestion[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [modals, setModals] = useState({
    deleteQuestion: false,
    logout: false,
  });
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);
  const isStale = searchValue !== deferredSearchValue;
  const [includeContent, setIncludeContent] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const toastRef = useToast();
  const [isDarkModeEnabled, toggleThemeMode] = useThemeMode();
  const userProfileQuery = useFetchUserProfile();
  const tabsQuery = useFetchTabs();
  const tagsQuery = useFetchTags(!selectedTab);
  const tagsByTabIdQuery = useFetchTagsByTabId(selectedTab?.id);
  const questionsQuery = useFetchQuestions(!selectedTab && !selectedTag);
  const questionsByTagIdQuery = useFetchQuestionsByTagId(selectedTag?.id);
  const questionsByTabIdQuery = useFetchQuestionsByTabId(selectedTab?.id);
  const deleteCustomQuestionQuery = useDeleteCustomQuestion(selectedQuestion?.id);
  const filteredQuestionList = useMemo(() => {
    const value = deferredSearchValue.trim();
    if (value) {
      const searchValue = caseSensitive ? value : value.toLowerCase();
      return questionList.filter((item) => {
        const questionText = caseSensitive ? item.question : item.question?.toLowerCase();
        const answerText = caseSensitive ? item.answer : item.answer?.toLowerCase();

        if (includeContent) {
          return questionText?.includes(searchValue) || answerText?.includes(searchValue);
        } else {
          return questionText?.includes(searchValue);
        }
      });
    } else {
      return questionList;
    }
  }, [deferredSearchValue, includeContent, questionList, caseSensitive]);
  const paginatedQuestionList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredQuestionList.slice(startIndex, endIndex);
  }, [currentPage, filteredQuestionList]);
  const totalPages = useMemo(
    () => Math.ceil(filteredQuestionList.length / itemsPerPage),
    [filteredQuestionList.length],
  );
  const isAllQuestionsExpanded = useMemo(
    () => filteredQuestionList.some((question) => !!question.expand),
    [filteredQuestionList],
  );

  useEffect(() => {
    if (!selectedTab && !selectedTag && questionsQuery.data) {
      setQuestionList(questionsQuery.data);
    }
  }, [selectedTab, selectedTag, questionsQuery.data]);
  useEffect(() => {
    if (questionsByTagIdQuery.data) {
      setQuestionList(questionsByTagIdQuery.data);
    }
  }, [questionsByTagIdQuery.data]);
  useEffect(() => {
    if (questionsByTabIdQuery.data) {
      setQuestionList(questionsByTabIdQuery.data);
    }
  }, [questionsByTabIdQuery.data]);
  useEffect(() => {
    if (!selectedTab && tagsQuery.data) {
      setTagList(tagsQuery.data);
    }
  }, [selectedTab, tagsQuery.data]);
  useEffect(() => {
    if (tagsByTabIdQuery.data) {
      setTagList(tagsByTabIdQuery.data);
    }
  }, [tagsByTabIdQuery.data]);
  useEffect(() => {
    if (tabsQuery.data) {
      if (tabsQuery.data.length === 0) {
        setSidebarOptions([
          {
            ...addTabOption,
            onClick: (e) => {
              e.preventDefault();
              setActiveManagementType((prevState) => (prevState === 'manageTab' ? null : 'manageTab'));
            },
          },
        ]);
      } else {
        setSidebarOptions(
          tabsQuery.data.map(
            (tab: ITab) =>
              ({
                icon: <i className="bi bi-folder"></i>,
                id: tab.id,
                name: tab.name,
                onClick: (e) => {
                  e.preventDefault();
                  setSelectedTab((prevTab) => (prevTab?.id === tab.id ? null : tab));
                },
              }) as SidebarOption,
          ),
        );
      }
    }
  }, [tabsQuery.data]);
  useEffect(() => {
    if (
      userProfileQuery.isSuccess &&
      (!userProfileQuery.data ||
        typeof userProfileQuery.data !== 'object' ||
        Object.keys(userProfileQuery.data).length === 0)
    ) {
      location.assign(publicPath + '/login');
    }
  }, [userProfileQuery.data, userProfileQuery.isSuccess]);
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  function toggleExpandAllQuestions() {
    const shouldExpand = !isAllQuestionsExpanded;
    setQuestionList((prevQuestions) =>
      prevQuestions.map((question) => ({
        ...question,
        expand: shouldExpand,
      })),
    );
  }
  function toggleQuestionExpansion(event: MouseEvent<HTMLAnchorElement>, question: IQuestion) {
    event.preventDefault();
    setQuestionList((prevQuestions) =>
      prevQuestions.map((q) => (q.id === question.id ? { ...q, expand: !q.expand } : q)),
    );
  }
  function toggleManagementType(type: 'manageQuestion' | 'manageTab' | 'manageTag') {
    setActiveManagementType((prevType) => (prevType === type ? null : type));
  }
  function confirmLogout() {
    eventBus.emit(EVENT_UNAUTHORIZED);
    location.assign(publicPath + '/login');
  }
  function cancelDeleteQuestion() {
    setSelectedQuestion(null);
    toggleModal('deleteQuestion', false);
  }
  async function confirmDeleteQuestion() {
    const toast = toastRef.current;
    if (!toast) {
      return;
    }

    if (!selectedQuestion) {
      toast.showToast('The question to be deleted does not exist', 'danger');
      return;
    }

    try {
      await deleteCustomQuestionQuery.mutateAsync();
      toast.showToast('Deleted successfully', 'success');

      setSelectedQuestion(null);
      refetchQueriesByKey(useFetchQuestions.key);

      if (selectedTab) {
        refetchQueriesByKey(useFetchQuestionsByTabId.key);
      }

      if (selectedTag) {
        refetchQueriesByKey(useFetchQuestionsByTagId.key);
      }

      toggleModal('deleteQuestion', false);
    } catch (error) {
      toast.showToast((error as IError).message, 'danger');
    }
  }
  function toggleModal(modalName: 'deleteQuestion' | 'logout', isVisible: boolean = true) {
    setModals((prev) => ({ ...prev, [modalName]: isVisible }));
  }
  async function refetchQueriesByKey(key: string) {
    getQueryClient().refetchQueries({
      predicate: (query: { queryKey: string[] }) => query.queryKey.includes(key),
      type: 'active',
    });
  }
  function prevPage() {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  }
  function nextPage() {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  }
  function loadMorePage() {
    const toast = toastRef.current;
    if (!toast) {
      return;
    }

    if (currentPage === totalPages || totalPages === 0) {
      toast.showToast('No more data available', 'primary');
      return;
    }

    nextPage();
  }

  return (
    <>
      <div className="container-fluid ps-0">
        <div className="row">
          <div className="col-auto">
            <Card cardBody className="border-0 border-end p-0 rounded-0">
              <Sidebar
                className="vh-100"
                footer={
                  <div className="d-flex align-items-center justify-content-between">
                    <Button
                      className="btn border-0 text-secondary"
                      dropOldClass
                      onClick={toggleThemeMode}
                      size="sm"
                      startContent={
                        <i
                          className={clsx(
                            'bi me-1',
                            isDarkModeEnabled ? 'bi-moon-stars-fill' : 'bi-brightness-high-fill',
                          )}
                        ></i>
                      }
                      title="Toggle Theme"
                    >
                      {isDarkModeEnabled ? 'Dark' : 'Light'}
                    </Button>

                    <Button
                      className="btn border-0 text-secondary"
                      dropOldClass
                      onClick={() => toggleModal('logout', true)}
                      size="sm"
                      startContent={<i className="bi bi-box-arrow-in-right cursor-pointer me-1" title="Logout" />}
                      title="Logout"
                    >
                      Logout
                    </Button>
                  </div>
                }
                header={{
                  icon: (
                    <Link href="./">
                      <Image
                        alt="prepforge"
                        className="rounded-circle"
                        height={36}
                        priority
                        src={publicPath + '/images/logo.png'}
                        width={36}
                      />
                    </Link>
                  ),
                  name: (
                    <Link className="text-decoration-none link-body-emphasis fs-5" href="./">
                      PrepForge
                    </Link>
                  ),
                }}
                onOptionChange={setSidebarOptions}
                options={sidebarOptions}
                preventToggleActive
              />
            </Card>
          </div>
          <div className="col vh-100 d-flex flex-column px-0">
            <div className="flex-shrink-0 container-fluid py-3">
              <div className="row row-cols-auto g-2 justify-content-end">
                <div className="col">
                  <Button
                    active={activeManagementType === 'manageQuestion'}
                    className="w-100"
                    onClick={() => toggleManagementType('manageQuestion')}
                    outline="secondary"
                    rounded="pill"
                    size="sm"
                    startContent={<i className="bi bi-question-diamond me-1"></i>}
                  >
                    Manage Question
                  </Button>
                </div>
                <div className="col">
                  <Button
                    active={activeManagementType === 'manageTag'}
                    className="w-100"
                    onClick={() => toggleManagementType('manageTag')}
                    outline="secondary"
                    rounded="pill"
                    size="sm"
                    startContent={<i className="bi bi-tag me-1"></i>}
                  >
                    Manage Tag
                  </Button>
                </div>
                <div className="col">
                  <Button
                    active={activeManagementType === 'manageTab'}
                    className="w-100"
                    onClick={() => toggleManagementType('manageTab')}
                    outline="secondary"
                    rounded="pill"
                    size="sm"
                    startContent={<i className="bi bi-folder me-1"></i>}
                  >
                    Manage Tab
                  </Button>
                </div>
              </div>

              {!activeManagementType && (
                <div className="container py-3">
                  <div className="vstack gap-2">
                    <Label className="text-secondary">Search</Label>
                    <Input
                      endContent={<i className="bi bi-search text-secondary"></i>}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Please enter"
                      startEndContentClasses={{
                        container: (originalClass) => clsx(originalClass, 'w-100'),
                      }}
                      type="search"
                      value={searchValue}
                    />
                    <div className="d-flex gap-3">
                      <div className="d-flex gap-2">
                        <Checkbox
                          checked={includeContent}
                          id="includeContent"
                          name="includeContent"
                          onChange={(e) => setIncludeContent(e.target.checked)}
                          value="includeContent"
                        />
                        <Label className="text-secondary user-select-none" formCheckLabel htmlFor="includeContent">
                          Include Content
                        </Label>
                      </div>

                      <div className="d-flex gap-2">
                        <Checkbox
                          checked={caseSensitive}
                          id="caseSensitive"
                          name="caseSensitive"
                          onChange={(e) => setCaseSensitive(e.target.checked)}
                          value="caseSensitive"
                        />
                        <Label className="text-secondary user-select-none" formCheckLabel htmlFor="caseSensitive">
                          Case Sensitive
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-grow-1 overflow-y-auto">
              {activeManagementType ? (
                <div className="container py-3">
                  {activeManagementType === 'manageTab' && (
                    <ManageTab
                      onBack={() => setActiveManagementType(null)}
                      tabId={selectedTab?.id ?? selectedTag?.tab?.id}
                      tabName={selectedTab?.name ?? selectedTag?.tab?.name}
                    />
                  )}
                  {activeManagementType === 'manageTag' && (
                    <ManageTag
                      onBack={() => setActiveManagementType(null)}
                      tabId={selectedTab?.id ?? selectedTag?.tab?.id}
                      tabName={selectedTab?.name ?? selectedTag?.tab?.name}
                      tagId={selectedTag?.id}
                      tagName={selectedTag?.name}
                    />
                  )}
                  {activeManagementType === 'manageQuestion' && (
                    <ManageQuestion
                      answer={selectedQuestion?.answer}
                      manageType={selectedQuestion ? 'edit' : 'add'}
                      onBack={() => {
                        setSelectedQuestion(null);
                        setActiveManagementType(null);
                      }}
                      question={selectedQuestion?.question}
                      questionId={selectedQuestion?.id}
                      tabId={selectedTab?.id ?? selectedTag?.tab?.id ?? selectedQuestion?.tab?.id}
                      tabName={selectedTab?.name ?? selectedTag?.tab?.name ?? selectedQuestion?.tab?.name}
                      tagId={selectedTag?.id ?? selectedQuestion?.tag?.id}
                      tagName={selectedTag?.name ?? selectedQuestion?.tag?.name}
                    />
                  )}
                </div>
              ) : (
                <>
                  <div className="container py-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="row row-cols-auto g-2">
                        {tagList.map((tag) => {
                          const isActive = selectedTag?.id === tag.id;
                          return (
                            <div className="col" key={tag.id}>
                              <Button
                                className="w-100"
                                onClick={() => setSelectedTag(isActive ? null : tag)}
                                outline={isActive ? undefined : 'secondary'}
                                rounded="pill"
                                startContent={<i className={clsx('bi me-1', isActive ? 'bi-tag-fill' : 'bi-tag')}></i>}
                                variant={isActive ? 'primary' : undefined}
                              >
                                {tag.name}
                              </Button>
                            </div>
                          );
                        })}
                      </div>

                      {paginatedQuestionList.length > 0 && (
                        <div className="row row-cols-auto g-2">
                          <div className="col">
                            <Button
                              className="text-decoration-none text-secondary w-100"
                              onClick={toggleExpandAllQuestions}
                              rounded="pill"
                              startContent={
                                <i
                                  className={clsx(
                                    'bi me-1',
                                    isAllQuestionsExpanded ? 'bi-chevron-expand' : 'bi-chevron-contract',
                                  )}
                                ></i>
                              }
                              variant="link"
                            >
                              {isAllQuestionsExpanded ? 'Collapse all' : 'Expand all'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className="container py-3"
                    style={{
                      opacity: isStale ? 0.5 : 1,
                      transition: isStale ? 'opacity 0.2s 0.2s linear' : 'opacity 0s 0s linear',
                    }}
                  >
                    <div className="row row-cols-3 g-3">
                      {paginatedQuestionList.length > 0 ? (
                        paginatedQuestionList.map((question) => {
                          return (
                            <div className={clsx(question.expand ? 'col-12' : 'col')} key={question.id}>
                              <Card
                                className={clsx(
                                  'h-100 rounded-4 border',
                                  selectedQuestion?.id === question.id && 'border-primary-subtle',
                                )}
                              >
                                <CardBody
                                  className="overflow-hidden position-relative"
                                  style={{ maxHeight: question.expand ? undefined : 512 }}
                                >
                                  <CardTitle className="leading-normal mb-3">
                                    <Link
                                      className="link-offset-2 link-underline link-underline-opacity-0 link-underline-opacity-100-hover"
                                      href=""
                                      onClick={(e) => toggleQuestionExpansion(e, question)}
                                    >
                                      {question.question}
                                    </Link>
                                  </CardTitle>

                                  {question.answer && (
                                    <CardText
                                      className={clsx('text-body-secondary lh-lg', !question.expand && 'text-ellipsis')}
                                      dangerouslySetInnerHTML={{ __html: question.answer }}
                                    />
                                  )}

                                  <div
                                    className="position-absolute bottom-0 start-50 translate-middle-x w-100 px-3 text-end pt-1 text-secondary"
                                    style={{ background: 'var(--bs-card-cap-bg)' }}
                                  >
                                    <i
                                      className="bi bi-pencil-square cursor-pointer"
                                      onClick={() => {
                                        setSelectedQuestion(question);
                                        setActiveManagementType('manageQuestion');
                                      }}
                                    ></i>
                                    <i
                                      className="bi bi-trash cursor-pointer ms-1"
                                      onClick={() => {
                                        setSelectedQuestion(question);
                                        toggleModal('deleteQuestion');
                                      }}
                                    ></i>
                                  </div>
                                </CardBody>
                                <CardFooter className="border-top d-flex flex-wrap gap-2 align-items-center justify-content-between">
                                  <CardText className="card-text small text-secondary flex-shrink-0" dropOldClass>
                                    {format(question.updateDate || question.createDate, 'yyyy-MM-dd')}
                                  </CardText>

                                  <div className="hstack gap-1">
                                    {question.tab && (
                                      <div className="rounded bg-secondary-subtle px-2">
                                        <Link
                                          className="small link-secondary text-decoration-none cursor-not-allowed"
                                          href=""
                                          onClick={(e) => e.preventDefault()}
                                        >
                                          <i className="bi bi-folder me-1"></i>
                                          {question.tab.name}
                                        </Link>
                                      </div>
                                    )}

                                    {question.tag && (
                                      <div className="rounded bg-secondary-subtle px-2">
                                        <Link
                                          className="small link-secondary text-decoration-none cursor-not-allowed"
                                          href=""
                                          onClick={(e) => e.preventDefault()}
                                        >
                                          <i className="bi bi-tag me-1"></i>
                                          {question.tag.name}
                                        </Link>
                                      </div>
                                    )}

                                    <div className="rounded bg-secondary-subtle px-2">
                                      <Link
                                        className="small link-secondary text-decoration-none"
                                        href=""
                                        onClick={(e) => toggleQuestionExpansion(e, question)}
                                      >
                                        {question.expand ? 'Collapse' : 'Read More'}
                                      </Link>
                                    </div>
                                  </div>
                                </CardFooter>
                              </Card>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-12" style={{ height: 420 }}>
                          <Card
                            cardBody
                            className="h-100 rounded-4 border d-flex align-items-center justify-content-center bg-body-tertiary"
                          >
                            <div className="fs-5 text-secondary text-opacity-50">No Data</div>
                          </Card>
                        </div>
                      )}
                    </div>
                  </div>
                  {totalPages > 1 && (
                    <div className="container py-3 pb-4">
                      <div className="row">
                        <div className="col">
                          <Button
                            className="w-100"
                            disabled={currentPage === 1}
                            onClick={prevPage}
                            type="button"
                            variant="primary"
                          >
                            Prev Page
                          </Button>
                        </div>
                        <div className="col">
                          <Button className="w-100" onClick={loadMorePage} type="button" variant="primary">
                            {`Load More (${currentPage} - ${totalPages})`}
                          </Button>
                        </div>
                        <div className="col">
                          <Button
                            className="w-100"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={nextPage}
                            type="button"
                            variant="primary"
                          >
                            Next Page
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isInitialized && (
        <>
          <Modal
            body={
              <div className="leading-normal">
                <div>Are you sure you want to log out?</div>
                <div className="text-secondary">You will not be able to continue browsing after logging out.</div>
              </div>
            }
            centered
            footer={
              <>
                <Button onClick={() => toggleModal('logout', false)} type="button" variant="secondary">
                  Cancel
                </Button>
                <Button onClick={confirmLogout} type="button" variant="primary">
                  Confirm
                </Button>
              </>
            }
            header={<CloseButton onClick={() => toggleModal('logout', false)} type="button" />}
            onVisibleChange={(value) => toggleModal('logout', value)}
            tabIndex={-1}
            title="PrepForge"
            visible={modals.logout}
          />

          <Modal
            body={
              <div className="leading-normal">
                <div>Are you sure you want to delete this question?</div>
                {selectedQuestion && (
                  <div className="text-secondary">
                    Question: <span className="text-danger fw-bold">{selectedQuestion.question}</span>
                  </div>
                )}
              </div>
            }
            centered
            footer={
              <>
                <Button onClick={cancelDeleteQuestion} type="button" variant="secondary">
                  Cancel
                </Button>
                <Button onClick={confirmDeleteQuestion} type="button" variant="primary">
                  Delete
                </Button>
              </>
            }
            header={<CloseButton onClick={cancelDeleteQuestion} type="button" />}
            onVisibleChange={(value) => {
              setSelectedQuestion(null);
              toggleModal('deleteQuestion', value);
            }}
            tabIndex={-1}
            title="PrepForge"
            visible={modals.deleteQuestion}
          />
        </>
      )}
    </>
  );
}
