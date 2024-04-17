import {
  deleteTitleByKey,
  getTitleByKey,
  insertTitle,
  listTitles,
  saveTitle,
} from './mysql';
import { Title, TitleFilterOptions, TitleKey } from './types';

export async function getTitle(key: TitleKey) {
  return getTitleByKey(key);
}

export async function getTitles(titleFilterOptions: TitleFilterOptions) {
  return listTitles(titleFilterOptions);
}

export async function createTitle(title: Title) {
  await insertTitle(title);

  return getTitleByKey({
    employeeNumber: title.employeeNumber,
    title: title.title,
    fromDate: title.fromDate,
  });
}

function applyPatch(title: Title, patch: Partial<Title>): Title {
  return Object.entries(patch)
    .filter(([, v]) => v !== undefined)
    .reduce((c, [k, v]) => ({ ...c, [k]: v }), title);
}

export async function editTitle(key: TitleKey, patch: Partial<Title>) {
  const title = await getTitleByKey(key);

  const updatedTitle = applyPatch(title, patch);

  await saveTitle(updatedTitle);

  return getTitleByKey({
    employeeNumber: updatedTitle.employeeNumber,
    title: updatedTitle.title,
    fromDate: updatedTitle.fromDate,
  });
}

export async function deleteTitle(titleKey: TitleKey) {
  return deleteTitleByKey(titleKey);
}
