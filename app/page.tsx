'use client';

import { Listbox, ListboxItem } from '@nextui-org/listbox';
import { ScrollShadow } from '@nextui-org/scroll-shadow';
import { User } from '@nextui-org/user';
import { Image } from '@nextui-org/image';
import { Button } from '@nextui-org/button';
import { Skeleton } from '@nextui-org/skeleton';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/dropdown';
import { useCallback, useEffect, useState } from 'react';
import { CircleHalfIcon } from '@/app/icons/circle-half-icon';
import { TranslateIcon } from '@/app/icons/translate-icon';
import {
  useCustomTabOptions,
  useGetTabsOptions,
  useGetTagsByIdOptions,
} from '@/app/options/tabs';
import { Spinner } from '@nextui-org/spinner';
import { Chip } from '@nextui-org/chip';
import type { ITab } from '@/app/interfaces/tab';
import { CheckLgIcon } from '@/app/icons/check-lg-icon';
import clsx from 'clsx';
import { useGetProfileOptions } from '@/app/options/users';
import type { IUser } from '@/app/interfaces/user';
import { format } from 'date-fns';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { ArrowsCollapseIcon } from '@/app/icons/arrows-collapse-icon';
import { ChevronDoubleUpIcon } from '@/app/icons/chevron-double-up-icon';
import { Input, Textarea } from '@nextui-org/input';
import { PlusLgIcon } from '@/app/icons/plus-lg-icon';
import { Select, SelectItem } from '@nextui-org/select';
import { SaveIcon } from '@/app/icons/save-icon';
import { ArrowsExpandIcon } from '@/app/icons/arrows-expand-icon';
import { ChevronDoubleDownIcon } from '@/app/icons/chevron-double-down-icon';
import { KEY_PREFIX, TK } from '@/app/constants';
import type { ITag } from '@/app/interfaces/tag';
import toast from 'react-hot-toast';
import type { IError } from '@/app/interfaces';
import {
  useCustomTagOptions,
  useGetQuestionsByIdOptions,
  useGetTagsOptions,
} from '@/app/options/tags';
import { Tab, Tabs } from '@nextui-org/tabs';
import type { IQuestion } from '@/app/interfaces/question';
import {
  useCustomQuestionOptions,
  useGetQuestionsOptions,
} from '@/app/options/questions';
import { Accordion, AccordionItem } from '@nextui-org/accordion';
import { isNumeric } from '@/app/tool';
import { Modal, ModalBody, ModalContent } from '@nextui-org/modal';
import { useDisclosure } from '@nextui-org/use-disclosure';
import { LayoutSidebarIcon } from '@/app/icons/layout-sidebar-icon';
import { useTheme } from 'next-themes';

// Important 🚨: Note that you need to import the component from the individual package, not from @nextui-org/react.

const LOCAL_STORAGE_CONFIG_COLLAPSE_KEY = KEY_PREFIX + 'config_collapse';
const LOCAL_STORAGE_CONFIG_CHEVRONDOUBLEUP_KEY =
  KEY_PREFIX + 'config_chevronDoubleUp';

