'use client';

import { DialogTitle } from '@radix-ui/react-dialog';
import CaptureAudio from '@/components/capture_audio';
import CaptureText from '@/components/capture_text';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCreateModal } from '@/contexts/create_modal_context';

export function CreateDialog() {
  const { modalOpen, setModalOpen } = useCreateModal();
  return (
    <Dialog open={modalOpen} onOpenChange={() => setModalOpen(!modalOpen)}>
      <DialogContent>
        <DialogTitle>Create Media </DialogTitle>
        <CaptureAudio />
        <CaptureText />
      </DialogContent>
    </Dialog>
  );
}
