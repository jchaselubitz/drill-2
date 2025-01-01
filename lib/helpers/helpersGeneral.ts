export const handleReturnKeyPress = ({
  e,
  callBack,
}: {
  e: React.KeyboardEvent<HTMLTextAreaElement>;
  callBack: any;
}) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    callBack();
  }
};
