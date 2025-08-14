// phraseActions.test.js
'use server';

import { revalidatePath } from 'next/cache';

import {
  getPhrases,
  addPhrase,
  addPhraseTags,
  removePhraseTag,
  updatePhrase,
  togglePhraseFavorite,
  addTranslation,
  deletePhrase,
} from './phraseActions';

import { Iso639LanguageCode, PhraseType } from 'kysely-codegen';
import {
  mockSupabase,
  mockSelectFrom,
  mockInsertInto,
  mockTransaction,
  mockUpdateTable,
  mockDeleteFrom,
} from '@/_testing_/mocks/mocks';

jest.mock('next/cache');
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('Phrase Management Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPhrases', () => {
    it('should return phrases for authenticated users', async () => {
      const mockExecute = jest.fn().mockResolvedValue([]);
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),

        execute: mockExecute,
      };

      mockSelectFrom.mockReturnValue(mockChain);

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });

      const result = await getPhrases({});
      expect(result).toEqual([]);
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockSelectFrom).toHaveBeenCalledWith('phrase');
    });
  });

  describe('addPhrase', () => {
    it('should insert a new phrase for authenticated users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });

      const mockValues = jest.fn().mockReturnThis();
      const mockExecute = jest.fn().mockResolvedValue([]);
      mockInsertInto.mockReturnValue({
        // values: mockValues,
        transaction: jest.fn().mockReturnValue({
          execute: jest.fn((callback) =>
            callback({
              insertInto: jest.fn().mockReturnValue({
                values: jest.fn().mockReturnThis(),
                returning: jest.fn().mockReturnThis(),
                executeTakeFirstOrThrow: jest.fn().mockResolvedValue({ id: 'mocked-id' }),
              }),
            })
          ),
        }),
      });

      await addPhrase({
        text: 'Hello',
        lang: 'en' as Iso639LanguageCode,
        source: 'test',
        filename: 'file.mp3',
        type: 'text' as PhraseType,
      });

      expect(mockInsertInto).toHaveBeenCalledWith('phrase');
      expect(mockValues).toHaveBeenCalledWith({
        text: 'Hello',
        lang: 'en',
        userId: 'user-id',
        source: 'test',
        type: 'text',
        filename: 'file.mp3',
      });
      expect(mockExecute).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });
  });

  describe('addPhraseTags', () => {
    it('should add tags to a phrase', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });

      const mockTransactionExecute = jest.fn((callback) =>
        callback({
          selectFrom: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            executeTakeFirst: jest.fn().mockResolvedValue(null),
          }),
          insertInto: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnThis(),
            returning: jest.fn().mockReturnThis(),
            executeTakeFirstOrThrow: jest.fn().mockResolvedValue({ id: 'new-tag-id' }),
            execute: jest.fn(),
          }),
        })
      );

      mockTransaction.mockReturnValue({
        execute: mockTransactionExecute,
      });

      await addPhraseTags({ phraseId: 'phrase-id', tags: ['tag1'] });

      expect(mockTransaction).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/library', 'page');
    });
  });

  describe('removePhraseTag', () => {
    it('should remove a tag from a phrase', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });

      const mockTransactionExecute = jest.fn((callback) =>
        callback({
          deleteFrom: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue([]),
          }),
        })
      );

      mockTransaction.mockReturnValue({
        execute: mockTransactionExecute,
      });

      await removePhraseTag({ phraseId: 'phrase-id', tagId: 'tag-id' });

      expect(mockTransaction).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/library', 'page');
    });
  });

  describe('updatePhrase', () => {
    it('should update the text of a phrase', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });

      const mockSet = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockExecute = jest.fn().mockResolvedValue([]);

      mockUpdateTable.mockReturnValue({
        set: mockSet,
        where: mockWhere,
        execute: mockExecute,
      });

      await updatePhrase({ phraseId: 'phrase-id', text: 'Updated Text' });

      expect(mockUpdateTable).toHaveBeenCalledWith('phrase');
      expect(mockSet).toHaveBeenCalledWith({ text: 'Updated Text' });
      expect(mockWhere).toHaveBeenCalledTimes(2); // For 'id' and 'userId'
      expect(mockExecute).toHaveBeenCalled();
    });
  });

  describe('togglePhraseFavorite', () => {
    it('should toggle the favorite status of a phrase', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });

      const mockSet = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockExecute = jest.fn().mockResolvedValue([]);

      mockUpdateTable.mockReturnValue({
        set: mockSet,
        where: mockWhere,
        execute: mockExecute,
      });

      await togglePhraseFavorite({
        phraseId: 'phrase-id',
        isFavorite: true,
      });

      expect(mockUpdateTable).toHaveBeenCalledWith('phrase');
      expect(mockSet).toHaveBeenCalledWith({ favorite: false });
      expect(mockWhere).toHaveBeenCalledTimes(2);
      expect(mockExecute).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/library');
    });
  });

  describe('addTranslation', () => {
    it('should add a translation between two phrases', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });

      const mockTransactionExecute = jest.fn((callback) =>
        callback({
          insertInto: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnThis(),
            returning: jest.fn().mockReturnThis(),
            executeTakeFirstOrThrow: jest.fn().mockResolvedValue({ id: 'translation-id' }),
          }),
        })
      );

      mockTransaction.mockReturnValue({
        execute: mockTransactionExecute,
      });

      await addTranslation({
        primaryPhraseIds: ['primary-phrase-id'],
        genResponse: {
          input_text: 'Hello',
          input_lang: 'en',
          output_text: 'Hola',
          output_lang: 'es',
        },
        source: 'home',
      });

      expect(mockTransaction).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/library', 'page');
    });
  });

  describe('deletePhrase', () => {
    it('should delete a phrase and associated file', async () => {
      // Mock the authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });

      // Mock the database delete operation
      const mockWhere = jest.fn().mockReturnThis();
      const mockReturning = jest.fn().mockReturnThis();
      const mockExecute = jest.fn().mockResolvedValue([{ filename: 'file.mp3' }]);

      mockDeleteFrom.mockReturnValue({
        where: mockWhere,
        returning: mockReturning,
        execute: mockExecute,
      });

      // Mock the storage `remove` method
      const mockRemove = jest.fn().mockResolvedValue({ data: null, error: null });
      const storage = { remove: mockRemove };
      mockSupabase.storage.from.mockReturnValue(storage);

      // Call the function under test
      await deletePhrase('phrase-id');

      // Assertions
      expect(mockDeleteFrom).toHaveBeenCalledWith('phrase');
      expect(mockWhere).toHaveBeenCalledTimes(2); // For 'id' and 'userId'
      expect(mockReturning).toHaveBeenCalledWith('filename');
      expect(mockExecute).toHaveBeenCalled();
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('user-recordings');
      expect(storage.remove).toHaveBeenCalledWith(['user-id/file.mp3']);
      expect(revalidatePath).toHaveBeenCalledWith('/library', 'page');
    });
  });
});
