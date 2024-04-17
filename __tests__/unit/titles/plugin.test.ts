import 'jest-extended';
import { Static } from '@sinclair/typebox';
import titlePlugin from '../../../src/titles/plugin';
import buildServer from '../../../src/infra/web/server';
import { FastifyInstanceTypebox } from '../../../src/infra/web/types';
import { mockDependency } from '../../_utils';
import { ResourceNotFoundError } from '../../../src/errors';
import {
  createTitle,
  deleteTitle,
  editTitle,
  getTitle,
} from '../../../src/titles/service';
import { forResponse, fromRequest } from '../../../src/titles/mappers';
import { partialTitleSchema, titleSchema } from '../../../src/titles/schemas';

jest.mock('../../../src/titles/service');
const mockGetTitle = mockDependency(getTitle);
const mockCreateTitle = mockDependency(createTitle);
const mockEditTitle = mockDependency(editTitle);
const mockDeleteTitle = mockDependency(deleteTitle);

describe('titles plugin', () => {
  let server: FastifyInstanceTypebox;

  beforeAll(() => {
    server = buildServer({}, [titlePlugin]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('GET /titles/:employeeNumber/:title/:fromDate', () => {
    it('should return title', async () => {
      const title = {
        employeeNumber: 1,
        title: 'Engineer',
        fromDate: new Date('2020-01-01'),
        toDate: new Date('2021-01-01'),
      };

      mockGetTitle.mockResolvedValue(title);

      const response = await server.inject({
        method: 'GET',
        url: `/titles/${title.employeeNumber}/${title.title}/${title.fromDate
          .toISOString()
          .slice(0, 10)}`,
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body).toStrictEqual(forResponse(title));
      expect(mockGetTitle).toHaveBeenCalledWith({
        employeeNumber: title.employeeNumber,
        title: title.title,
        fromDate: title.fromDate,
      });
    });

    it('should return 404 when title does not exist', async () => {
      const errMessage = 'Title not found';
      mockGetTitle.mockRejectedValue(new ResourceNotFoundError(errMessage));

      const response = await server.inject({
        method: 'GET',
        url: '/titles/100/engineer/2000-01-01',
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(404);
      expect(body).toEqual({ error: { message: errMessage } });
    });
  });

  describe('POST /titles', () => {
    it('should return created title', async () => {
      const newTitle = {
        employeeNumber: 1,
        title: 'Engineer',
        fromDate: '2020-01-01',
        toDate: '2021-01-01',
      };

      mockCreateTitle.mockResolvedValue(fromRequest(newTitle));

      const response = await server.inject({
        url: '/titles',
        method: 'POST',
        payload: newTitle,
      });

      const body = await JSON.parse(response.body);

      expect(response.statusCode).toBe(201);
      expect(body).toEqual(newTitle);
      expect(mockCreateTitle).toHaveBeenCalledWith(fromRequest(newTitle));
      expect(mockCreateTitle).toHaveBeenCalledOnce();
    });

    const validPayload = {
      employeeNumber: 1,
      title: 'Engineer',
      fromDate: '2020-01-01',
      toDate: '2021-01-01',
    };
    type NewTitlePayload = Static<typeof titleSchema>;
    type InvalidPayloadTestCase = [string, Partial<NewTitlePayload>, string];
    const invalidPayloads: InvalidPayloadTestCase[] = [
      [
        'fromDate must be date',
        {
          ...validPayload,
          fromDate: 'notAdate',
        },
        'body/fromDate must match format "date"',
      ],
      [
        'toDate must be date',
        {
          ...validPayload,
          toDate: 'notAdate',
        },
        'body/toDate must match format "date", body/toDate must be null, body/toDate must match a schema in anyOf',
      ],
      [
        'title cannot be empty',
        {
          ...validPayload,
          title: '',
        },
        'body/title must NOT have fewer than 1 characters',
      ],
      [
        'employeeNumber must be >= 1',
        {
          ...validPayload,
          employeeNumber: 0,
        },
        'body/employeeNumber must be >= 1',
      ],
    ];
    it.each(invalidPayloads)(
      'should reject invalid payload %s',
      async (
        testName: string,
        payload: Partial<NewTitlePayload>,
        expectedMessage: string
      ) => {
        const response = await server.inject({
          url: '/titles',
          method: 'POST',
          payload,
        });
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(400);
        expect(body).toEqual({ error: { message: expectedMessage } });
      }
    );
  });

  describe('PATCH /titles/:employeeNumber/:title/fromDate', () => {
    it('should return edited title', async () => {
      const title = {
        employeeNumber: 1,
        fromDate: new Date('2020-01-01'),
        toDate: null,
        title: 'Engineer 1',
      };

      const payload = { title: 'Engineer 2' };

      mockEditTitle.mockResolvedValue({ ...title, ...payload });

      const response = await server.inject({
        url: `/titles/${title.employeeNumber}/${title.title}/${title.fromDate
          .toISOString()
          .slice(0, 10)}`,
        method: 'PATCH',
        payload,
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body).toStrictEqual(forResponse({ ...title, ...payload }));
      expect(mockEditTitle).toHaveBeenCalledOnce();
      expect(mockEditTitle).toHaveBeenCalledWith(
        {
          employeeNumber: title.employeeNumber,
          fromDate: title.fromDate,
          title: title.title,
        },
        payload
      );
    });

    it('should return 404 when title does not exist', async () => {
      const errMessage = 'Title not found';
      mockEditTitle.mockRejectedValue(new ResourceNotFoundError(errMessage));
      const titleKey = {
        employeeNumber: 1,
        fromDate: new Date('2020-01-01'),
        title: 'Title',
      };

      const payload = { title: 'Title 2' };

      const response = await server.inject({
        url: `/titles/${titleKey.employeeNumber}/${
          titleKey.title
        }/${titleKey.fromDate.toISOString().slice(0, 10)}`,
        method: 'PATCH',
        payload,
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(404);
      expect(body).toEqual({ error: { message: errMessage } });
      expect(mockEditTitle).toHaveBeenCalledOnce();
      expect(mockEditTitle).toHaveBeenCalledWith(
        titleKey,
        expect.objectContaining(payload)
      );
    });

    type TitlePatch = Static<typeof partialTitleSchema>;
    type InvalidPayloadTestCase = [string, TitlePatch, string];
    const invalidPayloads: InvalidPayloadTestCase[] = [
      [
        'fromDate must be date',
        {
          fromDate: 'notAdate',
        },
        'body/fromDate must match format "date"',
      ],
      [
        'toDate must be date',
        {
          toDate: 'notAdate',
        },
        'body/toDate must match format "date", body/toDate must be null, body/toDate must match a schema in anyOf',
      ],
      [
        'title cannot be empty',
        {
          title: '',
        },
        'body/title must NOT have fewer than 1 characters',
      ],
      [
        'employeeNumber must be >= 1',
        {
          employeeNumber: 0,
        },
        'body/employeeNumber must be >= 1',
      ],
    ];
    it.each(invalidPayloads)(
      'should reject invalid payload %s',
      async (
        testName: string,
        payload: TitlePatch,
        expectedMessage: string
      ) => {
        const response = await server.inject({
          url: `/titles/1/title/2020-01-01`,
          method: 'PATCH',
          payload,
        });
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(400);
        expect(body).toEqual({ error: { message: expectedMessage } });
      }
    );
  });

  describe('DELETE /titles/:employeeNumber/:title/:fromDate', () => {
    it('should return 204 on successful deletion', async () => {
      mockDeleteTitle.mockResolvedValueOnce();

      const employeeNumber = 1;
      const fromDate = '2020-01-01';
      const title = 'Engineer';

      const response = await server.inject({
        url: `/titles/${employeeNumber}/${title}/${fromDate}`,
        method: 'DELETE',
      });

      expect(response.statusCode).toBe(204);
      expect(mockDeleteTitle).toHaveBeenCalledOnce();
      expect(mockDeleteTitle).toHaveBeenCalledWith({
        employeeNumber,
        title,
        fromDate: new Date(fromDate),
      });
    });

    it('should return 404 when title does not exist', async () => {
      const errMessage = 'Title not found';
      mockDeleteTitle.mockRejectedValue(new ResourceNotFoundError(errMessage));
      const employeeNumber = 1;
      const fromDate = '2020-01-01';
      const title = 'Engineer';

      const response = await server.inject({
        url: `/titles/${employeeNumber}/${title}/${fromDate}`,
        method: 'DELETE',
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(404);
      expect(body).toEqual({ error: { message: errMessage } });
      expect(mockDeleteTitle).toHaveBeenCalledOnce();
      expect(mockDeleteTitle).toHaveBeenCalledWith({
        employeeNumber,
        title,
        fromDate: new Date(fromDate),
      });
    });
  });
});
