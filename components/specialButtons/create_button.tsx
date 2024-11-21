import { Plus } from 'lucide-react';
import React, { FC } from 'react';
import { useCreateModal } from '@/contexts/create_modal_context';

interface CreateButtonProps {
  isMobile?: boolean;
}

const CreateButton: FC<CreateButtonProps> = ({ isMobile }) => {
  const { setModalOpen } = useCreateModal();

  const mobileButton = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex rounded-full bg-zinc-600 text-white h-14 w-14 items-center justify-center shadow-lg hover:shadow-sm active:text-zinc-600 active:bg-white"
    >
      <Plus size={32} />
    </button>
  );

  const desktopButton = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center gap-2 bg-zinc-200  rounded-full p-2 px-4 border-2 border-zinc-900 hover:shadow-sm active:text-zinc-600 active:bg-white text-sm text-zinc-900 font-semibold"
    >
      <Plus size={18} />
      <span>Create</span>
    </button>
  );
  return isMobile ? mobileButton : desktopButton;
};

export default CreateButton;
