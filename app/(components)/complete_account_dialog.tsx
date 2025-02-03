import React, { useState } from 'react';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { convertAnonAccount } from '@/lib/actions/userActions';

const CompleteAccountDialog: React.FC = () => {
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setButtonState('loading');
    try {
      const email = data.get('email')?.toString();
      const name = data.get('name')?.toString();
      if (!email || !name) {
        alert('Name and email required');
        setButtonState('error');
        return;
      } else {
        await convertAnonAccount(email, name);
        setButtonState('success');
      }
    } catch {
      setButtonState('error');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="p-2 flex justify-center w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium">
          Complete account to save your work.
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create an Account</DialogTitle>
        <DialogDescription>Please enter your email address to create an account.</DialogDescription>
        <form
          className="flex flex-col gap-2 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(new FormData(e.currentTarget));
          }}
        >
          <Input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full p-2 border border-gray-300 rounded mt-2"
          />
          <Input
            type="text"
            name="name"
            placeholder="Here's Johnny"
            required
            className="w-full p-2 border border-gray-300 rounded mt-2"
          />
          <LoadingButton
            type="submit"
            text="Create account"
            loadingText="Creating"
            successText="Created - Check your email"
            buttonState={buttonState}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteAccountDialog;
