import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    TextField,
    Button,
    Grid,
    Chip,
    Container,
    Paper,
    IconButton,
    Divider
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import ScrollExpandMedia from "../common/ScrollExpandMedia";
import MediaUpload from "../common/MediaUpload";
import Comments from "../Comments";
import { useBilingualContent } from "../../utils/bilingualContent";
import API_BASE_URL from "../../utils/api";
import useScrollProgress from '../common/useScrollProgress';

// --- THEMATIC STYLES ---
const TINAI_STYLES = {
    kurinji: {
        color: '#8B5CF6',
        gradient: 'linear-gradient(135deg,rgba(139,92,246,0.95),rgba(99,102,241,0.95))',
        bgGradient: 'linear-gradient(to bottom, #1a1025, #fff 30%)',
        accent: '#7C3AED'
    },
    mullai: {
        color: '#22C55E',
        gradient: 'linear-gradient(135deg,rgba(34,197,94,0.95),rgba(21,128,61,0.95))',
        bgGradient: 'linear-gradient(to bottom, #0f291a, #fff 30%)',
        accent: '#15803D'
    },
    marutham: {
        color: '#84CC16',
        gradient: 'linear-gradient(135deg,rgba(132,204,22,0.95),rgba(77,124,15,0.95))',
        bgGradient: 'linear-gradient(to bottom, #1a2505, #fff 30%)',
        accent: '#4D7C0F'
    },
    neithal: {
        color: '#38BDF8',
        gradient: 'linear-gradient(135deg,rgba(56,189,248,0.95),rgba(14,165,233,0.95))',
        bgGradient: 'linear-gradient(to bottom, #082f49, #fff 30%)',
        accent: '#0284C7'
    },
    palai: {
        color: '#F59E0B',
        gradient: 'linear-gradient(135deg,rgba(245,158,11,0.95),rgba(234,88,12,0.95))',
        bgGradient: 'linear-gradient(to bottom, #451a03, #fff 30%)',
        accent: '#EA580C'
    }
};

const SectionHeading = ({ children }) => (
    <Typography
        variant="h6"
        sx={{
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontSize: '0.75rem',
            color: '#1a202c',
            mb: 2.5,
            pb: 1,
            display: 'inline-block'
        }}
    >
        {children}
    </Typography>
);

const AttributeCard = ({ label, items, delay, tinaiColor }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
    >
        <Box sx={{ mb: { xs: 4, md: 5 } }}>
            <SectionHeading>{label}</SectionHeading>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {items && items.length > 0 ? (
                    items.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: delay + idx * 0.05 }}
                            whileHover={{ scale: 1.08, y: -3 }}
                        >
                            <Chip
                                label={item}
                                sx={{
                                    bgcolor: '#fff',
                                    color: '#1a202c',
                                    fontWeight: 600,
                                    borderRadius: '12px',
                                    border: `2px solid ${tinaiColor}30`,
                                    px: 2,
                                    py: 2.5,
                                    height: 'auto',
                                    fontSize: '0.95rem',
                                    cursor: 'default',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': { 
                                        bgcolor: tinaiColor,
                                        color: '#fff',
                                        borderColor: tinaiColor,
                                        boxShadow: `0 8px 20px ${tinaiColor}40`,
                                        transform: 'translateY(-2px)'
                                    },
                                    '& .MuiChip-label': {
                                        px: 1,
                                        py: 0.5
                                    }
                                }}
                            />
                        </motion.div>
                    ))
                ) : (
                    <Typography variant="body2" sx={{ color: '#a0aec0', fontStyle: 'italic', py: 1 }}>
                        No records found
                    </Typography>
                )}
            </Box>
        </Box>
    </motion.div>
);

