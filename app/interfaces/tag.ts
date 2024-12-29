import type { IBase } from '@/app/interfaces';
import type { IQuestion } from '@/app/interfaces/question';
import type { ITab } from '@/app/interfaces/tab';
import type { IUser } from '@/app/interfaces/user';

export interface ICustomTagDto {
  name?: string;
  names?: string[];
  tabId?: number;
}

export interface ITag extends IBase {
  customizationSettings: {
    type: 'tag';
  };
  name: string;
  questions?: IQuestion[];
  sort: number;
  tab?: ITab;
  user?: IUser;
}
