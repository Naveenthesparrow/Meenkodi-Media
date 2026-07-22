import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MediaUpload from "../common/MediaUpload";
import OptimizedImage from "../common/OptimizedImage";
import { useBilingualContent } from "../../utils/bilingualContent";
import API_BASE_URL from "../../utils/api";
import { useTranslation } from "react-i18next";

const TINAI = {
  kurinji: {
    accent: "#5B34A8",
    paper: "#F4EEFF",
    label: "Mountains & Peaks",
    season: "Cold Season",
    flower: "Kurinji",
    bird: "Kurinji Bird",
  },
  mullai: {
    accent: "#1F7A3A",
    paper: "#EEF8F1",
    label: "Forests & Pastures",
    season: "Rainy Season",
    flower: "Mullai",
    bird: "Peacock",
  },
  marutham: {
    accent: "#537C16",
    paper: "#F3F9E8",
    label: "Fertile Plains",
    season: "All Seasons",
    flower: "Marutham",
    bird: "Heron",
  },
  neithal: {
    accent: "#0E6F9E",
    paper: "#EAF6FC",
    label: "Coasts & Seas",
    season: "Evening",
    flower: "Neytal",
    bird: "Sea Gull",
  },
  palai: {
    accent: "#9A4C0C",
    paper: "#FFF5EA",
    label: "Arid Wastelands",
    season: "Summer",
    flower: "Palai",
    bird: "Parrot",
  },
};

