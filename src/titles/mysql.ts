import { ResourceNotFoundError } from '../errors';
import db from '../infra/database/knex';
import { Title, TitleFilterOptions, TitleKey } from './types';

type TitleModel = {
  emp_no: number;
  title: string;
  from_date: Date;
  to_date: Date | null;
};

type TitleModelKey = {
  emp_no: number;
  title: string;
  from_date: Date;
};

function fromDb(t: TitleModel): Title {
  return {
    employeeNumber: t.emp_no,
    title: t.title,
    fromDate: t.from_date,
    toDate: t.to_date,
  };
}

function forDb(t: Title): TitleModel {
  return {
    emp_no: t.employeeNumber,
    title: t.title,
    from_date: t.fromDate,
    to_date: t.toDate,
  };
}

function titleKeyForDb(key: TitleKey): TitleModelKey {
  return {
    emp_no: key.employeeNumber,
    title: key.title,
    from_date: key.fromDate,
  };
}

export async function getTitleByKey(key: TitleKey): Promise<Title> {
  const title = await db<TitleModel>('titles')
    .select('*')
    .where(titleKeyForDb(key))
    .first();

  if (!title) {
    throw new ResourceNotFoundError('Title not found');
  }

  return fromDb(title);
}

export async function insertTitle(title: Title): Promise<number> {
  const [id] = await db<TitleModel>('titles').insert(forDb(title));

  return id;
}

export async function saveTitle(title: Title): Promise<void> {
  const rowsAffected = await db<TitleModel>('titles')
    .where(
      titleKeyForDb({
        employeeNumber: title.employeeNumber,
        title: title.title,
        fromDate: title.fromDate,
      })
    )
    .update(forDb(title));

  if (rowsAffected < 1) {
    throw new ResourceNotFoundError('Title not found');
  }
}

export async function deleteTitleByKey(key: TitleKey): Promise<void> {
  const rowsAffected = await db<TitleModel>('titles')
    .where(titleKeyForDb(key))
    .del();

  if (rowsAffected < 1) {
    throw new ResourceNotFoundError('Title not found');
  }
}

const DEFAULT_LIMIT = 10;

export async function listTitles({
  limit = DEFAULT_LIMIT,
  ...filter
}: TitleFilterOptions): Promise<Title[]> {
  const qb = db<TitleModel>('titles').select('*').limit(limit);

  if (filter.employeeNumber) {
    qb.where({ emp_no: filter.employeeNumber });
  }

  const result = await qb;
  return result.map(fromDb);
}
