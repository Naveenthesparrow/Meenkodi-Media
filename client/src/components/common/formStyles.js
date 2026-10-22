// Website-coloured outline + focus ring for form inputs
export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    bgcolor: '#fff',
    '& fieldset': { borderColor: 'rgba(0,0,0,0.18)' },
    '&:hover fieldset': { borderColor: 'rgba(139,0,0,0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#8B0000', borderWidth: 2 },
  },
};

// Website colours for the in-page (inline) edit mode on Explore item pages.
// Applied to a wrapper so every input, label and button inside picks it up.
export const inlineEditSx = {
  '& .MuiInputLabel-root': { color: '#7a4a3a' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#8B0000' },
  '& .MuiInput-underline:before': { borderBottomColor: 'rgba(139,0,0,0.25)' },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'rgba(139,0,0,0.6)' },
  '& .MuiInput-underline:after': { borderBottomColor: '#8B0000' },
  '& .MuiOutlinedInput-root': { borderRadius: 0 },
  '& .MuiOutlinedInput-root:hover fieldset': { borderColor: 'rgba(139,0,0,0.5)' },
  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#8B0000' },
  '& .MuiButton-contained': {
    bgcolor: '#8B0000', color: '#fff', borderRadius: 0, boxShadow: 'none',
    '&:hover': { bgcolor: '#6B0000', boxShadow: 'none' },
  },
  '& .MuiButton-outlined': {
    color: '#8B0000', borderColor: 'rgba(139,0,0,0.5)', borderRadius: 0,
    '&:hover': { borderColor: '#8B0000', bgcolor: 'rgba(139,0,0,0.04)' },
  },
  '& .MuiButton-text': { color: '#8B0000' },
};
