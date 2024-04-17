export interface Title {
  employeeNumber: number;
  title: string;
  fromDate: Date;
  toDate: Date | null;
}

export type TitleKey = Pick<Title, 'employeeNumber' | 'title' | 'fromDate'>;

export type TitleFilterOptions = {
  employeeNumber?: number;
  limit?: number;
};
