import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';

interface ShareLinkProps {
  sessionLink: string;
  onCopyLink: () => void;
}

const ShareLink: React.FC<ShareLinkProps> = ({ sessionLink, onCopyLink }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">
          {t('dialectic.creation.shareLink.title')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          {t('dialectic.creation.shareLink.description')}
        </p>
      </div>

      <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div 
            className="text-sm px-3 py-2 rounded border flex-1 mr-3 break-all font-mono"
            style={{
              backgroundColor: `${theme === 'dark' ? '#1f2937' : '#f9fafb'} !important`,
              color: `${theme === 'dark' ? '#f3f4f6' : '#111827'} !important`
            }}
          >
            {sessionLink}
          </div>
          <button
            onClick={onCopyLink}
            className="px-4 py-2 bg-accent-500 text-white rounded hover:bg-accent-600 transition-colors"
          >
            {t('dialectic.creation.shareLink.copy')}
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            {t('dialectic.creation.shareLink.qrCode')}
          </p>
          {/* QR code component could be added here */}
        </div>
      </div>
    </div>
  );
};

export default ShareLink;
