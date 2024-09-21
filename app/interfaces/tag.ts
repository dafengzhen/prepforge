import type { IBase } from '@/app/interfaces/index';
import type { IQuestion } from '@/app/interfaces/question';
import type { IUser } from '@/app/interfaces/user';
import type { ITab } from '@/app/interfaces/tab';

export interface ITag extends IBase {
  name: string;
  sort: number;
  tab?: ITab;
  user?: IUser;
  questions?: IQuestion[];
  customizationSettings: {
    type: 'tag';
  };
}