export default function LandDetailExpanded({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const { t: tr } = useTranslation();

  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [editLanguage, setEditLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: { en: "", ta: "" },
    type: "",
    description: { en: "", ta: "" },
    gods: "",
    people: "",
    flora: "",
    fauna: "",
    poetry: "",
    image: "",
    contentSections: [],
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/lands/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(tr("land.notFound", "Land not found"));
        return r.json();
      })
      .then((d) => {
        setLand(d);
        setForm({
          name: d.name || { en: "", ta: "" },
          type: d.type || "",
          description: d.description || { en: "", ta: "" },
          gods: (d.gods || []).join(", "),
          people: (d.people || []).join(", "),
          flora: (d.flora || []).join(", "),
          fauna: (d.fauna || []).join(", "),
          poetry: (d.poetry || []).join("\n"),
          image: d.image || "",
          contentSections: (d.contentSections || []).map((section, index) => ({
            id: `${Date.now()}-${index}-${Math.random()}`,
            subtitle_en: section.subtitle?.en || "",
            subtitle_ta: section.subtitle?.ta || "",
            content_en: section.content?.en || "",
            content_ta: section.content?.ta || "",
            imageUrl: section.imageUrl || "",
            imageLink: section.imageLink || "",
            videoUrl: section.videoUrl || "",
            videoTitle_en: section.videoTitle?.en || "",
            videoTitle_ta: section.videoTitle?.ta || "",
            videoDescription_en: section.videoDescription?.en || "",
            videoDescription_ta: section.videoDescription?.ta || "",
          })),
        });
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const split = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
      const body = {
        ...form,
        gods: split(form.gods),
        people: split(form.people),
        flora: split(form.flora),
        fauna: split(form.fauna),
        poetry: form.poetry.split("\n").map((x) => x.trim()).filter(Boolean),
        contentSections: (form.contentSections || []).map((section) => ({
          subtitle: { en: section.subtitle_en || "", ta: section.subtitle_ta || "" },
          content: { en: section.content_en || "", ta: section.content_ta || "" },
          imageUrl: section.imageUrl || "",
          imageLink: section.imageLink || "",
          videoUrl: section.videoUrl || "",
          videoTitle: { en: section.videoTitle_en || "", ta: section.videoTitle_ta || "" },
          videoDescription: {
            en: section.videoDescription_en || "",
            ta: section.videoDescription_ta || "",
          },
        })),
      };

      const r = await fetch(`${API_BASE_URL}/api/lands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!r.ok) throw new Error(tr("land.saveFailed", "Save failed"));
      setLand(await r.json());
      setEditMode(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(tr("land.deleteConfirm", "Delete this land entry?"))) return;
    try {
      await fetch(`${API_BASE_URL}/api/lands/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  const addContentSection = () => {
    setForm((prev) => ({
      ...prev,
      contentSections: [
        ...(prev.contentSections || []),
        {
          id: `${Date.now()}-${Math.random()}`,
          subtitle_en: "",
          subtitle_ta: "",
          content_en: "",
          content_ta: "",
          imageUrl: "",
          imageLink: "",
          videoUrl: "",
          videoTitle_en: "",
          videoTitle_ta: "",
          videoDescription_en: "",
          videoDescription_ta: "",
        },
      ],
    }));
  };

  const removeContentSection = (idToRemove) => {
    setForm((prev) => ({
      ...prev,
      contentSections: (prev.contentSections || []).filter((section) => section.id !== idToRemove),
    }));
  };

  const updateContentSection = (id, field, value) => {
    setForm((prev) => ({
      ...prev,
      contentSections: (prev.contentSections || []).map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      ),
    }));
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "80vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !land) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error || tr("land.notFound", "Land not found")}</Alert>
        <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          {tr("actions.back", "Back")}
        </Button>
      </Container>
    );
  }

  const t = TINAI[(land.type || "").toLowerCase()] || TINAI.kurinji;
  const name = getContent(land.name) || land.type || "Tinai";
  const description = getContent(land.description) || "";

  const descriptionParagraphs = description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const gods = land.gods || [];
  const people = land.people || [];
  const flora = land.flora || [];
  const fauna = land.fauna || [];
  const poetry = land.poetry || [];
  const filteredPoetry = poetry.filter(
    (line) => !line.includes("மூடுபனிக் குன்றுகளில் முரசும் இணையும் காதலும்.")
  );

  const editDialog = (
    <Dialog
      open={editMode}
      onClose={() => setEditMode(false)}
      maxWidth="md"
      fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 0, border: "3px solid #000", maxHeight: "90vh" } }}
    >
      <DialogTitle sx={{ bgcolor: "#8B0000", color: "#fff", textAlign: "center", fontWeight: 700 }}>
        {tr("land.edit.title", "Edit Land")} — {name}
      </DialogTitle>

      <DialogContent sx={{ p: 3, overflow: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3, mt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: "#333", fontSize: "0.9rem" }}>
            {tr("research.selectLanguageToEdit", "Select Language to Edit:")}
          </Typography>
          <ToggleButtonGroup
            value={editLanguage}
            exclusive
            onChange={(e, v) => v && setEditLanguage(v)}
            sx={{
              "& .MuiToggleButton-root": {
                px: 3,
                py: 1,
                border: "1px solid #8B0000",
                color: "#8B0000",
                fontWeight: 600,
                "&.Mui-selected": {
                  bgcolor: "#8B0000",
                  color: "#fff",
                  "&:hover": { bgcolor: "#6B0000" },
                },
              },
            }}
          >
            <ToggleButton value="en">{tr("language.english", "English").toUpperCase()}</ToggleButton>
            <ToggleButton value="ta">{tr("language.tamil", "Tamil")}</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <TextField
          label={editLanguage === "en" ? tr("land.edit.nameEn", "Name (English)") : tr("land.edit.nameTa", "Name (Tamil)")}
          fullWidth
          sx={{ mb: 2 }}
          value={editLanguage === "en" ? form.name.en : form.name.ta}
          onChange={(e) => setForm({ ...form, name: { ...form.name, [editLanguage]: e.target.value } })}
        />

        <TextField
          label={editLanguage === "en" ? tr("land.edit.descriptionEn", "Description (English)") : tr("land.edit.descriptionTa", "Description (Tamil)")}
          fullWidth
          multiline
          rows={5}
          sx={{ mb: 2 }}
          value={editLanguage === "en" ? form.description.en : form.description.ta}
          onChange={(e) =>
            setForm({ ...form, description: { ...form.description, [editLanguage]: e.target.value } })
          }
        />

        <TextField label={tr("land.edit.gods", "Gods (comma separated)")} fullWidth sx={{ mb: 2 }} value={form.gods} onChange={(e) => setForm({ ...form, gods: e.target.value })} />
        <TextField label={tr("land.edit.people", "People (comma separated)")} fullWidth sx={{ mb: 2 }} value={form.people} onChange={(e) => setForm({ ...form, people: e.target.value })} />
        <TextField label={tr("land.edit.flora", "Flora (comma separated)")} fullWidth sx={{ mb: 2 }} value={form.flora} onChange={(e) => setForm({ ...form, flora: e.target.value })} />
        <TextField label={tr("land.edit.fauna", "Fauna (comma separated)")} fullWidth sx={{ mb: 2 }} value={form.fauna} onChange={(e) => setForm({ ...form, fauna: e.target.value })} />
        <TextField
          label={tr("land.edit.poetry", "Poetry (one verse per line)")}
          fullWidth
          multiline
          rows={5}
          sx={{ mb: 2 }}
          value={form.poetry}
          onChange={(e) => setForm({ ...form, poetry: e.target.value })}
        />

        <MediaUpload
          onImageChange={(url) => setForm({ ...form, image: url })}
          currentImage={form.image}
          label={tr("land.edit.uploadPhoto", "Upload Photo")}
          showInputsOnly={false}
        />

        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: 0.5, mb: 0 }}
          >
            {tr("land.edit.additionalSections", "Additional Content Sections")}
          </Typography>

          <Button
            onClick={addContentSection}
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{
              color: "#000",
              borderColor: "#000",
              background: "#fff",
              "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
              textTransform: "uppercase",
              fontWeight: 700,
              fontSize: "1rem",
              borderRadius: 0,
              height: 42,
              minWidth: 230,
              boxShadow: "none",
              mt: 2,
              mb: 2,
              alignSelf: "flex-start",
            }}
          >
            {tr("land.edit.addContentSection", "Add Content Section")}
          </Button>

          <Box sx={{ borderBottom: "2px solid #000", width: "100%", mt: 0, mb: 2 }} />

          {(form.contentSections || []).map((section, index) => (
            <Box
              key={section.id || `land-section-${index}`}
              sx={{ mb: 3, p: 2, border: "1px solid #000", position: "relative" }}
            >
              <TextField
                label={tr("land.edit.subtitleEn", "Subtitle (EN)")}
                value={section.subtitle_en || ""}
                onChange={(e) => updateContentSection(section.id, "subtitle_en", e.target.value)}
                fullWidth
                sx={{ mb: 1 }}
                variant="standard"
              />
              <TextField
                label={tr("land.edit.subtitleTa", "Subtitle (TA)")}
                value={section.subtitle_ta || ""}
                onChange={(e) => updateContentSection(section.id, "subtitle_ta", e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                variant="standard"
              />

              <TextField
                label={tr("land.edit.contentEn", "Content (EN)")}
                value={section.content_en || ""}
                onChange={(e) => updateContentSection(section.id, "content_en", e.target.value)}
                fullWidth
                multiline
                rows={3}
                variant="standard"
                sx={{ mb: 1 }}
              />
              <TextField
                label={tr("land.edit.contentTa", "Content (TA)")}
                value={section.content_ta || ""}
                onChange={(e) => updateContentSection(section.id, "content_ta", e.target.value)}
                fullWidth
                multiline
                rows={3}
                variant="standard"
                sx={{ mb: 2 }}
              />

              <TextField
                label={tr("land.edit.imageUrl", "Image URL")}
                value={section.imageUrl || ""}
                onChange={(e) => updateContentSection(section.id, "imageUrl", e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                variant="standard"
                placeholder={tr("land.edit.imageUrlPlaceholder", "Enter full image URL")}
              />

              <TextField
                label={tr("land.edit.videoUrl", "Video URL")}
                value={section.videoUrl || ""}
                onChange={(e) => updateContentSection(section.id, "videoUrl", e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                variant="standard"
                placeholder={tr("land.edit.videoUrlPlaceholder", "Enter full YouTube video URL")}
              />

              <TextField
                label={tr("land.edit.videoTitleEn", "Video Title (EN)")}
                value={section.videoTitle_en || ""}
                onChange={(e) => updateContentSection(section.id, "videoTitle_en", e.target.value)}
                fullWidth
                sx={{ mb: 1 }}
                variant="standard"
              />
              <TextField
                label={tr("land.edit.videoTitleTa", "Video Title (TA)")}
                value={section.videoTitle_ta || ""}
                onChange={(e) => updateContentSection(section.id, "videoTitle_ta", e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                variant="standard"
              />

              <IconButton
                onClick={() => removeContentSection(section.id)}
                sx={{ position: "absolute", top: 0, right: 0, color: "#000" }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between", bgcolor: "#f0f0f0" }}>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
          {tr("actions.delete", "Delete")}
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={() => setEditMode(false)} sx={{ color: "#000" }}>
            {tr("actions.cancel", "Cancel").toUpperCase()}
          </Button>
          <Button
            onClick={addContentSection}
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{
              color: "#000",
              borderColor: "#000",
              background: "#fff",
              "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
              textTransform: "uppercase",
              fontWeight: 700,
              fontSize: "1rem",
              borderRadius: 0,
              height: 42,
              minWidth: 190,
              boxShadow: "none",
            }}
          >
            {tr("land.edit.addSection", "Add Section")}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            sx={{
              bgcolor: "#8B0000",
              color: "#fff",
              "&:hover": { bgcolor: "#6B0000" },
              textTransform: "uppercase",
              fontSize: "1rem",
              borderRadius: 0,
              fontWeight: 700,
              height: 42,
              minWidth: 190,
              boxShadow: "none",
            }}
          >
            {saving ? tr("actions.saving", "Saving...") : tr("land.edit.updateDetails", "UPDATE DETAILS")}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );

  const renderList = (arr) => {
    if (!arr || arr.length === 0) return <Typography sx={{ color: "#888" }}>—</Typography>;
    return (
      <Stack spacing={0.8}>
        {arr.map((item, idx) => (
          <Typography key={`${item}-${idx}`} sx={{ color: "#2f2f2f", lineHeight: 1.55 }}>
            • {item}
          </Typography>
        ))}
      </Stack>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#6B4A2E",
        backgroundImage: `
          repeating-radial-gradient(circle at 18% 22%, rgba(245,224,190,0.10) 0 1px, transparent 1px 13px),
          repeating-radial-gradient(circle at 72% 68%, rgba(55,34,22,0.16) 0 1px, transparent 1px 15px),
          repeating-linear-gradient(24deg, rgba(46,28,18,0.22) 0 1px, transparent 1px 62px),
          repeating-linear-gradient(-33deg, rgba(255,228,196,0.06) 0 1px, transparent 1px 74px),
          radial-gradient(1200px 500px at 8% 6%, rgba(166, 113, 70, 0.35) 0%, transparent 60%),
          radial-gradient(1000px 520px at 90% 10%, rgba(120, 76, 48, 0.33) 0%, transparent 62%),
          radial-gradient(900px 420px at 25% 95%, rgba(88, 58, 36, 0.30) 0%, transparent 65%),
          linear-gradient(180deg, #8A5C3B 0%, #734C31 34%, #5B3E28 68%, #4A3323 100%)
        `,
      }}
    >
      {editDialog}

      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          bgcolor: "rgba(78,52,34,0.88)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(255,224,190,0.18)",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 1.2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: "#F4E6D2" }}>
            <ArrowBackIcon />
          </IconButton>

          <Typography sx={{ fontWeight: 800, letterSpacing: "0.16em", fontSize: "0.72rem", color: "#F4E6D2" }}>
            {tr("land.header.fiveTinai", "FIVE TINAI")}
          </Typography>

          {user?.role === "admin" ? (
            <IconButton onClick={() => setEditMode(true)} sx={{ color: "#F4E6D2" }}>
              <EditIcon />
            </IconButton>
          ) : (
            <Box sx={{ width: 40 }} />
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={0} sx={{ borderRadius: 0, border: "1px solid rgba(0,0,0,0.15)", overflow: "hidden", bgcolor: "#fff", mb: 3 }}>
          {land.image ? (
            <OptimizedImage
              src={land.image}
              alt={name}
              priority
              rootMargin="600px"
              sx={{
                width: "100%",
                height: { xs: 360, sm: 500, md: 680 },
                objectFit: "cover",
                display: "block",
              }}
              skeletonSx={{ bgcolor: `${t.accent}22` }}
            />
          ) : (
            <Box sx={{ height: { xs: 360, sm: 500, md: 680 }, display: "grid", placeItems: "center", bgcolor: t.paper }}>
              <Typography sx={{ color: t.accent, fontWeight: 700 }}>{tr("common.noImage", "No Image")}</Typography>
            </Box>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 0,
            borderLeft: `8px solid ${t.accent}`,
            border: "1px solid rgba(0,0,0,0.12)",
            bgcolor: "#FFFFFF",
            mb: 4,
          }}
        >
          <Typography sx={{ fontSize: "0.74rem", letterSpacing: "0.22em", fontWeight: 800, color: t.accent, mb: 1.3 }}>
            {t.label.toUpperCase()}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 800,
              fontSize: { xs: "2.4rem", md: "4rem" },
              lineHeight: 1,
              color: "#1E1A16",
            }}
          >
            {name}
          </Typography>
        </Paper>

        <Grid container spacing={3.5}>
          <Grid item xs={12} md={4}>
            <Stack spacing={3} sx={{ position: { md: "sticky" }, top: { md: 84 } }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.2,
                  borderRadius: 0,
                  border: `1px solid ${t.accent}44`,
                  background: `linear-gradient(160deg, ${t.paper} 0%, #ffffff 45%, #f8f8f8 100%)`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -38,
                    right: -38,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${t.accent}22 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    bottom: -25,
                    left: -18,
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${t.accent}18 0%, transparent 75%)`,
                    pointerEvents: "none",
                  }}
                />

                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.4 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: "0.76rem", letterSpacing: "0.18em", color: t.accent }}>
                      {tr("land.profile.title", "LAND PROFILE")}
                    </Typography>
                    <Box sx={{ px: 1.1, py: 0.35, border: `1px solid ${t.accent}55`, bgcolor: "#fff" }}>
                      <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.12em", color: t.accent }}>
                        {tr("land.profile.archive", "ARCHIVE")}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 1.4,
                      mb: 1.6,
                      border: `1px solid ${t.accent}33`,
                      bgcolor: "#fff",
                      boxShadow: `inset 0 0 0 1px ${t.accent}12`,
                    }}
                  >
                    <Typography sx={{ fontSize: "0.62rem", color: "#6f6f6f", letterSpacing: "0.12em", fontWeight: 700, mb: 0.45 }}>
                      {tr("land.profile.archiveType", "ARCHIVE TYPE")}
                    </Typography>
                    <Typography sx={{ fontSize: "1.06rem", fontWeight: 900, color: "#1d1d1d", letterSpacing: "0.08em" }}>
                      {(land.type || "").toUpperCase()}
                    </Typography>
                  </Box>

                  <Grid container spacing={1.1}>
                    {[
                      [tr("land.profile.season", "SEASON"), t.season],
                      [tr("land.profile.flower", "FLOWER"), t.flower],
                      [tr("land.profile.bird", "BIRD"), t.bird],
                    ].map(([k, v]) => (
                      <Grid item xs={12} key={k}>
                        <Box
                          sx={{
                            p: 1.15,
                            border: "1px solid rgba(0,0,0,0.08)",
                            bgcolor: "#ffffffd9",
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            gap: 1,
                            alignItems: "start",
                          }}
                        >
                          <Box sx={{ width: 8, height: 8, mt: 0.5, borderRadius: "50%", bgcolor: t.accent, boxShadow: `0 0 10px ${t.accent}66` }} />
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: t.accent, fontSize: "0.63rem", letterSpacing: "0.12em", mb: 0.25 }}>
                              {k}
                            </Typography>
                            <Typography sx={{ fontWeight: 800, color: "#2a2a2a", fontSize: "1rem", lineHeight: 1.35 }}>
                              {v}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Paper>
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 0, border: "1px solid rgba(0,0,0,0.15)", bgcolor: "#fff" }}>
                <Typography sx={{ fontWeight: 800, letterSpacing: "0.16em", fontSize: "0.72rem", color: t.accent, mb: 1.3 }}>
                  {tr("land.sections.historicalChronicle", "HISTORICAL CHRONICLE")}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {descriptionParagraphs.length > 0 ? (
                  descriptionParagraphs.map((para, idx) => (
                    <Typography
                      key={idx}
                      sx={{
                        color: "#2E2A26",
                        lineHeight: 2,
                        fontSize: "1.03rem",
                        mb: idx === descriptionParagraphs.length - 1 ? 0 : 2,
                        textAlign: "justify",
                        ...(idx === 0
                          ? {
                              "&::first-letter": {
                                fontSize: "2.6rem",
                                lineHeight: 0.9,
                                float: "left",
                                pr: 0.6,
                                pt: 0.2,
                                fontFamily: '"Playfair Display", serif',
                                color: t.accent,
                                fontWeight: 700,
                              },
                            }
                          : {}),
                      }}
                    >
                      {para}
                    </Typography>
                  ))
                ) : (
                  <Typography sx={{ color: "#888" }}>{tr("land.sections.noDescription", "No description available.")}</Typography>
                )}
              </Paper>

              <Grid container spacing={2.5}>
                {[
                  [tr("land.sections.presidingDeity", "Presiding Deity"), gods],
                  [tr("land.sections.people", "People"), people],
                  [tr("land.sections.flora", "Flora"), flora],
                  [tr("land.sections.fauna", "Fauna"), fauna],
                ].map(([title, values]) => (
                  <Grid item xs={12} sm={6} key={title}>
                    <Paper elevation={0} sx={{ p: 2.2, borderRadius: 0, border: "1px solid rgba(0,0,0,0.15)", bgcolor: "#fff", height: "100%" }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.8rem", letterSpacing: "0.12em", color: t.accent, mb: 1 }}>
                        {title}
                      </Typography>
                      {renderList(values)}
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {filteredPoetry.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, md: 4 },
                    borderRadius: 0,
                    border: "1px solid rgba(0,0,0,0.15)",
                    background: `linear-gradient(180deg, ${t.paper} 0%, #fff 100%)`,
                  }}
                >
                  <Typography sx={{ fontWeight: 800, letterSpacing: "0.16em", fontSize: "0.72rem", color: t.accent, mb: 1.3 }}>
                    {tr("land.sections.poeticMemory", "POETIC MEMORY")}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={1.2}>
                    {filteredPoetry.map((line, idx) => (
                      <Typography
                        key={idx}
                        component="div"
                        sx={{
                          color: "#3C342D",
                          fontStyle: "italic",
                          fontSize: { xs: "1.02rem", md: "1.12rem" },
                          lineHeight: 1.9,
                          fontFamily: '"Playfair Display", Georgia, serif',
                        }}
                        dangerouslySetInnerHTML={{ __html: line }}
                      />
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
