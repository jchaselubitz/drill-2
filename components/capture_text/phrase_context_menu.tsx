import { CopyIcon } from '@radix-ui/react-icons';
import { Iso639LanguageCode } from 'kysely-codegen';
import { Check, Copy, Loader2, Save, Stars } from 'lucide-react';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatContext } from '@/contexts/chat_window_context';
import { addPhrase } from '@/lib/actions/phraseActions';
import { getPhraseType } from '@/lib/helpers/helpersPhrase';
import { cn } from '@/lib/utils';

interface SharedWordContextMenuProps {
  associatedPhraseId?: string | undefined;
  lang: Iso639LanguageCode;
}

interface WordContextMenuProps extends SharedWordContextMenuProps {
  word: string;
}

export const WordContextMenu: React.FC<WordContextMenuProps> = ({
  word,
  lang,
  associatedPhraseId,
}) => {
  const { setChatContext, setChatOpen } = useChatContext();
  const [buttonState, setButtonState] = React.useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [isOpen, setIsOpen] = React.useState(false);

  const wordWithoutPunctuation = word.replace(/[.,/#!$%^&*;:{}=_`~()-]/g, '').trim();
  const handleCopy = () => {
    navigator.clipboard.writeText(wordWithoutPunctuation);
  };
  const handleSendToChat = () => {
    setChatContext({ matterText: wordWithoutPunctuation });
    setChatOpen(true);
  };

  const handleSave = async () => {
    setButtonState('loading');
    try {
      await addPhrase({
        source: 'home',
        text: wordWithoutPunctuation,
        lang,
        type: getPhraseType(wordWithoutPunctuation),
        associationId: associatedPhraseId,
      });
      setButtonState('success');
    } catch (error) {
      if (`${error}`.includes('unique_phrase_user_lang')) {
        alert('Phrase already exists');
        setButtonState('success');
        return;
      }
      setButtonState('error');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <span>
          <span className={cn(isOpen && 'underline decoration-4 decoration-sky-500')}>
            {word}
            {'\u00A0'}
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{wordWithoutPunctuation}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy}>
          <CopyIcon />

          <span>Copy</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSave}>
          {buttonState === 'loading' ? (
            <div className="animate-spin">
              {' '}
              <Loader2 />{' '}
            </div>
          ) : (
            <Save />
          )}
          <span>Save</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSendToChat}>
          <Stars />
          <span>Send to chat</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface PhraseContextMenuProps extends SharedWordContextMenuProps {
  phrase: string;
}

const PhraseContextMenu: React.FC<PhraseContextMenuProps> = ({
  phrase,
  lang,
  associatedPhraseId,
}) => {
  const [copying, setCopying] = React.useState(false);
  const phraseArray = phrase.split(' ');

  const handleCopy = () => {
    navigator.clipboard.writeText(phrase);
    setCopying(true);
    setTimeout(() => {
      setCopying(false);
    }, 1000);
  };

  return (
    <div className="flex flex-wrap">
      {phraseArray.map((word, index) => (
        <WordContextMenu
          key={index}
          word={word}
          lang={lang}
          associatedPhraseId={associatedPhraseId}
        />
      ))}
      <button className="ml-2" onClick={handleCopy}>
        {copying ? <Check size={15} /> : <Copy size={15} />}
      </button>
    </div>
  );
};
export default PhraseContextMenu;
