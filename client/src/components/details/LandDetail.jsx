import React, { useEffect, useState, useRef } from "react";
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
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    useInView,
    AnimatePresence
} from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import MediaUpload from "../common/MediaUpload";
import Comments from "../Comments";
import { useBilingualContent } from "../../utils/bilingualContent";
import API_BASE_URL from "../../utils/api";

// ─── THEME MAP ────────────────────────────────────────────────────────────────
const TINAI = {
    kurinji:  { color: '#8B5CF6', glow: 'rgba(139,92,246,0.45)', dark: '#1a1025', accent: '#7C3AED',  gradient: 'linear-gradient(135deg,#8B5CF6,#6366F1)' },
    mullai:   { color: '#22C55E', glow: 'rgba(34,197,94,0.45)',  dark: '#0f291a', accent: '#15803D',  gradient: 'linear-gradient(135deg,#22C55E,#16A34A)' },
    marutham: { color: '#84CC16', glow: 'rgba(132,204,22,0.45)', dark: '#1a2505', accent: '#4D7C0F',  gradient: 'linear-gradient(135deg,#84CC16,#65A30D)' },
    neithal:  { color: '#38BDF8', glow: 'rgba(56,189,248,0.45)', dark: '#082f49', accent: '#0284C7',  gradient: 'linear-gradient(135deg,#38BDF8,#0EA5E9)' },
    palai:    { color: '#F59E0B', glow: 'rgba(245,158,11,0.45)', dark: '#451a03', accent: '#EA580C',  gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)' },
};

// ─── SPRING CONFIG ─────────────────────────────────────────────────────────────
const SPRING = { stiffness: 80, damping: 20, mass: 0.5 };

// ─── SCROLL-TRIGGERED FADE-UP ─────────────────────────────────────────────────
const FadeUp = ({ children, delay = 0, y = 40 }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
        >
            {children}
        </motion.div>
    );
};

