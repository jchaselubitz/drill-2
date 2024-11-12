import { UploadIcon } from 'lucide-react';
import React, { useRef } from 'react';

interface UploadButtonProps {
  handleUpload: (file: File) => Promise<void>;
}

const UploadButton: React.FC<UploadButtonProps> = ({ handleUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      await handleUpload(files[0]);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        name="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-700"
        onClick={triggerFileInput}
      >
        <UploadIcon />
      </button>
    </>
  );
};

export default UploadButton;