export default function Page() {
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState({
    customTab: '',
    customTag: '',
    question: '',
    answer: '',
    selectTab: '',
    selectTag: '',
  });

  const {
    isOpen: isOpenLayoutSidebar,
    onOpen: onOpenLayoutSidebar,
    onClose: onCloseLayoutSidebar,
    onOpenChange: onOpenChangeLayoutSidebar,
  } = useDisclosure();

  const [tabs, setTabs] = useState<ITab[]>([]);
  const [tabsRenderingCompleted, setTabsRenderingCompleted] = useState(false);
  const [selectedTabKey, setSelectedTabKey] = useState<number>();

  const [tags, setTags] = useState<ITag[]>([]);
  const [tagsRenderingCompleted, setTagsRenderingCompleted] = useState(false);
  const [selectedTagKey, setSelectedTagKey] = useState<number>();

  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [questionsRenderingCompleted, setQuestionsRenderingCompleted] =
    useState(false);
  const [selectedQuestionsKey, setSelectedQuestionsKey] = useState<number>();

  const [currentUser, setCurrentUser] = useState<IUser>();

  const [collapse, setCollapse] = useState(true);
  const [chevronDoubleUp, setChevronDoubleUp] = useState(false);
  const [trash, setTrash] = useState(false);

  const getTabsOptions = useGetTabsOptions();
  const getTagsOptions = useGetTagsOptions();
  const getQuestionsOptions = useGetQuestionsOptions();
  const getTagsByIdOptions = useGetTagsByIdOptions(selectedTabKey);
  const getQuestionsByIdOptions = useGetQuestionsByIdOptions(selectedTagKey);
  const getProfileOptions = useGetProfileOptions();
  const customTabOptions = useCustomTabOptions();
  const customTagOptions = useCustomTagOptions();
  const customQuestionOptions = useCustomQuestionOptions();

  const [selectedKeysTranslate, setSelectedKeysTranslate] = useState<any>(
    new Set(['english']),
  );
  const [selectedKeysDarkMode, setSelectedKeysDarkMode] = useState<any>(
    new Set([theme ?? 'light']),
  );

  const updateTagQuestions = useCallback(
    (id: number, data: IQuestion[]) => {
      const find = tags.find((item) => item.id === id);
      if (find) {
        find.questions = data;
        setTags(tags);
      }
    },
    [tags],
  );

  useEffect(() => {
    if (getTabsOptions.data) {
      setTabs(getTabsOptions.data);
    }
  }, [getTabsOptions.data]);
  useEffect(() => {
    setTabsRenderingCompleted(true);
  }, [tabs]);

  useEffect(() => {
    if (getTagsByIdOptions.data && getTagsByIdOptions.data.tags) {
      setTags(getTagsByIdOptions.data.tags);
    }
  }, [getTagsByIdOptions.data]);
  useEffect(() => {
    if (
      getTagsOptions.data ||
      (getTagsOptions.data && selectedTabKey === undefined)
    ) {
      setTags(getTagsOptions.data);
    }
  }, [getTagsOptions.data, selectedTabKey]);
  useEffect(() => {
    setTagsRenderingCompleted(true);
    setQuestionsRenderingCompleted(true);
  }, [tags]);

  useEffect(() => {
    if (
      getQuestionsByIdOptions.data &&
      getQuestionsByIdOptions.data.questions &&
      typeof selectedTagKey === 'number'
    ) {
      setQuestions(getQuestionsByIdOptions.data.questions);
      updateTagQuestions(
        selectedTagKey,
        getQuestionsByIdOptions.data.questions,
      );
    }
  }, [getQuestionsByIdOptions.data, selectedTagKey, updateTagQuestions]);
  useEffect(() => {
    if (getQuestionsOptions.data) {
      setQuestions(getQuestionsOptions.data);
      updateTagQuestions(-1, getQuestionsOptions.data);
    }
  }, [getQuestionsOptions.data, updateTagQuestions]);
  useEffect(() => {
    setQuestionsRenderingCompleted(true);
  }, [questions]);

  useEffect(() => {
    if (getProfileOptions.data) {
      setCurrentUser(getProfileOptions.data);
    }
  }, [getProfileOptions.data]);

  useEffect(() => {
    if (localStorage !== undefined) {
      /// collapse
      const collapseValue = localStorage.getItem(
        LOCAL_STORAGE_CONFIG_COLLAPSE_KEY,
      );
      if (collapseValue === 'true') {
        setCollapse(true);
      } else if (collapseValue === 'false') {
        setCollapse(false);
      } else {
        setCollapse(true);
      }

      /// chevronDoubleUp
      const chevronDoubleUpValue = localStorage.getItem(
        LOCAL_STORAGE_CONFIG_CHEVRONDOUBLEUP_KEY,
      );
      setChevronDoubleUp(chevronDoubleUpValue === 'true');

      // check login
      if (!localStorage.getItem(TK)) {
        location.assign('/login');
      }
    }
  }, []);

  function onClickLayoutSidebar() {
    if (isOpenLayoutSidebar) {
      onCloseLayoutSidebar();
    } else {
      onOpenLayoutSidebar();
    }
  }
  function onClickCollapse() {
    const value = !collapse;
    setCollapse(value);
    localStorage.setItem(LOCAL_STORAGE_CONFIG_COLLAPSE_KEY, String(value));
  }
  function onClickChevronDoubleUp() {
    if (collapse) {
      setCollapse(false);
      setChevronDoubleUp(true);
      localStorage.setItem(LOCAL_STORAGE_CONFIG_COLLAPSE_KEY, String(false));
      localStorage.setItem(
        LOCAL_STORAGE_CONFIG_CHEVRONDOUBLEUP_KEY,
        String(true),
      );
    } else {
      const value = !chevronDoubleUp;
      setChevronDoubleUp(value);
      localStorage.setItem(
        LOCAL_STORAGE_CONFIG_CHEVRONDOUBLEUP_KEY,
        String(value),
      );
    }
  }
  function onClickTrash() {
    setTrash(!trash);
  }
  async function onClickCustomTab() {
    const customTab = form.customTab.trim();

    if (customTab === '') {
      toast.error('Tab name cannot be empty');
      return;
    }

    try {
      await customTabOptions.mutateAsync({
        name: customTab,
      });

      setForm({ ...form, customTab: '' });
      toast.success('Successfully created tab');

      getTabsOptions.refetch();
    } catch (e) {
      const error = e as IError;
      toast.error(error.message);
    }
  }
  async function onClickCustomTag() {
    const customTag = form.customTag.trim();
    const selectTab = form.selectTab.trim();

    if (customTag === '') {
      toast.error('Tag name cannot be empty');
      return;
    }

    try {
      await customTagOptions.mutateAsync({
        name: customTag,
        tabId:
          selectTab !== '' && isNumeric(Number(selectTab))
            ? Number(selectTab)
            : undefined,
      });

      setForm({ ...form, customTag: '' });
      toast.success('Successfully created tag');

      if (typeof selectedTagKey === 'number') {
        getTagsByIdOptions.refetch();
      } else {
        getTagsOptions.refetch();
      }
    } catch (e) {
      const error = e as IError;
      toast.error(error.message);
    }
  }
  async function onClickSave() {
    const question = form.question.trim();
    const answer = form.answer.trim();
    const selectTab = form.selectTab.trim();
    const selectTag = form.selectTag.trim();

    if (question === '') {
      toast.error('Question cannot be empty');
      return;
    }

    try {
      await customQuestionOptions.mutateAsync({
        question,
        answer,
        tabId:
          selectTab !== '' && isNumeric(Number(selectTab))
            ? Number(selectTab)
            : undefined,
        tagId:
          selectTag !== '' && isNumeric(Number(selectTag))
            ? Number(selectTag)
            : undefined,
      });

      setForm({
        ...form,
        question: '',
        answer: '',
      });
      toast.success('Successfully created question');

      if (typeof selectedTagKey === 'number') {
        getTagsByIdOptions.refetch();
      } else {
        getQuestionsOptions.refetch();
      }
    } catch (e) {
      const error = e as IError;
      toast.error(error.message);
    }
  }

  return (
    <>
      <div className="h-screen">
        <div className="w-full h-full flex flex-row">
          <div className="hidden sm:flex flex-col w-24 sm:w-48 bg-default-100">
            <div className="shrink-0 py-2 px-3">
              <Image isBlurred src="images/logo-rm-bg.png" alt="prepforge" />
            </div>
            <ScrollShadow className="grow">
              {getTabsOptions.isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Spinner label="Loading..." />
                </div>
              ) : tabs.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <Chip variant="bordered">No Data</Chip>
                </div>
              ) : (
                <Listbox
                  aria-label="Listbox Variants"
                  variant="faded"
                  onAction={(key) => {
                    const _key = Number(key);
                    const value = _key === selectedTabKey ? undefined : _key;
                    setSelectedTabKey(value);
                  }}
                >
                  {tabs.map((item) => {
                    return (
                      <ListboxItem
                        key={item.id}
                        textValue={item.name}
                        endContent={
                          selectedTabKey === item.id ? (
                            <CheckLgIcon className="bi bi-check-lg text-default-500" />
                          ) : undefined
                        }
                        className={clsx({
                          'border-default': selectedTabKey === item.id,
                        })}
                      >
                        {tabsRenderingCompleted ? (
                          <div>{item.name}</div>
                        ) : (
                          <Skeleton className="rounded-lg">
                            <div className="h-3 rounded-lg bg-default-200"></div>
                          </Skeleton>
                        )}
                      </ListboxItem>
                    );
                  })}
                </Listbox>
              )}
            </ScrollShadow>
            <div className="shrink-0 py-2 px-3">
              {getProfileOptions.isLoading && (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div>
                    <Skeleton className="flex rounded-full w-10 h-10" />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-3 w-4/5 rounded-lg" />
                    <Skeleton className="h-3 w-3/5 rounded-lg" />
                  </div>
                </div>
              )}

              {currentUser && (
                <User
                  className="flex-col sm:flex-row"
                  name={currentUser.username}
                  description={format(currentUser.createDate, 'yyyy-MM-dd')}
                  avatarProps={{
                    src: 'images/logo.png',
                  }}
                  classNames={{
                    wrapper: 'w-full items-center sm:w-auto sm:items-start',
                  }}
                />
              )}
            </div>

            <div className="shrink-0 py-2 px-3 self-center sm:self-start flex gap-1 sm:gap-2">
              {/*<div>*/}
              {/*  <Dropdown>*/}
              {/*    <DropdownTrigger>*/}
              {/*      <Button size="sm" isIconOnly variant="bordered">*/}
              {/*        <TranslateIcon />*/}
              {/*      </Button>*/}
              {/*    </DropdownTrigger>*/}
              {/*    <DropdownMenu*/}
              {/*      aria-label="language"*/}
              {/*      variant="faded"*/}
              {/*      disallowEmptySelection*/}
              {/*      selectionMode="single"*/}
              {/*      selectedKeys={selectedKeysTranslate}*/}
              {/*      onSelectionChange={setSelectedKeysTranslate}*/}
              {/*    >*/}
              {/*      <DropdownItem key="english">English</DropdownItem>*/}
              {/*      <DropdownItem key="简体中文">简体中文</DropdownItem>*/}
              {/*    </DropdownMenu>*/}
              {/*  </Dropdown>*/}
              {/*</div>*/}
              <div>
                <Dropdown>
                  <DropdownTrigger>
                    <Button size="sm" isIconOnly variant="bordered">
                      <CircleHalfIcon />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="darkMode"
                    variant="faded"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={selectedKeysDarkMode}
                    onSelectionChange={setSelectedKeysDarkMode}
                    onAction={(key) => {
                      setTheme(key as string);
                    }}
                  >
                    <DropdownItem key="light">Light</DropdownItem>
                    <DropdownItem key="dark">Dark</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>

          <ScrollShadow className="w-full h-full overflow-y-auto py-2 pb-96 z-1">
            {tags.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <Chip variant="bordered">No Data</Chip>
              </div>
            ) : (
              <Tabs
                aria-label="Options"
                className="p-2 pt-1"
                classNames={{
                  tabList: 'flex-wrap',
                  tab: 'w-auto',
                  panel: 'px-0',
                }}
                onSelectionChange={(key) => {
                  const _key = Number(key);
                  const value = _key === selectedTagKey ? undefined : _key;
                  setSelectedTagKey(value);
                }}
              >
                {tags.map((item) => {
                  const _questions = item.questions ?? [];

                  return (
                    <Tab
                      key={item.id}
                      title={
                        tagsRenderingCompleted ? (
                          item.name
                        ) : (
                          <Skeleton className="w-24 h-3 bg-default-200 rounded-lg" />
                        )
                      }
                    >
                      <Card shadow="none" className="bg-transparent">
                        <CardBody>
                          {_questions.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                              <Chip variant="bordered">No Data</Chip>
                            </div>
                          ) : (
                            <Accordion
                              isCompact
                              variant="splitted"
                              selectionMode="multiple"
                              className="px-0"
                            >
                              {_questions.map((qItem) => {
                                return (
                                  <AccordionItem
                                    key={qItem.id}
                                    ria-label={qItem.question}
                                    textValue={qItem.id + ''}
                                    title={
                                      questionsRenderingCompleted ? (
                                        <div className="whitespace-pre-wrap">
                                          {qItem.question}
                                        </div>
                                      ) : (
                                        <Skeleton className="h-3 bg-default-200 rounded-lg" />
                                      )
                                    }
                                    className="shadow-small"
                                  >
                                    {questionsRenderingCompleted ? (
                                      <div className="whitespace-pre-wrap">
                                        {qItem.answer}
                                      </div>
                                    ) : (
                                      <Skeleton className="h-3 bg-default-200 rounded-lg" />
                                    )}
                                  </AccordionItem>
                                );
                              })}
                            </Accordion>
                          )}
                        </CardBody>
                      </Card>
                    </Tab>
                  );
                })}
              </Tabs>
            )}
          </ScrollShadow>
        </div>
      </div>

      <div className="container m-auto fixed bottom-0 right-0 left-0 px-2">
        <div className="flex flex-row py-2">
          <div className="hidden sm:block flex-none w-24 sm:w-48"></div>
          <div className="grow">
            <Card shadow="sm">
              <CardHeader className="flex-col gap-2">
                <div className="w-full flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center justify-between py-2 pb-3">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="sm:hidden w-9 h-9 rounded-medium text-small min-w-9 min-h-9"
                      isIconOnly
                      variant="bordered"
                      onPress={onClickLayoutSidebar}
                    >
                      <LayoutSidebarIcon />
                    </Button>

                    <Button
                      size="sm"
                      className="w-9 h-9 rounded-medium text-small min-w-9 min-h-9"
                      isIconOnly
                      variant="bordered"
                      onPress={onClickCollapse}
                    >
                      {collapse ? <ArrowsExpandIcon /> : <ArrowsCollapseIcon />}
                    </Button>

                    <Button
                      size="sm"
                      className="w-9 h-9 rounded-medium text-small min-w-9 min-h-9"
                      isIconOnly
                      variant="bordered"
                      onPress={onClickChevronDoubleUp}
                    >
                      {chevronDoubleUp ? (
                        <ChevronDoubleDownIcon />
                      ) : (
                        <ChevronDoubleUpIcon />
                      )}
                    </Button>

                    {/*<Button*/}
                    {/*  size="sm"*/}
                    {/*  className="w-9 h-9 rounded-medium text-small min-w-9 min-h-9"*/}
                    {/*  isIconOnly*/}
                    {/*  variant="bordered"*/}
                    {/*  onPress={onClickTrash}*/}
                    {/*  color={trash ? 'danger' : 'default'}*/}
                    {/*>*/}
                    {/*  <TrashIcon />*/}
                    {/*</Button>*/}
                  </div>

                  {/*<div>*/}
                  {/*  <Pagination showControls total={10} boundaries={-2} />*/}
                  {/*</div>*/}
                </div>

                {!collapse && (
                  <>
                    {chevronDoubleUp && (
                      <>
                        <div className="w-full flex flex-col sm:flex-row gap-4 mb-3">
                          <Input
                            type="text"
                            variant="flat"
                            label="Custom Tab"
                            placeholder="Enter your tab"
                            isDisabled={customTabOptions.isPending}
                            endContent={
                              <Button
                                size="sm"
                                className="w-9 h-9 rounded-medium text-small min-w-9 min-h-9"
                                isIconOnly
                                variant="bordered"
                                onPress={onClickCustomTab}
                                isLoading={customTabOptions.isPending}
                                isDisabled={customTabOptions.isPending}
                              >
                                <PlusLgIcon />
                              </Button>
                            }
                            value={form.customTab}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                customTab: event.target.value,
                              })
                            }
                          />
                          <Input
                            type="text"
                            variant="flat"
                            label="Custom Tag"
                            placeholder="Enter your tag"
                            endContent={
                              <Button
                                size="sm"
                                className="w-9 h-9 rounded-medium text-small min-w-9 min-h-9"
                                isIconOnly
                                variant="bordered"
                                onPress={onClickCustomTag}
                              >
                                <PlusLgIcon />
                              </Button>
                            }
                            value={form.customTag}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                customTag: event.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="w-full flex flex-col sm:flex-row gap-4 mb-3">
                          <Select
                            label="Select Tab"
                            placeholder="Select an tab"
                            selectorIcon={<></>}
                            isDisabled={tabs.length === 0}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                selectTab: event.target.value,
                              })
                            }
                          >
                            {tabs.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </Select>
                          <Select
                            label="Select Tag"
                            placeholder="Select an tag"
                            selectorIcon={<></>}
                            isDisabled={tags.length === 0}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                selectTag: event.target.value,
                              })
                            }
                          >
                            {tags.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                      </>
                    )}

                    <Input
                      type="text"
                      label="Question"
                      placeholder="Enter your question"
                      value={form.question}
                      onChange={(event) =>
                        setForm({ ...form, question: event.target.value })
                      }
                    />
                  </>
                )}
              </CardHeader>

              {!collapse && (
                <CardBody>
                  <div className="flex flex-col gap-2">
                    <Textarea
                      label="Answer"
                      placeholder="Enter your answer"
                      value={form.answer}
                      onChange={(event) =>
                        setForm({ ...form, answer: event.target.value })
                      }
                    />

                    <div className="self-center my-2 w-full sm:w-2/4">
                      <Button
                        className="w-full"
                        color="primary"
                        startContent={<SaveIcon />}
                        onPress={onClickSave}
                      >
                        Save
                      </Button>
                    </div>

                    <div className="text-center text-gray-500 text-small">
                      Record your interview questions
                    </div>
                  </div>
                </CardBody>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Modal
        hideCloseButton
        isOpen={isOpenLayoutSidebar}
        placement="auto"
        scrollBehavior="inside"
        onOpenChange={onOpenChangeLayoutSidebar}
      >
        <ModalContent>
          {() => (
            <ModalBody className="bg-default-100 rounded-medium px-0">
              <div className="flex flex-col">
                <ScrollShadow className="grow">
                  {getTabsOptions.isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Spinner label="Loading..." />
                    </div>
                  ) : tabs.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <Chip variant="bordered">No Data</Chip>
                    </div>
                  ) : (
                    <Listbox
                      aria-label="Listbox Variants"
                      variant="faded"
                      onAction={(key) => {
                        if (isOpenLayoutSidebar) {
                          onCloseLayoutSidebar();
                        }

                        const _key = Number(key);
                        const value =
                          _key === selectedTabKey ? undefined : _key;
                        setSelectedTabKey(value);
                      }}
                    >
                      {tabs.map((item) => {
                        return (
                          <ListboxItem
                            key={item.id}
                            textValue={item.name}
                            endContent={
                              selectedTabKey === item.id ? (
                                <CheckLgIcon className="bi bi-check-lg text-default-500" />
                              ) : undefined
                            }
                            className={clsx({
                              'border-default': selectedTabKey === item.id,
                            })}
                          >
                            {tabsRenderingCompleted ? (
                              <div>{item.name}</div>
                            ) : (
                              <Skeleton className="rounded-lg">
                                <div className="h-3 rounded-lg bg-default-200"></div>
                              </Skeleton>
                            )}
                          </ListboxItem>
                        );
                      })}
                    </Listbox>
                  )}
                </ScrollShadow>
                <div className="shrink-0 py-2 px-3">
                  {getProfileOptions.isLoading && (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div>
                        <Skeleton className="flex rounded-full w-10 h-10" />
                      </div>
                      <div className="w-full flex flex-col gap-2">
                        <Skeleton className="h-3 w-4/5 rounded-lg" />
                        <Skeleton className="h-3 w-3/5 rounded-lg" />
                      </div>
                    </div>
                  )}

                  {currentUser && (
                    <User
                      className="flex-row"
                      name={currentUser.username}
                      description={format(currentUser.createDate, 'yyyy-MM-dd')}
                      avatarProps={{
                        src: 'images/logo.png',
                      }}
                    />
                  )}
                </div>

                <div className="shrink-0 py-2 px-3 sm:self-start flex gap-1 sm:gap-2">
                  <div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button size="sm" isIconOnly variant="bordered">
                          <TranslateIcon />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="language"
                        variant="faded"
                        disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={selectedKeysTranslate}
                        onSelectionChange={setSelectedKeysTranslate}
                      >
                        <DropdownItem key="english">English</DropdownItem>
                        <DropdownItem key="简体中文">简体中文</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button size="sm" isIconOnly variant="bordered">
                          <CircleHalfIcon />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="darkMode"
                        variant="faded"
                        disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={selectedKeysDarkMode}
                        onSelectionChange={setSelectedKeysDarkMode}
                      >
                        <DropdownItem key="light">Light</DropdownItem>
                        <DropdownItem key="dark">Dark</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
