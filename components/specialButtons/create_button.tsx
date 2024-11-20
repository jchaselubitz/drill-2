import { Plus } from 'lucide-react';
import React from 'react';
import { useCreateModal } from '@/contexts/create_modal_context';

const CreateButton: React.FC = () => {
  const { setModalOpen } = useCreateModal();
  return (
    <button
      onClick={() => setModalOpen(true)}
      className="flex rounded-full bg-slate-600 text-white h-14 w-14 items-center justify-center shadow-lg hover:shadow-sm active:text-slate-600 active:bg-white"
    >
      <Plus size={32} />
    </button>
  );
};

export default CreateButton;
