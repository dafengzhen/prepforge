import type { IBase } from '@/app/interfaces/index';
import type { ITab } from '@/app/interfaces/tab';
import type { ITag } from '@/app/interfaces/tag';
import type { IQuestion } from '@/app/interfaces/question';

export interface IUser extends IBase {
  username: string;
  password?: string;
  tabs?: ITab[];
  tags?: ITag[];
  questions?: IQuestion[];
  customizationSettings: {
    type: 'user';
  };
}
