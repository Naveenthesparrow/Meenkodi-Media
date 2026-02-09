import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Divider,
  TextField,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Title,
  FormatListBulleted,
  FormatListNumbered,
  Image as ImageIcon,
  Visibility,
  Code,
  Link as LinkIcon
} from '@mui/icons-material';

export default function ArticleEditor({ value, onChange, language = 'en', placeholder }) {
  const [viewMode, setViewMode] = useState('split'); // split, edit, preview
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const textareaRef = React.useRef(null);

  // Get current selection
  const updateSelection = () => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart);
      setSelectionEnd(textareaRef.current.selectionEnd);
    }
  };

  // Insert text at cursor position
  const insertText = (before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newText = 
      value.substring(0, start) + 
      before + textToInsert + after + 
      value.substring(end);
    
    onChange(newText);

    // Set cursor position after insert
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Format handlers
  const handleBold = () => insertText('**', '**', 'bold text');
  const handleItalic = () => insertText('*', '*', 'italic text');
  const handleUnderline = () => insertText('<u>', '</u>', 'underlined text');
  
  const handleHeading1 = () => {
    const lines = value.split('\n');
    const currentLineIndex = value.substring(0, selectionStart).split('\n').length - 1;
    lines[currentLineIndex] = '# ' + lines[currentLineIndex].replace(/^#+\s*/, '');
    onChange(lines.join('\n'));
  };
  
  const handleHeading2 = () => {
    const lines = value.split('\n');
    const currentLineIndex = value.substring(0, selectionStart).split('\n').length - 1;
    lines[currentLineIndex] = '## ' + lines[currentLineIndex].replace(/^#+\s*/, '');
    onChange(lines.join('\n'));
  };
  
  const handleHeading3 = () => {
    const lines = value.split('\n');
    const currentLineIndex = value.substring(0, selectionStart).split('\n').length - 1;
    lines[currentLineIndex] = '### ' + lines[currentLineIndex].replace(/^#+\s*/, '');
    onChange(lines.join('\n'));
  };

  const handleBulletList = () => insertText('\n- ', '', 'List item');
  const handleNumberedList = () => insertText('\n1. ', '', 'List item');

  const handleImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      insertText(`\n![Image description](${url})\n`, '');
    }
  };

  const handleLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      insertText('[', `](${url})`, 'link text');
    }
  };

  // Render preview with markdown-style formatting
  const renderPreview = useMemo(() => {
    let html = value;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.3rem; font-weight: 600; margin: 1.2em 0 0.6em; color: #333;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.6rem; font-weight: 700; margin: 1.3em 0 0.7em; color: #222;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 2rem; font-weight: 700; margin: 1.5em 0 0.8em; color: #000;">$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700;">$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
    
    // Underline
    html = html.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
    
    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 1em 0; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #8B0000; text-decoration: underline;">$1</a>');
    
    // Bullet lists
    html = html.replace(/^\- (.*$)/gim, '<li style="margin-left: 1.5em; margin-bottom: 0.3em;">$1</li>');
    
    // Numbered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin-left: 1.5em; margin-bottom: 0.3em; list-style-type: decimal;">$1</li>');
    
    // Paragraphs (line breaks)
    html = html.replace(/\n\n/g, '</p><p style="margin: 1em 0; line-height: 1.8;">');
    html = html.replace(/\n/g, '<br/>');
    
    return `<div style="font-family: Georgia, serif; font-size: 1.05rem; line-height: 1.8; color: #333;"><p style="margin: 1em 0; line-height: 1.8;">${html}</p></div>`;
  }, [value]);

  return (
    <Box>
      {/* Toolbar */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 1.5, 
          mb: 2, 
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          bgcolor: '#fafafa'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="edit" sx={{ px: 2, fontSize: '0.75rem' }}>
              Edit
            </ToggleButton>
            <ToggleButton value="split" sx={{ px: 2, fontSize: '0.75rem' }}>
              Split
            </ToggleButton>
            <ToggleButton value="preview" sx={{ px: 2, fontSize: '0.75rem' }}>
              Preview
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem />

          {/* Text Formatting */}
          <Tooltip title="Bold (Ctrl+B)">
            <IconButton size="small" onClick={handleBold}>
              <FormatBold fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Italic (Ctrl+I)">
            <IconButton size="small" onClick={handleItalic}>
              <FormatItalic fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Underline (Ctrl+U)">
            <IconButton size="small" onClick={handleUnderline}>
              <FormatUnderlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem />

          {/* Headings */}
          <Tooltip title="Heading 1">
            <Button 
              size="small" 
              onClick={handleHeading1}
              sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem', fontWeight: 700 }}
            >
              H1
            </Button>
          </Tooltip>
          
          <Tooltip title="Heading 2">
            <Button 
              size="small" 
              onClick={handleHeading2}
              sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem', fontWeight: 700 }}
            >
              H2
            </Button>
          </Tooltip>
          
          <Tooltip title="Heading 3">
            <Button 
              size="small" 
              onClick={handleHeading3}
              sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem', fontWeight: 700 }}
            >
              H3
            </Button>
          </Tooltip>

          <Divider orientation="vertical" flexItem />

          {/* Lists */}
          <Tooltip title="Bullet List">
            <IconButton size="small" onClick={handleBulletList}>
              <FormatListBulleted fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Numbered List">
            <IconButton size="small" onClick={handleNumberedList}>
              <FormatListNumbered fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem />

          {/* Media */}
          <Tooltip title="Insert Image">
            <IconButton size="small" onClick={handleImage} sx={{ color: '#8B0000' }}>
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Insert Link">
            <IconButton size="small" onClick={handleLink}>
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Help Text */}
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            mt: 1, 
            color: '#666',
            fontSize: '0.7rem',
            fontStyle: 'italic'
          }}
        >
          💡 Tip: Use **text** for bold, *text* for italic, # for headings, and the toolbar buttons for images and formatting
        </Typography>
      </Paper>

      {/* Editor Area */}
      <Box sx={{ display: 'flex', gap: 2, minHeight: 500 }}>
        {/* Edit View */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <Box 
            sx={{ 
              flex: viewMode === 'split' ? 1 : 'auto',
              width: viewMode === 'split' ? '50%' : '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography 
              variant="overline" 
              sx={{ 
                color: '#8B0000', 
                fontWeight: 700, 
                mb: 1,
                fontSize: '0.7rem'
              }}
            >
              {language === 'en' ? 'EDITOR' : 'எடிட்டர்'}
            </Typography>
            <TextField
              multiline
              fullWidth
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onSelect={updateSelection}
              onClick={updateSelection}
              onKeyUp={updateSelection}
              placeholder={placeholder || (language === 'en' 
                ? 'Start writing your article here...\n\nTips:\n- Use # for main heading\n- Use ## for subheading\n- Use **text** for bold\n- Use *text* for italic\n- Click the image button to add images' 
                : 'உங்கள் கட்டுரையை இங்கே எழுதத் தொடங்குங்கள்...'
              )}
              inputRef={textareaRef}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  fontFamily: 'Georgia, serif',
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  '& textarea': {
                    height: '100% !important',
                    overflow: 'auto !important'
                  },
                  '&:hover fieldset': {
                    borderColor: '#8B0000',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8B0000',
                    borderWidth: 2,
                  }
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'Georgia, serif',
                  fontSize: '1rem',
                  lineHeight: 1.8,
                }
              }}
            />
          </Box>
        )}

        {/* Preview View */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <Box 
            sx={{ 
              flex: viewMode === 'split' ? 1 : 'auto',
              width: viewMode === 'split' ? '50%' : '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography 
              variant="overline" 
              sx={{ 
                color: '#8B0000', 
                fontWeight: 700, 
                mb: 1,
                fontSize: '0.7rem'
              }}
            >
              {language === 'en' ? 'LIVE PREVIEW' : 'நேரடி முன்னோட்டம்'}
            </Typography>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 3,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                overflow: 'auto',
                bgcolor: '#fff',
                minHeight: 450
              }}
            >
              {value ? (
                <Box dangerouslySetInnerHTML={{ __html: renderPreview }} />
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#999', 
                    fontStyle: 'italic',
                    textAlign: 'center',
                    mt: 4
                  }}
                >
                  {language === 'en' 
                    ? 'Preview will appear here as you type...' 
                    : 'நீங்கள் தட்டச்சு செய்யும்போது முன்னோட்டம் இங்கே தோன்றும்...'
                  }
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </Box>

      {/* Character Count */}
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block', 
          mt: 1, 
          color: '#666',
          textAlign: 'right',
          fontSize: '0.7rem'
        }}
      >
        {value.length} characters
      </Typography>
    </Box>
  );
}
