'use client';

import type { IQuestion } from '@/app/interfaces/question';
import type { ITab } from '@/app/interfaces/tab';
import type { ITag } from '@/app/interfaces/tag';
import type { SidebarOption } from 'bootstrap-react-logic';
import type { MouseEvent } from 'react';

import { useFetchQuestions } from '@/app/apis/questions';
import { useFetchTabs, useFetchTagsByTabId } from '@/app/apis/tabs';
import { useFetchQuestionsByTagId, useFetchTags } from '@/app/apis/tags';
import { useFetchUserProfile } from '@/app/apis/users';
import { TK } from '@/app/constants';
import ManageQuestion from '@/app/home/manage-question';
import ManageTab from '@/app/home/manage-tab';
import ManageTag from '@/app/home/manage-tag';
import useThemeMode from '@/app/hooks/theme-mode';
import { getPublicPath } from '@/app/tools';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardText,
  CardTitle,
  CloseButton,
  Modal,
  Sidebar,
} from 'bootstrap-react-logic';
import clsx from 'clsx';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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
  const [sidebarOptions, setSidebarOptions] = useState<SidebarOption[]>([loadingPlaceholderOption]);
  const [activeManagementType, setActiveManagementType] = useState<'manageQuestion' | 'manageTab' | 'manageTag' | null>(
    null,
  );
  const [selectedTab, setSelectedTab] = useState<ITab | null>(null);
  const [selectedTag, setSelectedTag] = useState<ITag | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<IQuestion | null>(null);
  const [tagList, setTagList] = useState<ITag[]>([]);
  const [questionList, setQuestionList] = useState<IQuestion[]>([]);
  const [isLogoutModalVisible, setLogoutModalVisibility] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [isDarkModeEnabled, toggleThemeMode] = useThemeMode();
  const userProfileQuery = useFetchUserProfile();
  const tabsQuery = useFetchTabs();
  const tagsQuery = useFetchTags(!selectedTab);
  const tagsByTabIdQuery = useFetchTagsByTabId(selectedTab?.id);
  const questionsQuery = useFetchQuestions(!selectedTab && !selectedTag);
  const questionsByTagIdQuery = useFetchQuestionsByTagId(selectedTag?.id);
  const isAllQuestionsExpanded = useMemo(() => questionList.some((question) => !!question.expand), [questionList]);

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
              setActiveManagementType((prevState) => (prevState === 'manageQuestion' ? null : 'manageQuestion'));
            },
          },
        ]);
      } else {
        setSidebarOptions(
          tabsQuery.data.map(
            (tab): SidebarOption => ({
              icon: <i className="bi bi-folder"></i>,
              id: tab.id,
              name: tab.name,
              onClick: (e) => {
                e.preventDefault();
                setSelectedTab((prevTab) => (prevTab?.id === tab.id ? null : tab));
              },
            }),
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
  function handleLogout() {
    setLogoutModalVisibility(true);
  }
  function closeLogoutModal() {
    setLogoutModalVisibility(false);
  }
  function confirmLogout() {
    localStorage.removeItem(TK);
    location.assign(publicPath + '/login');
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
                      onClick={handleLogout}
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
                    <Link href={publicPath + '/'}>
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
                    <Link className="text-decoration-none link-body-emphasis fs-5" href={publicPath + '/'}>
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
                      tabId={selectedTab?.id ?? selectedTag?.tab?.id}
                      tabName={selectedTab?.name ?? selectedTag?.tab?.name}
                      tagId={selectedTag?.id}
                      tagName={selectedTag?.name}
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

                      {questionList.length > 0 && (
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
                  <div className="container py-3">
                    <div className="row row-cols-3 g-3">
                      {questionList.length > 0 ? (
                        questionList.map((question) => {
                          return (
                            <div className={clsx(question.expand ? 'col-12' : 'col')} key={question.id}>
                              <Card className="h-100 rounded-4 border">
                                <CardBody className="overflow-hidden position-relative" style={{ maxHeight: 512 }}>
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
                                  </div>
                                </CardBody>
                                <CardFooter className="border-top d-flex gap-2 align-items-center justify-content-between">
                                  <CardText className="card-text small text-secondary" dropOldClass>
                                    {format(question.updateDate || question.createDate, 'yyyy-MM-dd')}
                                  </CardText>

                                  <div className="hstack gap-1">
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isInitialized && (
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
              <Button onClick={closeLogoutModal} type="button" variant="secondary">
                Cancel
              </Button>
              <Button onClick={confirmLogout} type="button" variant="primary">
                Logout
              </Button>
            </>
          }
          header={<CloseButton onClick={closeLogoutModal} type="button" />}
          onVisibleChange={setLogoutModalVisibility}
          tabIndex={-1}
          title="PrepForge"
          visible={isLogoutModalVisible}
        />
      )}
    </>
  );
}
