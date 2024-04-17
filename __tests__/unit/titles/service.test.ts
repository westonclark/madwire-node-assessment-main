import 'jest-extended';
import {
  createTitle,
  deleteTitle,
  editTitle,
  getTitle,
} from '../../../src/titles/service';
import { mockDependency } from '../../_utils';
import { ResourceNotFoundError } from '../../../src/errors';
import {
  deleteTitleByKey,
  getTitleByKey,
  insertTitle,
  listTitles,
  saveTitle,
} from '../../../src/titles/mysql';
import { Title, TitleKey } from '../../../src/titles/types';

jest.mock('../../../src/titles/mysql');
const mockGetTitleByKey = mockDependency(getTitleByKey);
const mockListTitles = mockDependency(listTitles);
const mockInsertTitle = mockDependency(insertTitle);
const mockSaveTitle = mockDependency(saveTitle);
const mockDeleteTitleByKey = mockDependency(deleteTitleByKey);

describe('titles service', () => {
  const titleKey: TitleKey = {
    employeeNumber: 1,
    title: 'Engineer 1',
    fromDate: new Date('2024-01-01'),
  };

  const title: Title = {
    ...titleKey,
    toDate: new Date('2025-01-01'),
  };

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('getTitle', () => {
    it('should return title', async () => {
      mockGetTitleByKey.mockResolvedValue(title);

      const result = await getTitle(titleKey);
      expect(result).toStrictEqual(title);
      expect(mockGetTitleByKey).toHaveBeenCalledOnce();
      expect(mockGetTitleByKey).toHaveBeenCalledWith(titleKey);
    });

    it('should throw error if title is not found', async () => {
      mockGetTitleByKey.mockRejectedValue(
        new ResourceNotFoundError('Title not found')
      );
      expect(() =>
        getTitle({ employeeNumber: 1, title: '', fromDate: new Date() })
      ).rejects.toThrow(ResourceNotFoundError);
    });
  });

  describe('getTitles', () => {
    it('should pass filter options to db method', async () => {
      mockListTitles.mockResolvedValueOnce([]);

      const filterOpts = {
        limit: 3,
        title: 'engineer',
      };
      await listTitles(filterOpts);

      expect(mockListTitles).toHaveBeenCalledWith(filterOpts);
      expect(mockListTitles).toHaveBeenCalledOnce();
    });
  });

  describe('createTitle', () => {
    it('should create title', async () => {
      mockGetTitleByKey.mockResolvedValue(title);
      mockInsertTitle.mockResolvedValueOnce(0);

      const createdTitle = await createTitle(title);

      expect(createdTitle).toStrictEqual(title);
      expect(mockGetTitleByKey).toHaveBeenCalledOnce();
      expect(mockGetTitleByKey).toHaveBeenCalledWith(titleKey);
      expect(mockInsertTitle).toHaveBeenCalledOnce();
      expect(mockInsertTitle).toHaveBeenCalledWith(title);
    });
  });

  describe('editTitle', () => {
    it('should edit title', async () => {
      const patch = { title: 'New Title' };

      mockGetTitleByKey
        .mockResolvedValueOnce(title)
        .mockResolvedValueOnce({ ...title, ...patch });

      await editTitle(titleKey, patch);

      expect(mockGetTitleByKey).toHaveBeenCalledTimes(2);
      expect(mockGetTitleByKey).toHaveBeenCalledWith(titleKey);
      expect(mockGetTitleByKey).toHaveBeenCalledWith({
        ...titleKey,
        title: 'New Title',
      });
      expect(mockSaveTitle).toHaveBeenCalledOnce();
      expect(mockSaveTitle).toHaveBeenCalledWith({
        ...title,
        ...patch,
      });
    });

    it('should throw error if title does not exist', async () => {
      mockGetTitleByKey.mockRejectedValue(
        new ResourceNotFoundError('Title not found')
      );
      expect(() => editTitle(titleKey, { title: '' })).rejects.toThrow(
        ResourceNotFoundError
      );
    });
  });

  describe('deleteTitle', () => {
    it('should delete title', async () => {
      mockDeleteTitleByKey.mockResolvedValueOnce();

      await deleteTitle(titleKey);

      expect(mockDeleteTitleByKey).toHaveBeenCalledOnce();
      expect(mockDeleteTitleByKey).toHaveBeenCalledWith(titleKey);
    });

    it('should throw error if title does not exist', async () => {
      mockDeleteTitleByKey.mockRejectedValue(
        new ResourceNotFoundError('Title not found')
      );
      expect(() => deleteTitle(titleKey)).rejects.toThrow(
        ResourceNotFoundError
      );
    });
  });
});
