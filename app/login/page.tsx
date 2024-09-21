'use client';

import { useDisclosure } from '@nextui-org/use-disclosure';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/modal';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { LockIcon } from '@/app/icons/lock-icon';
import { type KeyboardEvent, useEffect, useState } from 'react';
import { PersonIcon } from '@/app/icons/person-icon';
import { useLoginOptions } from '@/app/options/users';
import toast from 'react-hot-toast';
import { Image } from '@nextui-org/image';
import { type IError } from '@/app/interfaces';
import { TK } from '@/app/constants';

export default function Page() {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [loggingIn, setLoggingIn] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const loginOptions = useLoginOptions();

  useEffect(() => {
    onOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onClickReset() {
    const { username, password } = form;
    if (username === '' && password === '') {
      return;
    }

    setForm({
      username: '',
      password: '',
    });
  }

  async function onClickSignIn() {
    const username = form.username.trim();
    const password = form.password.trim();

    if (username === '' || password === '') {
      toast.error('Username and password cannot be empty');
      return;
    }

    try {
      setLoggingIn(true);
      const resp = await loginOptions.mutateAsync({
        username,
        password,
      });

      localStorage.setItem(TK, resp.token);
      onClickReset();

      toast.success('Successfully logged in', { duration: 1000 });
      setTimeout(() => {
        toast.success('Nearly finished', { duration: 1000 });
        setTimeout(() => {
          location.assign('/');
        }, 1000);
      }, 1000);
    } catch (e) {
      const error = e as IError;
      toast.error(error.message);
    } finally {
      setLoggingIn(false);
    }
  }

  function onKeyUpInput(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      return onClickSignIn();
    }
  }

  return (
    <div className="h-screen">
      <div className="fixed left-0 top-0 z-[99] p-2">
        <Image
          width={130}
          isBlurred
          src="images/logo-rm-bg.png"
          alt="prepforge"
        />
      </div>

      <Modal
        hideCloseButton
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        classNames={{
          backdrop:
            'bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-zinc-900 dark:to-zinc-900',
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Log in</ModalHeader>
              <ModalBody>
                <form className="flex flex-col gap-2">
                  <Input
                    isDisabled={loggingIn}
                    value={form.username}
                    onChange={(event) =>
                      setForm({ ...form, username: event.target.value })
                    }
                    autoFocus
                    endContent={<PersonIcon />}
                    label="Username"
                    placeholder="Enter your username"
                    variant="bordered"
                    autoComplete="username"
                    onKeyUp={onKeyUpInput}
                  />
                  <Input
                    isDisabled={loggingIn}
                    value={form.password}
                    onChange={(event) =>
                      setForm({ ...form, password: event.target.value })
                    }
                    endContent={<LockIcon />}
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    variant="bordered"
                    autoComplete="current-password"
                    onKeyUp={onKeyUpInput}
                  />

                  <div className="flex py-2 px-1 justify-between text-small text-gray-500">
                    If the username does not exist, it will be automatically
                    registered and logged in.
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  isDisabled={loggingIn}
                  variant="flat"
                  onPress={onClickReset}
                >
                  Reset
                </Button>
                <Button
                  isLoading={loggingIn}
                  isDisabled={loggingIn}
                  color="primary"
                  onPress={onClickSignIn}
                >
                  Sign in
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
