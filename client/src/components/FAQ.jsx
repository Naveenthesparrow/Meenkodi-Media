import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQ = () => {
    const { t } = useTranslation();

    // We'll fetch the FAQ items from the translation file
    // Assuming the structure in json will be an array of objects or keys
    // For simplicity with i18next, we often map through a known number of items or a key that returns an array
    // Here we will assume we have keys like faq.q1.question, faq.q1.answer, etc.
    // A cleaner way is to have an array in the translation file, but i18next returnObjects: true works well.

    const faqItems = t('faq.items', { returnObjects: true });

    return (
        <Box sx={{
            bgcolor: '#f8f9fa',
            minHeight: '100vh',
            pt: { xs: 10, md: 12 },
            pb: 8,
            backgroundImage: {
              xs: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.02' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`,
              md: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.03' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`
            },
            backgroundSize: { xs: '8px 8px', md: '6px 6px' },
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center top',
            '@media (min-resolution: 1.5dppx)': {
              backgroundImage: {
                xs: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.12' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`,
                md: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.14' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`
              },
              backgroundSize: { xs: '18px 18px', md: '14px 14px' }
            }
          }}>
            {/* Hero Section */}
            <Container maxWidth="lg" sx={{ mb: 6, textAlign: 'center' }}>
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700,
                        color: '#1f140e',
                        fontSize: { xs: '2rem', md: '3rem' },
                        mb: 2
                    }}
                >
                    {t('faq.title')}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: "'Open Sans', sans-serif",
                        color: '#666',
                        maxWidth: '800px',
                        mx: 'auto',
                        lineHeight: 1.6
                    }}
                >
                    {t('faq.subtitle')}
                </Typography>
            </Container>

            {/* FAQ Accordion Section */}
            <Container maxWidth="md">
                {Array.isArray(faqItems) && faqItems.map((item, index) => (
                    <Paper
                        key={index}
                        elevation={0}
                        sx={{
                            mb: 2,
                            border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: 2,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                borderColor: 'rgba(186, 29, 22, 0.3)'
                            }
                        }}
                    >
                        <Accordion
                            disableGutters
                            elevation={0}
                            sx={{
                                '&:before': {
                                    display: 'none',
                                },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#ba1d16' }} />}
                                aria-controls={`panel${index}-content`}
                                id={`panel${index}-header`}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    '& .MuiAccordionSummary-content': {
                                        my: 2
                                    }
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: 600,
                                        color: '#1f140e',
                                        fontSize: { xs: '1rem', md: '1.1rem' }
                                    }}
                                >
                                    {item.question}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontFamily: "'Open Sans', sans-serif",
                                        color: '#444',
                                        lineHeight: 1.7
                                    }}
                                >
                                    {item.answer}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    </Paper>
                ))}
            </Container>
        </Box>
    );
};

export default FAQ;
