import type { IBase } from '@/app/interfaces/index';
import type { IUser } from '@/app/interfaces/user';
import type { ITag } from '@/app/interfaces/tag';
import type { IQuestion } from '@/app/interfaces/question';

export interface ITab extends IBase {
  name: string;
  sort: number;
  user: IUser;
  tags?: ITag[];
  questions?: IQuestion[];
  customizationSettings: {
    type: 'tab';
  };
}
