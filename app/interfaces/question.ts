import type { IBase } from '@/app/interfaces';
import type { ITab } from '@/app/interfaces/tab';
import type { ITag } from '@/app/interfaces/tag';
import type { IUser } from '@/app/interfaces/user';

export interface ICustomQuestionDto {
  answer?: string;
  question?: string;
  questions?: Pick<ICustomQuestionDto, 'answer' | 'question'>[];
  tabId?: number;
  tagId?: number;
}

export interface IQuestion extends IBase {
  answer?: string;
  customizationSettings: {
    type: 'question';
  };
  expand?: boolean;
  question?: string;
  sort: number;
  tab?: ITab;
  tag?: ITag;
  user: IUser;
}
