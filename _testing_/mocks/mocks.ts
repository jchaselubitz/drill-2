'use server';

jest.mock('@/lib/database', () => ({
  // Mock for transaction
  transaction: jest.fn().mockReturnValue({
    execute: jest.fn((callback) =>
      callback({
        insertInto: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockReturnThis(),
          executeTakeFirstOrThrow: jest.fn().mockResolvedValue({ id: 'mocked-id' }),
          execute: jest.fn().mockResolvedValue([]),
        }),
        selectFrom: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          executeTakeFirst: jest.fn().mockResolvedValue({ id: 'mocked-id' }),
          orderBy: jest.fn(),
        }),
        deleteFrom: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          execute: jest.fn(),
          returning: jest.fn().mockReturnThis(),
        }),
        updateTable: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          execute: jest.fn(),
          returning: jest.fn().mockReturnThis(),
        }),
      })
    ),
  }),

  // Mock for standalone insertInto
  insertInto: jest.fn().mockReturnValue({
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([]),
    executeTakeFirstOrThrow: jest.fn(),
  }),

  // Mock for standalone selectFrom
  selectFrom: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn(),
    execute: jest.fn(),
  }),

  // Mock for standalone deleteFrom
  deleteFrom: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    returning: jest.fn().mockReturnThis(),
  }),

  // Mock for standalone updateTable
  updateTable: jest.fn().mockReturnValue({
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    returning: jest.fn().mockReturnThis(),
  }),
}));

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockInsertInto = jest.fn();
const mockSelectFrom = jest.fn();
const mockDeleteFrom = jest.fn();
const mockUpdateTable = jest.fn();
const mockTransaction = jest.fn();

const dbMock = {
  transaction: mockTransaction,
  insertInto: mockInsertInto,
  selectFrom: mockSelectFrom,
  deleteFrom: mockDeleteFrom,
  updateTable: mockUpdateTable,
};

jest.mock('@/lib/database', () => dbMock);

export {
  mockInsertInto,
  mockSelectFrom,
  mockDeleteFrom,
  mockUpdateTable,
  mockTransaction,
  dbMock as default,
};

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

export const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  storage: {
    from: jest.fn(),
  },
};
