import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

export default function LanguageSwitcher({ size = 'small', sx = {} }) {
	const { i18n, t } = useTranslation();
	const [lang, setLang] = React.useState(i18n.language || 'en');

	const handleChange = (e) => {
		const value = e.target.value;
		setLang(value);
		i18n.changeLanguage(value);
		try { localStorage.setItem('lang', value); } catch (_) {}
	};

	return (
		<Box sx={sx}>      
			<FormControl size={size} variant="outlined">
				<InputLabel id="lang-select-label">{t('language.select')}</InputLabel>
				<Select
					labelId="lang-select-label"
					value={lang}
					label={t('language.select')}
					onChange={handleChange}
					sx={{ bgcolor: '#fff', minWidth: 120 }}
				>
					<MenuItem value="en">{t('language.english')}</MenuItem>
					<MenuItem value="ta">{t('language.tamil')}</MenuItem>
				</Select>
			</FormControl>
		</Box>
	);
}
