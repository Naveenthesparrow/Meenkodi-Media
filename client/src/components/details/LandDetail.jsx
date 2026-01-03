
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
    InputAdornment,
    Divider
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import MediaUpload from "../common/MediaUpload";
import Comments from "../Comments";
import { useBilingualContent } from "../../utils/bilingualContent";
import API_BASE_URL from "../../utils/api";

// --- THEMATIC STYLES ---
const TINAI_STYLES = {
    kurinji: {
        color: '#8B5CF6', // Violet
        gradient: 'linear-gradient(135deg,rgba(139,92,246,0.95),rgba(99,102,241,0.95))',
        bgGradient: 'linear-gradient(to bottom, #1a1025, #fff 30%)',
        accent: '#7C3AED'
    },
    mullai: {
        color: '#22C55E', // Green
        gradient: 'linear-gradient(135deg,rgba(34,197,94,0.95),rgba(21,128,61,0.95))',
        bgGradient: 'linear-gradient(to bottom, #0f291a, #fff 30%)',
        accent: '#15803D'
    },
    marutham: {
        color: '#84CC16', // Lime/Green
        gradient: 'linear-gradient(135deg,rgba(132,204,22,0.95),rgba(77,124,15,0.95))',
        bgGradient: 'linear-gradient(to bottom, #1a2505, #fff 30%)',
        accent: '#4D7C0F'
    },
    neithal: {
        color: '#38BDF8', // Blue
        gradient: 'linear-gradient(135deg,rgba(56,189,248,0.95),rgba(14,165,233,0.95))',
        bgGradient: 'linear-gradient(to bottom, #082f49, #fff 30%)',
        accent: '#0284C7'
    },
    palai: {
        color: '#F59E0B', // Amber
        gradient: 'linear-gradient(135deg,rgba(245,158,11,0.95),rgba(234,88,12,0.95))',
        bgGradient: 'linear-gradient(to bottom, #451a03, #fff 30%)',
        accent: '#EA580C'
    }
};

const SectionHeading = ({ children }) => (
    <Typography
        variant="h6"
        sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontSize: '0.85rem',
            color: '#000',
            mb: 2,
            borderBottom: `2px solid #000`,
            pb: 1,
            display: 'inline-block'
        }}
    >
        {children}
    </Typography>
);