export default function LandDetailExpanded({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const getContent = useBilingualContent();
    const [land, setLand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: { en: "", ta: "" },
        type: "",
        description: { en: "", ta: "" },
        gods: "",
        people: "",
        flora: "",
        fauna: "",
        poetry: "",
        image: ""
    });

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/lands/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch land details");
                return res.json();
            })
            .then((data) => {
                setLand(data);
                setFormData({
                    name: data.name || { en: "", ta: "" },
                    type: data.type || "",
                    description: data.description || { en: "", ta: "" },
                    gods: data.gods ? data.gods.join(", ") : "",
                    people: data.people ? data.people.join(", ") : "",
                    flora: data.flora ? data.flora.join(", ") : "",
                    fauna: data.fauna ? data.fauna.join(", ") : "",
                    poetry: data.poetry ? data.poetry.join("\n") : "",
                    image: data.image || ""
                });
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const handleSave = async () => {
        setSubmitting(true);
        try {
            const updatedLand = {
                ...formData,
                gods: formData.gods.split(",").map(s => s.trim()).filter(Boolean),
                people: formData.people.split(",").map(s => s.trim()).filter(Boolean),
                flora: formData.flora.split(",").map(s => s.trim()).filter(Boolean),
                fauna: formData.fauna.split(",").map(s => s.trim()).filter(Boolean),
                poetry: formData.poetry.split("\n").map(s => s.trim()).filter(Boolean),
            };

            const res = await fetch(`${API_BASE_URL}/api/lands/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(updatedLand),
            });

            if (!res.ok) throw new Error("Failed to update land");

            const data = await res.json();
            setLand(data);
            setEditMode(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this land?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/lands/${id}`, { method: "DELETE", credentials: "include" });
            if (!res.ok) throw new Error("Failed to delete land");
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    const scrolled = useScrollProgress(2); // Hide back button if scrolled more than 2px

    if (loading) return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
            <CircularProgress sx={{ color: '#D4AF37' }} />
        </Box>
    );

    if (error || !land) return (
        <Container sx={{ py: 10, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>{error || "Land not found"}</Alert>
            <Button variant="outlined" onClick={() => navigate('/')}>Return Home</Button>
        </Container>
    );

    const tinaiStyle = TINAI_STYLES[land.type.toLowerCase()] || TINAI_STYLES.kurinji;

    // --- ADMIN EDIT VIEW ---
    if (editMode) {
        return (
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Paper sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5" fontWeight="bold">Edit {land.type}</Typography>
                        <IconButton onClick={() => setEditMode(false)}><CloseIcon /></IconButton>
                    </Box>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Name (EN)" value={formData.name.en} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Name (TA)" value={formData.name.ta} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, ta: e.target.value } })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Description (EN)" multiline rows={6} value={formData.description.en} onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Description (TA)" multiline rows={6} value={formData.description.ta} onChange={(e) => setFormData({ ...formData, description: { ...formData.description, ta: e.target.value } })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Gods" value={formData.gods} onChange={(e) => setFormData({ ...formData, gods: e.target.value })} helperText="Comma separated" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="People" value={formData.people} onChange={(e) => setFormData({ ...formData, people: e.target.value })} helperText="Comma separated" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Flora" value={formData.flora} onChange={(e) => setFormData({ ...formData, flora: e.target.value })} helperText="Comma separated" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Fauna" value={formData.fauna} onChange={(e) => setFormData({ ...formData, fauna: e.target.value })} helperText="Comma separated" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Poetry (HTML allowed)" multiline rows={8} value={formData.poetry} onChange={(e) => setFormData({ ...formData, poetry: e.target.value })} />
                            <Box sx={{ mt: 2 }}>
                                <MediaUpload onImageChange={(url) => setFormData({ ...formData, image: url })} currentImage={formData.image} label="Hero Image" showInputsOnly />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>Delete</Button>
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        );
    }

    // --- PUBLIC SCROLL EXPAND VIEW ---
    return (
        <Box sx={{ position: 'relative', bgcolor: '#000' }}>
            {/* Fixed Navigation Buttons */}
            {!scrolled && (
                <Box sx={{ position: 'fixed', top: { xs: 56, sm: 64, md: 72 }, left: { xs: 16, md: 32 }, zIndex: 2000, pointerEvents: 'auto' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            startIcon={<ArrowBackIcon sx={{ fontSize: 26, ml: 0.5 }} />}
                            onClick={() => navigate('/')}
                            sx={{
                                color: '#fff',
                                bgcolor: 'rgba(30,30,30,0.55)',
                                border: '1.5px solid rgba(255,255,255,0.18)',
                                px: 3.5,
                                py: 1.2,
                                borderRadius: 999,
                                fontWeight: 700,
                                fontSize: '1.08rem',
                                letterSpacing: '0.04em',
                                minWidth: 0,
                                minHeight: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.2,
                                mt: { xs: 1, md: 2 },
                                '& .MuiButton-startIcon': {
                                    mr: 1.2,
                                    ml: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                },
                                '&:hover': {
                                    bgcolor: 'rgba(30,30,30,0.82)',
                                    borderColor: 'rgba(255,255,255,0.32)',
                                    transform: 'translateX(-4px) scale(1.04)',
                                    boxShadow: '0 8px 32px 0 rgba(0,0,0,0.22)',
                                },
                                transition: 'all 0.25s cubic-bezier(.4,0,.2,1)'
                            }}
                        >
                            Back
                        </Button>
                    </motion.div>
                </Box>
            )}

            {user?.role === 'admin' && (
                <Box sx={{ position: 'fixed', top: { xs: 16, md: 24 }, right: { xs: 16, md: 24 }, zIndex: 1200 }}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <IconButton
                            onClick={() => setEditMode(true)}
                            sx={{ 
                                color: '#fff', 
                                bgcolor: 'rgba(0,0,0,0.7)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                width: 56,
                                height: 56,
                                '&:hover': { 
                                    bgcolor: 'rgba(0,0,0,0.9)',
                                    borderColor: 'rgba(255,255,255,0.3)'
                                } 
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                    </motion.div>
                </Box>
            )}

            {/* ScrollExpandMedia Component */}
            <ScrollExpandMedia
                mediaType="image"
                mediaSrc={land.image}
                bgImageSrc={land.image}
                title={getContent(land.name)}
                landType={land.type}
                scrollToExpand="Scroll to Explore ↓"
                textBlend={true}
            >
                {/* Content Section with proper alignment */}
                <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6 } }}>
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                    <Grid container spacing={{ xs: 4, md: 6, lg: 8 }}>
                        {/* Main Content - Left Column */}
                        <Grid item xs={12} lg={8}>
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: { xs: 4, sm: 5, md: 6, lg: 8 }, 
                                    borderRadius: { xs: 3, md: 4 }, 
                                    bgcolor: '#fff',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
                                }}
                            >
                                {/* Title Section */}
                                <Box sx={{ mb: { xs: 4, md: 6 } }}>
                                    <Chip
                                        label={land.type.toUpperCase()}
                                        sx={{
                                            bgcolor: tinaiStyle.accent,
                                            color: '#fff',
                                            fontWeight: 800,
                                            letterSpacing: 3,
                                            fontSize: '0.85rem',
                                            px: 2,
                                            py: 2.5,
                                            height: 'auto',
                                            mb: 3,
                                            borderRadius: 2
                                        }}
                                    />
                                    <Typography 
                                        variant="h2" 
                                        sx={{
                                            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
                                            fontWeight: 900,
                                            color: '#000',
                                            mb: 3,
                                            fontFamily: '"Playfair Display", serif',
                                            lineHeight: 1.15,
                                            letterSpacing: '-0.02em'
                                        }}
                                    >
                                        The Essence of {land.type}
                                    </Typography>
                                    <Box 
                                        sx={{ 
                                            width: 80, 
                                            height: 4, 
                                            bgcolor: tinaiStyle.accent,
                                            borderRadius: 2
                                        }} 
                                    />
                                </Box>

                                {/* Description */}
                                <Typography 
                                    variant="body1" 
                                    sx={{
                                        fontSize: { xs: '1.1rem', md: '1.25rem', lg: '1.35rem' },
                                        lineHeight: { xs: 1.8, md: 2 },
                                        color: '#2d3748',
                                        mb: { xs: 6, md: 8 },
                                        letterSpacing: '0.01em',
                                        fontWeight: 400
                                    }}
                                >
                                    {getContent(land.description)}
                                </Typography>

                                {/* Poetry Section */}
                                {land.poetry && land.poetry.length > 0 && (
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Box sx={{
                                            my: { xs: 6, md: 8 },
                                            p: { xs: 4, md: 6 },
                                            bgcolor: `${tinaiStyle.accent}05`,
                                            borderRadius: 3,
                                            borderLeft: `6px solid ${tinaiStyle.accent}`,
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <Typography sx={{
                                                fontSize: '8rem',
                                                position: 'absolute',
                                                top: -20,
                                                left: 20,
                                                color: tinaiStyle.accent,
                                                opacity: 0.08,
                                                fontFamily: 'serif',
                                                lineHeight: 1,
                                                fontWeight: 700
                                            }}>
                                                &ldquo;
                                            </Typography>
                                            {land.poetry.map((line, idx) => (
                                                <Typography
                                                    key={idx}
                                                    variant="h5"
                                                    sx={{
                                                        fontFamily: '"Playfair Display", serif',
                                                        fontStyle: 'italic',
                                                        color: '#1a202c',
                                                        mb: 2,
                                                        lineHeight: 1.7,
                                                        position: 'relative',
                                                        zIndex: 1,
                                                        fontSize: { xs: '1.3rem', md: '1.5rem' }
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: line }}
                                                />
                                            ))}
                                            <Typography variant="caption" sx={{
                                                display: 'block',
                                                mt: 4,
                                                color: tinaiStyle.accent,
                                                letterSpacing: 3,
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                fontSize: '0.85rem'
                                            }}>
                                                Classical Tamil Verse
                                            </Typography>
                                        </Box>
                                    </motion.div>
                                )}

                                <Divider sx={{ my: { xs: 6, md: 8 }, borderColor: '#e2e8f0' }} />

                                {/* Comments Section */}
                                <Box sx={{ mt: { xs: 4, md: 6 } }}>
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            fontWeight: 800, 
                                            mb: 4,
                                            fontSize: { xs: '1.5rem', md: '1.75rem' },
                                            color: '#1a202c'
                                        }}
                                    >
                                        Community Thoughts
                                    </Typography>
                                    <Comments user={user} relatedType="Land" relatedId={land._id} />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Sidebar Attributes - Right Column */}
                        <Grid item xs={12} lg={4}>
                            <Box sx={{ position: { lg: 'sticky' }, top: 120 }}>
                                <Paper
                                    component={motion.div}
                                    whileHover={{ 
                                        boxShadow: `0 12px 40px ${tinaiStyle.accent}25`,
                                        y: -6
                                    }}
                                    elevation={0}
                                    sx={{
                                        p: { xs: 4, md: 5 },
                                        borderRadius: { xs: 3, md: 4 },
                                        border: `2px solid ${tinaiStyle.accent}`,
                                        bgcolor: '#fff',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Typography 
                                        variant="overline" 
                                        sx={{ 
                                            color: tinaiStyle.accent, 
                                            letterSpacing: 3, 
                                            fontWeight: 900, 
                                            mb: 4, 
                                            display: 'block',
                                            fontSize: '1rem',
                                            lineHeight: 1
                                        }}
                                    >
                                        Cultural Identifiers
                                    </Typography>
                                    
                                    <AttributeCard
                                        label="Deity"
                                        items={land.gods}
                                        delay={0.1}
                                        tinaiColor={tinaiStyle.accent}
                                    />
                                    <AttributeCard
                                        label="People"
                                        items={land.people}
                                        delay={0.2}
                                        tinaiColor={tinaiStyle.accent}
                                    />
                                    <Divider sx={{ my: 4, borderColor: '#e2e8f0' }} />
                                    <AttributeCard
                                        label="Flora"
                                        items={land.flora}
                                        delay={0.3}
                                        tinaiColor={tinaiStyle.accent}
                                    />
                                    <AttributeCard
                                        label="Fauna"
                                        items={land.fauna}
                                        delay={0.4}
                                        tinaiColor={tinaiStyle.accent}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                    </motion.div>
                </Container>
            </ScrollExpandMedia>
        </Box>
    );
}
