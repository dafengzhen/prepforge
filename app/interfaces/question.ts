import type { IBase } from '@/app/interfaces/index';
import type { ITab } from '@/app/interfaces/tab';
import type { ITag } from '@/app/interfaces/tag';
import type { IUser } from '@/app/interfaces/user';

export interface IQuestion extends IBase {
  question?: string;
  answer?: string;
  sort: number;
  tab?: ITab;
  tag?: ITag;
  user: IUser;
  customizationSettings: {
    type: 'question';
  };
}
