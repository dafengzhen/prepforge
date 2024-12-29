import type { IBase } from '@/app/interfaces';
import type { IQuestion } from '@/app/interfaces/question';
import type { ITag } from '@/app/interfaces/tag';
import type { IUser } from '@/app/interfaces/user';

export interface ICustomTabDto {
  name?: string;
  names?: string[];
}

export interface ITab extends IBase {
  customizationSettings: {
    type: 'tab';
  };
  name: string;
  questions?: IQuestion[];
  sort: number;
  tags?: ITag[];
  user: IUser;
}