// ─── ATTRIBUTE PILL ROW ────────────────────────────────────────────────────────
const PillRow = ({ label, items, color, delay = 0 }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    if (!items || items.length === 0) return null;
    return (
        <Box ref={ref} sx={{ mb: 3.5 }}>
            <Typography sx={{
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color,
                mb: 1.2
            }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {items.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.35, delay: delay + i * 0.06, ease: "backOut" }}
                        whileHover={{ scale: 1.08, y: -2 }}
                    >
                        <Box sx={{
                            px: 1.5, py: 0.5,
                            borderRadius: '100px',
                            border: `1.5px solid ${color}44`,
                            background: `${color}12`,
                            color: '#1a1a1a',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            cursor: 'default',
                            transition: 'all 0.2s',
                            '&:hover': { background: `${color}22`, borderColor: color }
                        }}>
                            {item}
                        </Box>
                    </motion.div>
                ))}
            </Box>
        </Box>
    );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LandDetail({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const getContent = useBilingualContent();

    const [land, setLand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: { en: "", ta: "" }, type: "",
        description: { en: "", ta: "" },
        gods: "", people: "", flora: "", fauna: "", poetry: "", image: ""
    });

    // ── Scroll-based hero parallax ──
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const rawY     = useTransform(scrollY, [0, 600], [0, 140]);
    const rawOp    = useTransform(scrollY, [0, 350], [1, 0]);
    const rawScale = useTransform(scrollY, [0, 600], [1, 1.12]);
    const heroY     = useSpring(rawY,     SPRING);
    const heroOp    = useSpring(rawOp,    SPRING);
    const heroScale = useSpring(rawScale, SPRING);
    const scrollProgress = useTransform(scrollY, [0, 200], [1, 0]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/lands/${id}`)
            .then(res => { if (!res.ok) throw new Error("Not found"); return res.json(); })
            .then(data => {
                setLand(data);
                setFormData({
                    name: data.name || { en: "", ta: "" },
                    type: data.type || "",
                    description: data.description || { en: "", ta: "" },
                    gods:    data.gods    ? data.gods.join(", ")    : "",
                    people:  data.people  ? data.people.join(", ")  : "",
                    flora:   data.flora   ? data.flora.join(", ")   : "",
                    fauna:   data.fauna   ? data.fauna.join(", ")   : "",
                    poetry:  data.poetry  ? data.poetry.join("\n")  : "",
                    image:   data.image   || ""
                });
                setLoading(false);
            })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [id]);

    const handleSave = async () => {
        setSubmitting(true);
        try {
            const updated = {
                ...formData,
                gods:   formData.gods.split(",").map(s=>s.trim()).filter(Boolean),
                people: formData.people.split(",").map(s=>s.trim()).filter(Boolean),
                flora:  formData.flora.split(",").map(s=>s.trim()).filter(Boolean),
                fauna:  formData.fauna.split(",").map(s=>s.trim()).filter(Boolean),
                poetry: formData.poetry.split("\n").map(s=>s.trim()).filter(Boolean),
            };
            const res = await fetch(`${API_BASE_URL}/api/lands/${id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                credentials: "include", body: JSON.stringify(updated),
            });
            if (!res.ok) throw new Error("Failed to update");
            setLand(await res.json());
            setEditMode(false);
        } catch (e) { setError(e.message); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this land entry?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/lands/${id}`, { method: "DELETE", credentials: "include" });
            if (!res.ok) throw new Error("Failed to delete");
            navigate("/");
        } catch (e) { setError(e.message); }
    };

    // ── Loading ──
    if (loading) return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#060606' }}>
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }}>
                <CircularProgress sx={{ color: '#D4AF37' }} size={40} thickness={2} />
            </motion.div>
        </Box>
    );
    if (error || !land) return (
        <Container sx={{ py: 10, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>{error || "Land not found"}</Alert>
            <Button variant="outlined" onClick={() => navigate('/')}>Home</Button>
        </Container>
    );

    const tinai = TINAI[land.type?.toLowerCase()] || TINAI.kurinji;
    const name  = getContent(land.name);
    const desc  = getContent(land.description);

    // ── Edit Mode ──
    if (editMode) return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">Edit {land.type}</Typography>
                    <IconButton onClick={() => setEditMode(false)}><CloseIcon /></IconButton>
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Name (EN)" value={formData.name.en} onChange={e => setFormData({...formData, name:{...formData.name,en:e.target.value}})}/></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Name (TA)" value={formData.name.ta} onChange={e => setFormData({...formData, name:{...formData.name,ta:e.target.value}})}/></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Description (EN)" multiline rows={5} value={formData.description.en} onChange={e => setFormData({...formData, description:{...formData.description,en:e.target.value}})}/></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Description (TA)" multiline rows={5} value={formData.description.ta} onChange={e => setFormData({...formData, description:{...formData.description,ta:e.target.value}})}/></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Gods" value={formData.gods} onChange={e => setFormData({...formData,gods:e.target.value})} helperText="comma-separated"/></Grid>
                    <Grid item xs={6}><TextField fullWidth label="People" value={formData.people} onChange={e => setFormData({...formData,people:e.target.value})} helperText="comma-separated"/></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Flora" value={formData.flora} onChange={e => setFormData({...formData,flora:e.target.value})} helperText="comma-separated"/></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Fauna" value={formData.fauna} onChange={e => setFormData({...formData,fauna:e.target.value})} helperText="comma-separated"/></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Poetry" multiline rows={6} value={formData.poetry} onChange={e => setFormData({...formData,poetry:e.target.value})}/><Box sx={{mt:2}}><MediaUpload onImageChange={url=>setFormData({...formData,image:url})} currentImage={formData.image} label="Hero Image" showInputsOnly/></Box></Grid>
                    <Grid item xs={12} sx={{display:'flex',gap:2,justifyContent:'flex-end'}}>
                        <Button variant="outlined" color="error" startIcon={<DeleteIcon/>} onClick={handleDelete}>Delete</Button>
                        <Button variant="contained" startIcon={<SaveIcon/>} onClick={handleSave} disabled={submitting}>{submitting?'Saving…':'Save'}</Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );

    // ── PUBLIC VIEW ──
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', fontFamily: '"Inter", sans-serif' }}>

            {/* ═══════════════════════════ HERO ═══════════════════════════ */}
            <Box
                ref={heroRef}
                sx={{ height: '100vh', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}
            >
                {/* Parallax image */}
                <motion.div style={{ y: heroY, scale: heroScale, willChange: 'transform', position: 'absolute', inset: 0 }}>
                    <Box sx={{
                        position: 'absolute', inset: '-10%',
                        backgroundImage: `url(${land.image})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        willChange: 'transform'
                    }} />
                </motion.div>

                {/* Cinematic gradient overlay */}
                <Box sx={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: `
                        linear-gradient(to top,  rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 100%),
                        linear-gradient(to right, ${tinai.dark}dd 0%, transparent 60%)
                    `
                }} />

                {/* Colour glow orb */}
                <Box sx={{
                    position: 'absolute', bottom: '-10%', left: '5%', zIndex: 1,
                    width: 500, height: 500, borderRadius: '50%',
                    background: `radial-gradient(circle, ${tinai.glow} 0%, transparent 70%)`,
                    filter: 'blur(40px)', pointerEvents: 'none'
                }} />

                {/* Back button */}
                <Box sx={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            startIcon={<ArrowBackIcon sx={{ fontSize: '1rem !important' }}/>}
                            onClick={() => navigate(-1)}
                            sx={{
                                color: '#fff', borderColor: 'rgba(255,255,255,0.25)',
                                backdropFilter: 'blur(16px)', background: 'rgba(0,0,0,0.25)',
                                borderRadius: '100px', px: 2.5, py: 1,
                                fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em',
                                transition: 'all 0.25s',
                                '&:hover': { background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.6)' }
                            }}
                            variant="outlined"
                        >
                            Back
                        </Button>
                    </motion.div>
                </Box>

                {/* Admin edit */}
                {user?.role === 'admin' && (
                    <Box sx={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} whileHover={{ scale: 1.1, rotate: 90 }}>
                            <IconButton onClick={() => setEditMode(true)} sx={{ color: '#fff', backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', '&:hover': { background: 'rgba(255,255,255,0.2)' } }}>
                                <EditIcon />
                            </IconButton>
                        </motion.div>
                    </Box>
                )}

                {/* Hero text */}
                <motion.div style={{ opacity: heroOp, willChange: 'opacity' }}>
                <Container maxWidth="xl" sx={{ height: '100%', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pb: { xs: 10, md: 14 } }}>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.8, py: 0.6, mb: 2.5, borderRadius: '100px', background: `${tinai.color}22`, border: `1px solid ${tinai.color}55`, backdropFilter: 'blur(8px)' }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: tinai.color, boxShadow: `0 0 8px ${tinai.color}` }} />
                            <Typography sx={{ color: tinai.color, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                                {land.type} · Tinai
                            </Typography>
                        </Box>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                        <Typography sx={{
                            fontSize: { xs: '3.5rem', sm: '5rem', md: '7rem', lg: '8rem' },
                            fontWeight: 900, color: '#fff', lineHeight: 0.95,
                            letterSpacing: '-0.03em',
                            fontFamily: '"Playfair Display", Georgia, serif',
                            textShadow: `0 0 60px ${tinai.glow}`, mb: 2.5
                        }}>
                            {name}
                        </Typography>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.85 }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: { xs: '1rem', md: '1.25rem' }, fontWeight: 300, maxWidth: 600, lineHeight: 1.65, letterSpacing: '0.01em' }}>
                            {desc.split('.')[0]}.
                        </Typography>
                    </motion.div>

                    {/* Scroll mouse hint */}
                    <motion.div style={{ opacity: scrollProgress }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 5 }}>
                            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                                <Box sx={{ width: 24, height: 38, borderRadius: '12px', border: '2px solid rgba(255,255,255,0.35)', display: 'flex', justifyContent: 'center', pt: 0.8 }}>
                                    <Box sx={{ width: 3, height: 8, borderRadius: 2, bgcolor: '#fff', opacity: 0.6 }} />
                                </Box>
                            </motion.div>
                            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                Scroll to explore
                            </Typography>
                        </Box>
                    </motion.div>

                </Container>
                </motion.div>
            </Box>

            {/* ═══════════════════ STICKY BAR ═════════════════════════════ */}
            <Box sx={{
                position: 'sticky', top: 0, zIndex: 50,
                backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.88)',
                borderBottom: '1px solid rgba(0,0,0,0.07)',
                px: { xs: 2, md: 6 }, py: 1.5, display: 'flex', alignItems: 'center', gap: 2
            }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: tinai.gradient, flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}>{name}</Typography>
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ color: '#999', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {land.type} Land
                </Typography>
            </Box>

            {/* ═══════════════════ BODY ════════════════════════════════════ */}
            <Container maxWidth="xl" sx={{ py: { xs: 8, md: 14 } }}>
                <Grid container spacing={{ xs: 6, lg: 10 }}>

                    {/* Left: Narrative */}
                    <Grid item xs={12} lg={7}>

                        <FadeUp delay={0.1}>
                            <Typography sx={{
                                fontSize: { xs: '1.55rem', md: '2rem', lg: '2.4rem' },
                                fontWeight: 700, lineHeight: 1.45, color: '#111', mb: 6,
                                fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em',
                                borderLeft: `4px solid ${tinai.color}`, pl: 3
                            }}>
                                {desc}
                            </Typography>
                        </FadeUp>

                        <FadeUp delay={0.2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 7 }}>
                                <Box sx={{ flex: 1, height: '1px', bgcolor: '#e5e5e5' }} />
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', color: '#bbb', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                    Classical Verse
                                </Typography>
                                <Box sx={{ flex: 1, height: '1px', bgcolor: '#e5e5e5' }} />
                            </Box>
                        </FadeUp>

                        {land.poetry && land.poetry.length > 0 && (
                            <FadeUp delay={0.25}>
                                <Box sx={{
                                    position: 'relative', p: { xs: 4, md: 6 }, borderRadius: '20px',
                                    background: `linear-gradient(135deg, ${tinai.dark}f0, ${tinai.dark}cc)`,
                                    overflow: 'hidden', mb: 8
                                }}>
                                    <Box sx={{ position: 'absolute', top: '-30%', right: '-10%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${tinai.glow} 0%, transparent 70%)`, filter: 'blur(30px)', pointerEvents: 'none' }} />
                                    <Typography sx={{ fontSize: '5rem', lineHeight: 0.6, mb: 2, color: `${tinai.color}55`, fontFamily: 'serif', position: 'relative', zIndex: 1 }}>"</Typography>
                                    {land.poetry.map((line, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                                            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: { xs: '1.05rem', md: '1.25rem' }, lineHeight: 1.75, color: 'rgba(255,255,255,0.9)', mb: 1, position: 'relative', zIndex: 1 }} dangerouslySetInnerHTML={{ __html: line }} />
                                        </motion.div>
                                    ))}
                                </Box>
                            </FadeUp>
                        )}

                        <FadeUp delay={0.1}>
                            <Comments user={user} relatedType="Land" relatedId={land._id} />
                        </FadeUp>
                    </Grid>

                    {/* Right: Attributes */}
                    <Grid item xs={12} lg={5}>
                        <Box sx={{ position: 'sticky', top: 80 }}>

                            <FadeUp delay={0.3}>
                                <Box sx={{ borderRadius: '24px', border: '1px solid rgba(0,0,0,0.07)', background: '#fff', boxShadow: '0 4px 40px rgba(0,0,0,0.06)', overflow: 'hidden', mb: 3 }}>
                                    {/* Header band */}
                                    <Box sx={{ p: 3.5, pb: 3, background: `linear-gradient(120deg, ${tinai.dark} 0%, ${tinai.dark}cc 100%)`, position: 'relative', overflow: 'hidden' }}>
                                        <Box sx={{ position: 'absolute', top: '-40%', right: '-20%', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${tinai.glow} 0%, transparent 70%)`, filter: 'blur(25px)' }} />
                                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', mb: 0.8 }}>
                                            {land.type} · Five Tinais
                                        </Typography>
                                        <Typography sx={{ color: '#fff', fontSize: '1.8rem', fontWeight: 900, fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
                                            {name}
                                        </Typography>
                                    </Box>
                                    {/* Pills */}
                                    <Box sx={{ p: 3.5 }}>
                                        <PillRow label="Deity"   items={land.gods}   color={tinai.color}  delay={0.1} />
                                        <PillRow label="People"  items={land.people} color={tinai.color}  delay={0.15} />
                                        <Box sx={{ my: 2.5, height: '1px', bgcolor: '#f0f0f0' }} />
                                        <PillRow label="Flora"   items={land.flora}  color={tinai.accent} delay={0.2} />
                                        <PillRow label="Fauna"   items={land.fauna}  color={tinai.accent} delay={0.25} />
                                    </Box>
                                </Box>
                            </FadeUp>

                            {land.image && (
                                <FadeUp delay={0.45}>
                                    <Box sx={{ borderRadius: '20px', overflow: 'hidden', aspectRatio: '16/9', position: 'relative' }}>
                                        <Box component="img" src={land.image} alt={name} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                        <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${tinai.dark}bb 0%, transparent 50%)` }} />
                                        <Box sx={{ position: 'absolute', bottom: 16, left: 20 }}>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                                                {land.type} Landscape
                                            </Typography>
                                        </Box>
                                    </Box>
                                </FadeUp>
                            )}

                        </Box>
                    </Grid>

                </Grid>
            </Container>
        </Box>
        </motion.div>
    );
}


