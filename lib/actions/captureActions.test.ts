'use server';
import db from '../database';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { addUserMedia, removeUserMedia } from './captureActions';
import { mockDeleteFrom, mockSupabase } from '@/_testing_/mocks/mocks';

// Mock dependencies

(createClient as jest.Mock).mockReturnValue(mockSupabase);

describe('addUserMedia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add user media and revalidate path', async () => {
    // Mock Supabase response
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user123' } },
    });

    // Mock database response
    const mockTransaction = {
      execute: jest.fn((callback) =>
        callback({
          insertInto: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnThis(),
            returning: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            executeTakeFirstOrThrow: jest.fn().mockResolvedValue({ id: 'media123' }),
            execute: jest.fn(),
          }),
        })
      ),
    };
    (db.transaction as jest.Mock).mockReturnValue(mockTransaction);

    const media = {
      title: 'Test Title',
      description: 'Test Description',
      websiteUrl: 'https://example.com',
      mediaUrl: 'https://media.com/media',
      imageUrl: 'https://image.com/image',
    };

    await addUserMedia(media);

    // Assertions
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(mockTransaction.execute).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('should not add media if user is not authenticated', async () => {
    // Mock Supabase response
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const media = {
      title: 'Test Title',
      description: 'Test Description',
      websiteUrl: 'https://example.com',
      mediaUrl: 'https://media.com/media',
      imageUrl: 'https://image.com/image',
    };

    await addUserMedia(media);

    // Assertions
    expect(db.transaction).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('should throw an error if the transaction fails', async () => {
    // Mock Supabase response
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user123' } },
    });

    // Mock database response to throw an error
    const mockTransaction = {
      execute: jest.fn(() => {
        throw new Error('Transaction failed');
      }),
    };
    (db.transaction as jest.Mock).mockReturnValue(mockTransaction);

    const media = {
      title: 'Test Title',
      description: 'Test Description',
      websiteUrl: 'https://example.com',
      mediaUrl: 'https://media.com/media',
      imageUrl: 'https://image.com/image',
    };

    await expect(addUserMedia(media)).rejects.toThrow(
      'Error adding media: Error: Transaction failed'
    );

    // Assertions
    expect(mockTransaction.execute).toHaveBeenCalled();
  });
});

describe('removeUserMedia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove user media and revalidate path', async () => {
    // Mock Supabase response
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user123' } },
    });

    const mediaId = 'media123';

    const deleteFromChain = {
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue([]),
    };

    mockDeleteFrom.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockReturnThis(),
    });

    await removeUserMedia(mediaId);

    // Assertions

    expect(mockDeleteFrom.mockReturnValue(deleteFromChain)).toHaveBeenCalledWith('userMedia');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('should not remove media if user is not authenticated', async () => {
    // Mock Supabase response
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const mediaId = 'media123';

    await removeUserMedia(mediaId);

    // Assertions
    expect(db.deleteFrom).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('should throw an error if deletion fails', async () => {
    // Mock Supabase response
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user123' } },
    });

    // Mock database response to throw an error
    (db.deleteFrom as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      execute: jest.fn(() => {
        throw new Error('Deletion failed');
      }),
    });

    const mediaId = 'media123';

    await expect(removeUserMedia(mediaId)).rejects.toThrow(
      'Error removing media: Error: Deletion failed'
    );

    // Assertions
    expect(db.deleteFrom).toHaveBeenCalled();
  });
});
