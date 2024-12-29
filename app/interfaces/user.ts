import type { IBase } from '@/app/interfaces';
import type { IQuestion } from '@/app/interfaces/question';
import type { ITab } from '@/app/interfaces/tab';
import type { ITag } from '@/app/interfaces/tag';

export interface ILoginDto {
  password: string;
  username: string;
}

export interface IUser extends IBase {
  customizationSettings: {
    type: 'user';
  };
  password?: string;
  questions?: IQuestion[];
  tabs?: ITab[];
  tags?: ITag[];
  username: string;
}
