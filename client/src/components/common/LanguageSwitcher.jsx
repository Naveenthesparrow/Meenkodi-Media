import React from 'react';
import { Button, ButtonGroup } from '@mui/material';
import i18n from '../../utils/i18n';

export default function LanguageSwitcher({ size = 'small' }) {
  const current = i18n.language?.startsWith('ta') ? 'ta' : 'en';

  const switchTo = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <ButtonGroup variant="outlined" size={size} aria-label="language switcher">
      <Button
        onClick={() => switchTo('en')}
        sx={{
          fontWeight: 600,
          ...(current === 'en' && {
            bgcolor: '#111',
            color: '#fff',
            '&:hover': { bgcolor: '#333' }
          })
        }}
      >
        EN
      </Button>
      <Button
        onClick={() => switchTo('ta')}
        sx={{
          fontWeight: 600,
          ...(current === 'ta' && {
            bgcolor: '#111',
            color: '#fff',
            '&:hover': { bgcolor: '#333' }
          })
        }}
      >
        TA
      </Button>
    </ButtonGroup>
  );
}
