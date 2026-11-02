import React, { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography,
} from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../../utils/api';
import { useBilingualContent } from '../../utils/bilingualContent';

// Shown until an admin saves their own text (same as the original section)
const DEFAULT_CONTENT = {
  quotes: [
    { en: '"We explore the glorious Tamil dynasties.', ta: '"நாம் தமிழ் வம்சங்களை ஆராய்கிறோம்.' },
    { en: 'We preserve southern Tamil civilization.', ta: 'நாம் தமிழர் நாகரிகத்தை பாதுகாக்கிறோம்.' },
    { en: 'We celebrate the Meenkodi legacy."', ta: 'நாம் மீன்கொடி மரபை கொண்டாடுகிறோம்."' },
  ],
  stats: [
    { value: 850, suffix: 'k+', label: { en: 'Pandiya Artifacts Preserved', ta: 'கலைப்பொருட்கள் பாதுகாப்பு' } },
    { value: 380, suffix: '+', label: { en: 'Pandiya Era Manuscripts', ta: 'கையெழுத்துப் பிரதிகள்' } },
    { value: 65, suffix: '+', label: { en: 'Pandiya Dynasty Temples', ta: 'பாரம்பரிய கோவில்கள்' } },
    { value: 150, suffix: '+', label: { en: 'Pandiya Heritage Scholars', ta: 'பாரம்பரிய அறிஞர்கள்' } },
  ],
};

/** Home page black band: quote lines + numbers, editable by admins. */
export default function HomeStatsSection({ user, AnimatedCounter }) {
  const { i18n } = useTranslation();
  const getContent = useBilingualContent();
  const isTamil = (i18n.language || '').startsWith('ta');
  const isAdmin = user && user.role === 'admin';
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/api/site-content/home-stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => { if (active && res?.data?.stats) setContent(res.data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: '#000', color: '#fff', overflow: 'hidden' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        {content.quotes.map((quote, index) => (
          <Typography
            key={index}
            variant="h2"
            align="center"
            sx={{
              fontWeight: 700,
              mb: index === content.quotes.length - 1 ? 6 : 1.5,
              fontSize: isTamil ? { xs: '1.5rem', sm: '2.1rem', md: '2.4rem' } : { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
              color: '#fff',
              lineHeight: isTamil ? 1.2 : 1.3,
              letterSpacing: isTamil ? 0.4 : 0.1,
              fontStyle: 'italic',
            }}
          >
            {getContent(quote)}
          </Typography>
        ))}

        {/* Each number in its own column with a gap, so long labels wrap instead of running together */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: `repeat(${Math.max(1, content.stats.length)}, 1fr)` },
            columnGap: { xs: 2, md: 4 },
            rowGap: 3,
          }}
        >
          {content.stats.map((stat, index) => (
            <Box key={index} sx={{ textAlign: 'center', py: 2, minWidth: 0 }}>
              <Typography variant="h1" component="p" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }, color: '#DAA520', lineHeight: 1 }}>
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </Typography>
              <Typography sx={{ fontWeight: 500, color: '#999', fontSize: { xs: '0.75rem', md: '0.95rem' }, textTransform: 'uppercase', letterSpacing: { xs: 0.5, md: 1 }, lineHeight: 1.4 }}>
                {getContent(stat.label)}
              </Typography>
            </Box>
          ))}
        </Box>

        {isAdmin && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button onClick={() => setEditing(true)} startIcon={<Edit />} variant="outlined" size="small" sx={{ color: '#daa520', borderColor: 'rgba(218,165,32,0.6)', textTransform: 'none', '&:hover': { borderColor: '#daa520' } }}>
              {isTamil ? 'மாற்று' : 'Edit text & numbers'}
            </Button>
          </Box>
        )}
      </Container>

      {isAdmin && (
        <StatsEditor open={editing} content={content} onClose={() => setEditing(false)} onSaved={(saved) => { setContent(saved); setEditing(false); }} />
      )}
    </Box>
  );
}

function StatsEditor({ open, content, onClose, onSaved }) {
  const [draft, setDraft] = useState(content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) { setDraft(JSON.parse(JSON.stringify(content))); setError(''); } }, [open, content]);

  const setQuote = (i, lang, value) => setDraft((d) => ({ ...d, quotes: d.quotes.map((q, k) => (k === i ? { ...q, [lang]: value } : q)) }));
  const setStat = (i, patch) => setDraft((d) => ({ ...d, stats: d.stats.map((s, k) => (k === i ? { ...s, ...patch } : s)) }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/site-content/home-stats`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: draft }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Could not save');
      onSaved(body.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>Home page quote & numbers</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Quote lines</Typography>
        {draft.quotes.map((q, i) => (
          <Box key={i} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1, mb: 1 }}>
            <TextField size="small" label={`Line ${i + 1} (English)`} value={q.en} onChange={(e) => setQuote(i, 'en', e.target.value)} />
            <TextField size="small" label={`வரி ${i + 1} (Tamil)`} value={q.ta} onChange={(e) => setQuote(i, 'ta', e.target.value)} />
          </Box>
        ))}
        <Typography sx={{ fontWeight: 700, mt: 3, mb: 1 }}>Numbers</Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 1.5 }}>Use real figures. "After number" is what shows after it, e.g. <b>+</b> or <b>k+</b>.</Typography>
        {draft.stats.map((s, i) => (
          <Box key={i} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '110px 100px 1fr 1fr' }, gap: 1, mb: 1.5 }}>
            <TextField size="small" type="number" label="Number" value={s.value} onChange={(e) => setStat(i, { value: e.target.value })} />
            <TextField size="small" label="After number" value={s.suffix} onChange={(e) => setStat(i, { suffix: e.target.value })} />
            <TextField size="small" label="Label (English)" value={s.label.en} onChange={(e) => setStat(i, { label: { ...s.label, en: e.target.value } })} />
            <TextField size="small" label="தலைப்பு (Tamil)" value={s.label.ta} onChange={(e) => setStat(i, { label: { ...s.label, ta: e.target.value } })} />
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#666' }}>Cancel</Button>
        <Button onClick={save} variant="contained" disabled={saving} sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#6B0000' } }}>{saving ? 'Saving…' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
}
