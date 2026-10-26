import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import API_BASE_URL from '../../utils/api';

/**
 * Admin field for books hosted on archive.org: paste the book's archive.org
 * link, "Fetch details" reads its title/author/cover/PDF from archive.org and
 * passes them to onFetched(). The PDF stays on archive.org (free, unlimited),
 * only the link is saved in our database.
 */
export default function ArchiveBookField({ archiveId, onFetched, onClear, language = 'en' }) {
  const [input, setInput] = useState(archiveId ? `https://archive.org/details/${archiveId}` : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(null);
  const ta = language === 'ta';

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    setInfo(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/archive/lookup?url=${encodeURIComponent(input)}`, { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not read this archive.org link');
      setInfo(data);
      onFetched(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 2.5, mt: 1, p: 2, border: '1px dashed #c9a227', borderRadius: 1, bgcolor: '#fffdf5' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#333', fontFamily: 'Georgia, serif' }}>
        {ta ? 'archive.org நூல் இணைப்பு' : 'Book on archive.org (recommended for PDF books)'}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: '#666', mb: 1 }}>
        {ta
          ? 'archive.org இல் பதிவேற்றிய நூலின் இணைப்பை ஒட்டவும் (எ.கா. https://archive.org/details/நூல்-அடையாளம்)'
          : 'Upload the PDF to archive.org, then paste its link here, e.g. https://archive.org/details/your-book-id'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          sx={{ flex: 1, minWidth: 220 }}
          placeholder="https://archive.org/details/..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={fetchDetails}
          disabled={!input.trim() || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#700000' }, textTransform: 'none' }}
        >
          {ta ? 'விவரங்களைப் பெறு' : 'Fetch details'}
        </Button>
        {archiveId && onClear && (
          <Button variant="text" onClick={() => { setInput(''); setInfo(null); onClear(); }} sx={{ textTransform: 'none', color: '#8B0000' }}>
            {ta ? 'நீக்கு' : 'Remove'}
          </Button>
        )}
      </Box>
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      {info && (
        <Alert severity={info.ready ? 'success' : 'info'} sx={{ mt: 1 }}>
          {info.ready
            ? `${info.title}${info.pages ? ` — ${info.pages} pages` : ''}${info.pdfSize ? `, PDF ${info.pdfSize}` : ''}. Details filled in below; check them and save.`
            : 'archive.org is still preparing this book (this can take a few hours after uploading). You can save now; the reader works once archive.org finishes.'}
        </Alert>
      )}
      {!info && archiveId && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#2e7d32' }}>
          {ta ? 'இணைக்கப்பட்டது: ' : 'Linked: '}archive.org/details/{archiveId}
        </Typography>
      )}
    </Box>
  );
}