const AttributeCard = ({ label, items, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay }}
    >
        <Box sx={{ mb: 4 }}>
            <SectionHeading>{label}</SectionHeading>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {items && items.length > 0 ? (
                    items.map((item, idx) => (
                        <Chip
                            key={idx}
                            label={item}
                            sx={{
                                bgcolor: '#fff',
                                color: '#000',
                                fontWeight: 600,
                                borderRadius: '8px',
                                border: `1px solid #e0e0e0`,
                                '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                        />
                    ))
                ) : (
                    <Typography variant="body2" sx={{ color: '#aaa', fontStyle: 'italic' }}>
                        No records found
                    </Typography>
                )}
            </Box>
        </Box>
    </motion.div>
);

export default function LandDetail({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const getContent = useBilingualContent();
    const [land, setLand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit Mode State
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

    // --- PUBLIC PREMIUM VIEW ---
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
            {/* HERO SECTION */}
            <Box sx={{ height: '85vh', position: 'relative', overflow: 'hidden' }}>
                <Box
                    component={motion.div}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${land.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)`
                }} />

                {/* Back Button */}
                <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/', { state: { scrollTo: `land-${land.type.toLowerCase()}` } })}
                        sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                        variant="outlined"
                    >
                        Back
                    </Button>
                </Box>
                {/* Admin Edit Trigger */}
                {user?.role === 'admin' && (
                    <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
                        <IconButton
                            onClick={() => setEditMode(true)}
                            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Box>
                )}

                {/* Hero Content */}
                <Container maxWidth="xl" sx={{ height: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', pb: 12 }}>
                    <Box sx={{ maxWidth: 900 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <Chip
                                label={land.type.toUpperCase()}
                                sx={{
                                    bgcolor: tinaiStyle.accent,
                                    color: '#fff',
                                    fontWeight: 800,
                                    letterSpacing: 2,
                                    mb: 3,
                                    border: '1px solid rgba(255,255,255,0.3)'
                                }}
                            />
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '3rem', md: '5rem' },
                                    fontWeight: 800,
                                    color: '#fff',
                                    mb: 2,
                                    textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                    fontFamily: '"Playfair Display", serif'
                                }}
                            >
                                {getContent(land.name)}
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'rgba(255,255,255,0.9)',
                                    fontWeight: 300,
                                    maxWidth: 600,
                                    lineHeight: 1.6,
                                    fontSize: { xs: '1.1rem', md: '1.4rem' }
                                }}
                            >
                                {getContent(land.description)}
                            </Typography>
                        </motion.div>
                    </Box>
                </Container>
            </Box>

            {/* CONTENT SECTION */}
            {/* CONTENT SECTION */}
            <Container maxWidth="xl" sx={{ mt: 6, mb: 12 }}>
                <Grid container spacing={6}>
                    {/* Left Column: Narrative */}
                    <Grid item xs={12} md={8}>
                        <Paper
                            component={motion.div}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            elevation={0}
                            sx={{
                                p: { xs: 4, md: 6 },
                                borderRadius: 4,
                                bgcolor: '#fff',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                                border: '1px solid #e0e0e0'
                            }}
                        >
                            <Box>
                                <Typography variant="h2" sx={{
                                    fontSize: { xs: '2.5rem', md: '3rem' },
                                    fontWeight: 900,
                                    color: '#000',
                                    mb: 4,
                                    fontFamily: '"Playfair Display", serif'
                                }}>
                                    The Essence of {land.type}
                                </Typography>
                                <Typography variant="body1" sx={{
                                    fontSize: '1.35rem',
                                    lineHeight: 1.9,
                                    color: '#333',
                                    mb: 6,
                                    letterSpacing: '0.01em'
                                }}>
                                    {getContent(land.description)}
                                </Typography>

                                {land.poetry && land.poetry.length > 0 && (
                                    <Box sx={{
                                        my: 6,
                                        textAlign: 'center',
                                        position: 'relative',
                                        py: 4,
                                        bgcolor: 'transparent',
                                        borderLeft: 'none',
                                        borderRadius: 0
                                    }}>


                                        <Typography sx={{
                                            fontSize: '4rem',
                                            position: 'absolute',
                                            top: -20,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            color: '#e0e0e0',
                                            lineHeight: 1,
                                            fontFamily: 'serif'
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
                                                    color: '#2d3748',
                                                    mb: 1.5,
                                                    lineHeight: 1.6,
                                                    position: 'relative',
                                                    zIndex: 1
                                                }}
                                                dangerouslySetInnerHTML={{ __html: line }}
                                            />
                                        ))}
                                        <Typography variant="caption" sx={{
                                            display: 'block',
                                            mt: 2,
                                            color: '#000',
                                            letterSpacing: 2,
                                            fontWeight: 700,
                                            textTransform: 'uppercase'
                                        }}>
                                            Classical Verse
                                        </Typography>
                                    </Box>
                                )}

                                <Divider sx={{ my: 5, borderColor: '#eee' }} />

                                {/* Comments Section */}
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Community Thoughts</Typography>
                                    <Comments user={user} relatedType="Land" relatedId={land._id} />
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right Column: Attributes */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ position: 'sticky', top: 40, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Stats Card */}
                            <Paper
                                component={motion.div}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.7 }}
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: '24px',
                                    bgcolor: '#fff',
                                    boxShadow: 'none',
                                    border: `1px solid #000`
                                }}
                            >
                                <Typography variant="overline" sx={{ color: '#000', letterSpacing: 2, fontWeight: 800, mb: 3, display: 'block', fontSize: '0.9rem' }}>
                                    Cultural Identifiers
                                </Typography>
                                <AttributeCard
                                    label={land.type === 'Kurinji' ? "Deity: Murugan" : "Deity"}
                                    items={land.gods}
                                    delay={0.8}
                                />
                                <AttributeCard
                                    label="Sovereign Inhabitants"
                                    items={land.people}
                                    delay={0.9}
                                />
                                <Divider sx={{ my: 3, opacity: 0.5 }} />
                                <AttributeCard
                                    label="Native Flora"
                                    items={land.flora}
                                    delay={1.0}
                                />
                                <AttributeCard
                                    label="Native Fauna"
                                    items={land.fauna}
                                    delay={1.1}
                                />
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
