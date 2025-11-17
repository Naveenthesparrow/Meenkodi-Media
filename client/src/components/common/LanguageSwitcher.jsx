import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Tooltip } from '@mui/material';

export default function LanguageSwitcher({ size = 'small', sx = {} }) {
	const { i18n } = useTranslation();

	const handleToggle = () => {
		const newLang = i18n.language === 'en' ? 'ta' : 'en';
		i18n.changeLanguage(newLang);
		try { localStorage.setItem('lang', newLang); } catch (_) {}
	};

	const isEnglish = i18n.language === 'en';

	return (
		<Tooltip title={isEnglish ? 'Switch to தமிழ்' : 'Switch to English'} arrow>
			<Box
				onClick={handleToggle}
				sx={{
					cursor: 'pointer',
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					px: 2,
					py: 0.75,
					borderRadius: '6px',
					bgcolor: 'transparent',
					border: '1px solid rgba(31,20,14,0.2)',
					transition: 'all 0.2s ease',
					fontFamily: "'Poppins', 'Hind Madurai', sans-serif",
					fontSize: 14,
					fontWeight: 500,
					color: '#1f140e',
					width: 70,
					height: 36,
					'&:hover': {
						bgcolor: 'rgba(186,29,22,0.05)',
						borderColor: '#ba1d16',
						color: '#ba1d16',
					},
					...sx
				}}
			>
				{isEnglish ? 'EN' : 'த'}
			</Box>
		</Tooltip>
	);
}
