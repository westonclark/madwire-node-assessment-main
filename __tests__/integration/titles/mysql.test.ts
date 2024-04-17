import 'jest-extended';
import {
  deleteTitleByKey,
  getTitleByKey,
  insertTitle,
  listTitles,
  saveTitle,
} from '../../../src/titles/mysql';
import db from '../../../src/infra/database/knex';
import { ResourceNotFoundError } from '../../../src/errors';

const expectTitle = () =>
  expect.objectContaining({
    employeeNumber: expect.any(Number),
    title: expect.any(String),
    fromDate: expect.any(Date),
    toDate: expect.toBeOneOf([expect.any(Date), null]),
  });

describe('Mysql Persistence', () => {
  const existingTitle = {
    employeeNumber: 10002,
    title: 'Staff',
    fromDate: new Date('1996-08-03'),
    toDate: new Date('9999-01-01'),
  };

  const newTitle = {
    employeeNumber: 10002,
    title: 'Senior Engineer',
    fromDate: new Date('2020-01-01'),
    toDate: new Date('2021-01-01'),
  };

  const newTitleKey = {
    employeeNumber: newTitle.employeeNumber,
    title: newTitle.title,
    fromDate: newTitle.fromDate,
  };

  afterAll(async () => {
    await db.destroy();
  });

  describe('getTitleByKey', () => {
    it('should return title', async () => {
      const title = await getTitleByKey({
        employeeNumber: existingTitle.employeeNumber,
        title: existingTitle.title,
        fromDate: existingTitle.fromDate,
      });
      expect(title).toStrictEqual(existingTitle);
    });

    it('should throw error when title does not exist', async () => {
      expect(() =>
        getTitleByKey({ employeeNumber: -1, title: '', fromDate: new Date() })
      ).rejects.toThrow(ResourceNotFoundError);
    });
  });

  describe('listTitles', () => {
    it('should retreive titles with provided limit', async () => {
      const limit = 3;
      const results = await listTitles({ limit });

      expect(results.length).toBe(limit);
      expect(results).toEqual(expect.arrayContaining([expectTitle()]));
    });

    it('should retrieve titles with default limit of 10', async () => {
      const results = await listTitles({});
      expect(results.length).toBe(10);
      expect(results).toEqual(expect.arrayContaining([expectTitle()]));
    });

    it('should retrieve employees filtered by employeeNumber with provided limit', async () => {
      const limit = 3;
      const employeeNumber = 12633;
      const results = await listTitles({ limit, employeeNumber });
      expect(results.length).toEqual(limit);
      expect(results).toEqual(expect.arrayContaining([expectTitle()]));
      results.forEach((title) => {
        expect(title.employeeNumber).toEqual(employeeNumber);
      });
    });

    it('should retreive titles filtered by employeeNumber with default limit', async () => {
      const employeeNumber = 12633;
      const results = await listTitles({ employeeNumber });
      expect(results.length).toEqual(3);
      expect(results).toEqual(expect.arrayContaining([expectTitle()]));
      results.forEach((title) => {
        expect(title.employeeNumber).toEqual(employeeNumber);
      });
    });
  });

  describe('insertTitle', () => {
    it('should insert title', async () => {
      await insertTitle(newTitle);

      const title = await getTitleByKey(newTitleKey);
      expect(title).toStrictEqual(newTitle);
    });
  });

  describe('saveTitle', () => {
    it('should edit title', async () => {
      const editedTitle = {
        ...newTitle,
        toDate: new Date('2023-01-01'),
      };
      await saveTitle(editedTitle);
      const updatedTitle = await getTitleByKey(newTitleKey);

      expect(updatedTitle).toStrictEqual(editedTitle);
    });

    it('should throw error when title does not exist', async () => {
      const editedEmployee = {
        ...newTitle,
        employeeNumber: -1,
      };
      expect(() => saveTitle(editedEmployee)).rejects.toThrow(
        ResourceNotFoundError
      );
    });
  });

  describe('deleteTitleByKey', () => {
    it('should delete title', async () => {
      await deleteTitleByKey(newTitleKey);

      expect(() => getTitleByKey(newTitleKey)).rejects.toThrow(
        ResourceNotFoundError
      );
    });

    it('should throw error if title does not exist', async () => {
      expect(() => deleteTitleByKey(newTitleKey)).rejects.toThrow(
        ResourceNotFoundError
      );
    });
  });
});
