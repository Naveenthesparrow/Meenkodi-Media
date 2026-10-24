import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ImageUploadField from "../common/ImageUploadField";
import { fieldSx } from "../common/formStyles";
import OptimizedImage from "../common/OptimizedImage";
import { useBilingualContent } from "../../utils/bilingualContent";
import API_BASE_URL from "../../utils/api";
import { useTranslation } from "react-i18next";
import SEO from "../common/SEO";
import cldImg from "../../utils/cloudinaryImage";
import TinaiScene from "../lands/TinaiScene";
import { FACT_LABELS, TINAI_ORDER, TINAI_THEMES } from "../lands/tinaiData";

const cachedLandDetails = {};

const langTag = (txt) => (
  <Typography component="span" sx={{ display: "block", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.14em", color: "#9a6a2a", textTransform: "uppercase", mb: 0.5 }}>{txt}</Typography>
);
// One field edited in English and Tamil side by side (module level so inputs keep focus)
function Pair({ label, en, ta, onEn, onTa, multiline }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#5a1a1a", mb: 1 }}>{label}</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 1.5, md: 2.5 } }}>
        <Box>{langTag("English")}<TextField fullWidth value={en || ""} onChange={(e) => onEn(e.target.value)} multiline={multiline} minRows={multiline ? 4 : undefined} inputProps={{ lang: "en" }} sx={fieldSx} /></Box>
        <Box>{langTag("தமிழ்")}<TextField fullWidth value={ta || ""} onChange={(e) => onTa(e.target.value)} multiline={multiline} minRows={multiline ? 4 : undefined} inputProps={{ lang: "ta" }} sx={fieldSx} /></Box>
      </Box>
    </Box>
  );
}

export default function LandDetailExpanded({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const { t: tr, i18n } = useTranslation();

  const hasCache = !!cachedLandDetails[id];
  const [land, setLand] = useState(() => cachedLandDetails[id] || null);
  const [loading, setLoading] = useState(!hasCache);
  const [error, setError] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState(() => {
    const d = cachedLandDetails[id];
    if (!d) return { name: { en: "", ta: "" }, type: "", description: { en: "", ta: "" }, gods: "", people: "", flora: "", fauna: "", poetry: "", image: "", contentSections: [] };
    return {
      name: d.name || { en: "", ta: "" },
      type: d.type || "",
      description: d.description || { en: "", ta: "" },
      gods: (d.gods || []).join(", "),
      gods_ta: (d.gods_ta || []).join(", "),
      people: (d.people || []).join(", "),
      people_ta: (d.people_ta || []).join(", "),
      flora: (d.flora || []).join(", "),
      flora_ta: (d.flora_ta || []).join(", "),
      fauna: (d.fauna || []).join(", "),
      fauna_ta: (d.fauna_ta || []).join(", "),
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
    };
  });

  useEffect(() => {
    let cancelled = false;
    // Reset per-land state when navigating to a different land
    setEditMode(false);
    setSaveError("");
    setError(null);
    setLand(cachedLandDetails[id] || null);
    setLoading(!hasCache);
    fetch(`${API_BASE_URL}/api/lands/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(tr("land.notFound", "Land not found"));
        return r.json();
      })
      .then((d) => {
        cachedLandDetails[id] = d;
        if (cancelled) return;
        setLand(d);
        setForm({
          name: d.name || { en: "", ta: "" },
          type: d.type || "",
          description: d.description || { en: "", ta: "" },
          gods: (d.gods || []).join(", "),
          gods_ta: (d.gods_ta || []).join(", "),
          people: (d.people || []).join(", "),
          people_ta: (d.people_ta || []).join(", "),
          flora: (d.flora || []).join(", "),
          flora_ta: (d.flora_ta || []).join(", "),
          fauna: (d.fauna || []).join(", "),
          fauna_ta: (d.fauna_ta || []).join(", "),
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
        if (cancelled) return;
        if (!cachedLandDetails[id]) setError(e.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const split = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
      const body = {
        ...form,
        gods: split(form.gods),
        gods_ta: split(form.gods_ta || ""),
        people: split(form.people),
        people_ta: split(form.people_ta || ""),
        flora: split(form.flora),
        flora_ta: split(form.flora_ta || ""),
        fauna: split(form.fauna),
        fauna_ta: split(form.fauna_ta || ""),
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

      // The page URL uses the land's name (e.g. "marutham"); save by its database id.
      const r = await fetch(`${API_BASE_URL}/api/lands/${land?._id || id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const reason = await r.json().then((d) => d.error).catch(() => "");
        throw new Error(
          r.status === 401 || r.status === 403
            ? tr("land.saveNotAllowed", "Please log in as admin to save.")
            : `${tr("land.saveFailed", "Save failed")}${reason ? `: ${reason}` : ` (${r.status})`}`
        );
      }
      const saved = await r.json();
      setLand(saved);
      cachedLandDetails[id] = saved;
      setSaveError("");
      setEditMode(false);
    } catch (e) {
      // keep the editor open with everything that was typed
      setSaveError(e.message || tr("land.saveFailed", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(tr("land.deleteConfirm", "Delete this land entry?"))) return;
    try {
      const r = await fetch(`${API_BASE_URL}/api/lands/${land?._id || id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error(`${tr("land.deleteFailed", "Delete failed")} (${r.status})`);
      delete cachedLandDetails[id];
      navigate("/");
    } catch (e) {
      setSaveError(e.message);
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

  const slug = (land.type || id || "").toLowerCase();
  const theme = TINAI_THEMES[slug] || TINAI_THEMES.kurinji;
  const name = getContent(land.name) || land.type || "Tinai";
  const description = getContent(land.description) || "";

  const descriptionParagraphs = description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Tamil mode shows the Tamil list when one has been filled in, otherwise English
  const inTamil = i18n.language === "ta";
  const pickList = (en, ta) => (inTamil && ta && ta.length ? ta : en) || [];
  const gods = pickList(land.gods, land.gods_ta);
  const people = pickList(land.people, land.people_ta);
  const flora = pickList(land.flora, land.flora_ta);
  const fauna = pickList(land.fauna, land.fauna_ta);
  const poetry = land.poetry || [];

  // ---------- In-page editor (same style as the Explore item pages) ----------
  // Poetry is stored as HTML lines; here it is edited as one plain English and one plain Tamil line.
  const poetryList = (form.poetry || "").split("\n").filter((l) => l.trim());
  const stripTags = (h) => String(h || "").replace(/<[^>]+>/g, "").trim();
  const hasTamil = (s) => /[஀-௿]/.test(stripTags(s));
  const poetryIdx = { en: poetryList.findIndex((l) => !hasTamil(l)), ta: poetryList.findIndex((l) => hasTamil(l)) };
  const setPoetry = (which, value) => {
    const next = [...poetryList];
    const html = value.trim() ? (which === "en" ? `<p><b>${value}</b></p>` : `<p><i>${value}</i></p>`) : "";
    const i = poetryIdx[which];
    if (i >= 0) next[i] = html;
    else if (which === "en") next.unshift(html);
    else next.push(html);
    setForm({ ...form, poetry: next.filter(Boolean).join("\n") });
  };
  const splitList = (v) => String(v || "").split(",").map((x) => x.trim()).filter(Boolean);

  const editCard = { bgcolor: "#fff", border: "1px solid rgba(139,0,0,0.14)", p: { xs: 2.5, md: 3.5 } };
  const editTitle = (text) => (
    <Typography sx={{ fontFamily: '"Playfair Display", "Noto Serif Tamil", serif', fontWeight: 800, fontSize: { xs: "1.25rem", md: "1.45rem" }, color: "#5a1a1a", mb: 2.5, pb: 1.5, borderBottom: "2px solid #DAA520" }}>
      {text}
    </Typography>
  );
  // A comma-separated list edited in English and Tamil side by side, with a live tag preview
  const listField = (label, key, help) => (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#5a1a1a", mb: 1 }}>{label}</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 1.5, md: 2.5 } }}>
        {[[key, "English", "en"], [`${key}_ta`, "தமிழ்", "ta"]].map(([k, tag, langCode]) => (
          <Box key={k}>
            {langTag(tag)}
            <TextField fullWidth value={form[k] || ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={help} inputProps={{ lang: langCode }} sx={fieldSx} />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
              {splitList(form[k]).map((x, i) => (
                <Box key={`${x}-${i}`} sx={{ px: 1.25, py: 0.25, borderRadius: 999, bgcolor: "rgba(139,0,0,0.06)", border: "1px solid rgba(139,0,0,0.2)", fontSize: "0.82rem", color: "#5a1a1a" }}>{x}</Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const editView = (
    <Box id="land-editor" sx={{ mt: { xs: 3, md: 5 }, display: "grid", gap: 3, scrollMarginTop: 80 }}>
      <Box sx={{ ...editCard, bgcolor: "#FFF8EC", borderLeft: "4px solid #8B0000" }}>
        <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 800, fontSize: { xs: "1.4rem", md: "1.8rem" }, color: "#8B0000" }}>
          {tr("land.edit.title", "Edit Land")} — {name}
        </Typography>
        <Typography sx={{ color: "#6b5a4a", mt: 0.5, fontSize: "0.92rem" }}>
          {tr("land.edit.hint", "Fill in English and Tamil side by side. The season, time of day, love theme and way of life come from the classical Tolkappiyam scheme and are not edited here.")}
        </Typography>
      </Box>

      <Box sx={editCard}>
        {editTitle(tr("land.edit.nameAndLine", "Name & poetic line"))}
        <Pair label={tr("land.edit.name", "Name")} en={form.name.en} ta={form.name.ta}
          onEn={(v) => setForm({ ...form, name: { ...form.name, en: v } })} onTa={(v) => setForm({ ...form, name: { ...form.name, ta: v } })} />
        <Pair label={tr("land.edit.poeticLine", "Poetic line (shown in the banner)")}
          en={poetryIdx.en >= 0 ? stripTags(poetryList[poetryIdx.en]) : ""} ta={poetryIdx.ta >= 0 ? stripTags(poetryList[poetryIdx.ta]) : ""}
          onEn={(v) => setPoetry("en", v)} onTa={(v) => setPoetry("ta", v)} />
      </Box>

      <Box sx={editCard}>
        {editTitle(tr("land.edit.bannerImage", "Banner image"))}
        <ImageUploadField label={tr("land.edit.image", "Image")} value={form.image} onChange={(url) => setForm({ ...form, image: url })} onUploadingChange={setUploadingImage} />
      </Box>

      <Box sx={editCard}>
        {editTitle(tr("land.edit.chronicle", "Chronicle"))}
        <Pair label={tr("land.edit.description", "Description")} en={form.description.en} ta={form.description.ta} multiline
          onEn={(v) => setForm({ ...form, description: { ...form.description, en: v } })} onTa={(v) => setForm({ ...form, description: { ...form.description, ta: v } })} />
      </Box>

      <Box sx={editCard}>
        {editTitle(tr("land.edit.lifeOfLand", "Life of the land"))}
        <Box>
          {listField(tr("land.edit.gods", "Presiding deity"), "gods", tr("land.edit.commaHint", "Separate with commas"))}
          {listField(tr("land.edit.people", "People"), "people", tr("land.edit.commaHint", "Separate with commas"))}
          {listField(tr("land.edit.flora", "Flora"), "flora", tr("land.edit.commaHint", "Separate with commas"))}
          {listField(tr("land.edit.fauna", "Fauna"), "fauna", tr("land.edit.commaHint", "Separate with commas"))}
        </Box>
      </Box>

      <Box sx={editCard}>
        {editTitle(tr("land.edit.additionalSections", "Additional content sections"))}
        {(form.contentSections || []).map((section, index) => (
          <Box key={section.id || `land-section-${index}`} sx={{ mb: 3, p: { xs: 2, md: 2.5 }, border: "1px dashed rgba(139,0,0,0.3)", bgcolor: "#FFFDF9" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography sx={{ fontWeight: 800, color: "#8B0000", letterSpacing: "0.08em", fontSize: "0.8rem", textTransform: "uppercase" }}>
                {tr("land.edit.section", "Section")} {index + 1}
              </Typography>
              <Button onClick={() => removeContentSection(section.id)} size="small" startIcon={<DeleteIcon />} sx={{ color: "#b71c1c" }}>
                {tr("actions.remove", "Remove")}
              </Button>
            </Box>
            <Pair label={tr("land.edit.subtitle", "Subtitle")} en={section.subtitle_en} ta={section.subtitle_ta}
              onEn={(v) => updateContentSection(section.id, "subtitle_en", v)} onTa={(v) => updateContentSection(section.id, "subtitle_ta", v)} />
            <Pair label={tr("land.edit.content", "Content")} en={section.content_en} ta={section.content_ta} multiline
              onEn={(v) => updateContentSection(section.id, "content_en", v)} onTa={(v) => updateContentSection(section.id, "content_ta", v)} />
            <Box sx={{ mb: 2.5 }}>
              <ImageUploadField label={tr("land.edit.sectionImage", "Section image (optional)")} value={section.imageUrl}
                onChange={(url) => updateContentSection(section.id, "imageUrl", url)} onUploadingChange={setUploadingImage} />
            </Box>
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#5a1a1a", mb: 1 }}>{tr("land.edit.videoUrl", "Video link (optional)")}</Typography>
              <TextField fullWidth value={section.videoUrl || ""} onChange={(e) => updateContentSection(section.id, "videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=…" sx={fieldSx} />
            </Box>
            {section.videoUrl && (
              <Pair label={tr("land.edit.videoTitle", "Video title")} en={section.videoTitle_en} ta={section.videoTitle_ta}
                onEn={(v) => updateContentSection(section.id, "videoTitle_en", v)} onTa={(v) => updateContentSection(section.id, "videoTitle_ta", v)} />
            )}
          </Box>
        ))}
        <Button onClick={addContentSection} variant="outlined" startIcon={<AddIcon />}
          sx={{ borderRadius: 0, color: "#8B0000", borderColor: "rgba(139,0,0,0.5)", "&:hover": { borderColor: "#8B0000", bgcolor: "rgba(139,0,0,0.04)" } }}>
          {tr("land.edit.addContentSection", "Add content section")}
        </Button>
      </Box>

      {saveError && (
        <Alert severity="error" onClose={() => setSaveError("")} sx={{ borderRadius: 0 }}>
          {saveError}
        </Alert>
      )}

      {/* actions stay visible while scrolling */}
      <Box sx={{ position: "sticky", bottom: 0, zIndex: 5, display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 }, px: { xs: 1.5, md: 3 }, py: 1.5,
        // phones: one compact row of equal buttons
        "& .MuiButton-root": { flex: { xs: 1, sm: "0 0 auto" }, minWidth: 0, px: { xs: 1, sm: 2 }, whiteSpace: "nowrap" }, bgcolor: "#F7F1EA", border: "1px solid rgba(139,0,0,0.15)", boxShadow: "0 -8px 24px rgba(0,0,0,0.06)" }}>
        <Button onClick={handleDelete} variant="outlined" startIcon={<DeleteIcon />}
          sx={{ borderRadius: 0, color: "#b71c1c", borderColor: "rgba(183,28,28,0.5)", "&:hover": { borderColor: "#b71c1c", bgcolor: "rgba(183,28,28,0.05)" } }}>
          {tr("actions.delete", "Delete")}
        </Button>
        <Box sx={{ flex: 1, display: { xs: "none", sm: "block" } }} />
        <Button onClick={() => setEditMode(false)} variant="outlined"
          sx={{ borderRadius: 0, color: "#8B0000", borderColor: "rgba(139,0,0,0.5)", "&:hover": { borderColor: "#8B0000", bgcolor: "rgba(139,0,0,0.04)" } }}>
          {tr("actions.cancel", "Cancel")}
        </Button>
        <Button onClick={handleSave} variant="contained" disableElevation disabled={saving || uploadingImage}
          sx={{ borderRadius: 0, bgcolor: "#8B0000", fontWeight: 700, px: 3, "&:hover": { bgcolor: "#6B0000" } }}>
          {saving ? tr("actions.saving", "Saving...") : uploadingImage ? tr("form.uploading", "Uploading…") : (
            <>
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{tr("land.edit.save", "Save changes")}</Box>
              <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>{tr("actions.save", "Save")}</Box>
            </>
          )}
        </Button>
      </Box>
    </Box>
  );

  const lang = i18n.language === "ta" ? "ta" : "en";
  const L = (o) => (o ? o[lang] || o.en || "" : "");
  const plain = (html) => String(html || "").replace(/<[^>]+>/g, "").trim();
  const isTamil = (s) => /[஀-௿]/.test(s);
  const poetryLines = poetry.map(plain).filter(Boolean);
  const tagline = poetryLines.find((p) => (lang === "ta" ? isTamil(p) : !isTamil(p))) || poetryLines[0] || "";
  const otherName = lang === "ta" ? (land.name?.en || theme.en) : (land.name?.ta || theme.ta);
  const sections = (land.contentSections || []).filter((s) => L(s.subtitle) || L(s.content) || s.imageUrl || s.imageLink || s.videoUrl);

  const glance = ["season", "time", "theme", "life"];

  const kicker = (text) => (
    <Typography sx={{ fontSize: "0.72rem", letterSpacing: "0.2em", fontWeight: 800, color: theme.accent, textTransform: "uppercase", mb: 1.5 }}>
      {text}
    </Typography>
  );

  const card = { bgcolor: theme.paper, border: `1px solid ${theme.accent}22`, boxShadow: `0 10px 30px ${theme.ink}0d` };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.page }}>
      <SEO
        title={land ? `${name} - Five Ainthinai Landscapes` : 'Tamil Ainthinai Landscapes'}
        description={land ? (description || `Explore ${name} (${land.type}) landscape in Sangam literature and Tamil geography.`).slice(0, 160) : 'Explore Five Ainthinai landscapes of Tamil Sangam age.'}
        keywords={land ? `${name}, Five Ainthinai, ${land.type || ''}, Kurinji, Mullai, Marutham, Neithal, Palai, Meenkodi` : 'Five Ainthinai, Sangam Landscapes'}
        image={land?.image || undefined}
        url={`/explore/lands/${id}`}
        type="article"
      />

      {/* ---------- Hero: the landscape itself ---------- */}
      <Box sx={{ position: "relative", height: { xs: "78vh", md: "86vh" }, minHeight: 520, overflow: "hidden", bgcolor: theme.ink }}>
        {/* own layer: the image component raises itself (z-index), so contain it here */}
        <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {land.image && (
            <OptimizedImage
              src={cldImg(land.image, 1920)}
              alt={name}
              priority
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              skeletonSx={{ bgcolor: `${theme.accent}33` }}
            />
          )}
        </Box>
        <Box sx={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(180deg, ${theme.ink}99 0%, ${theme.ink}22 30%, ${theme.ink}55 62%, ${theme.ink}e6 100%)` }} />

        {/* top bar */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 3, pt: { xs: 9, md: 10 }, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <IconButton onClick={() => navigate(-1)} aria-label={tr("actions.back", "Back")} sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.12)", "&:hover": { bgcolor: "rgba(255,255,255,0.22)" } }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 800, letterSpacing: "0.22em", fontSize: "0.72rem", color: "rgba(255,255,255,0.9)" }}>
            {tr("land.header.fiveTinai", "FIVE TINAI")}
          </Typography>
          {user?.role === "admin" ? (
            <IconButton onClick={() => { setEditMode((v) => !v); setTimeout(() => document.getElementById("land-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }} aria-label={tr("actions.edit", "Edit")} sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.12)", "&:hover": { bgcolor: "rgba(255,255,255,0.22)" } }}>
              <EditIcon />
            </IconButton>
          ) : (
            <Box sx={{ width: 40 }} />
          )}
        </Container>

        {/* title block */}
        <Container maxWidth="lg" sx={{ position: "absolute", left: 0, right: 0, bottom: { xs: 110, md: 170 }, zIndex: 3, color: "#fff" }}>
          <Typography sx={{ fontSize: { xs: "0.7rem", md: "0.8rem" }, letterSpacing: "0.28em", fontWeight: 800, textTransform: "uppercase", opacity: 0.9, mb: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box component="span" sx={{ width: 36, height: 2, bgcolor: theme.accent2 }} />
            {L(theme.label)}
          </Typography>
          <Typography component="h1" sx={{ fontFamily: '"Noto Serif Tamil", "Playfair Display", Georgia, serif', fontWeight: 800, fontSize: { xs: "3.2rem", sm: "4.6rem", md: "6.4rem" }, lineHeight: 1.05, textShadow: "0 6px 30px rgba(0,0,0,0.35)" }}>
            {name}
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif Tamil", "Playfair Display", Georgia, serif', fontSize: { xs: "1.2rem", md: "1.6rem" }, opacity: 0.85, mb: 2.5 }}>
            {otherName}
          </Typography>
          {tagline && (
            <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: "italic", fontSize: { xs: "1.1rem", md: "1.5rem" }, maxWidth: 760, lineHeight: 1.5, opacity: 0.95, borderLeft: `3px solid ${theme.accent2}`, pl: 2 }}>
              {tagline}
            </Typography>
          )}
        </Container>

        <TinaiScene slug={slug} theme={theme} />
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
        {editMode ? editView : (<>
        {/* ---------- The tinai at a glance ---------- */}
        <Box sx={{ mt: { xs: -2, md: -4 }, position: "relative", zIndex: 3, display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: { xs: 1.5, md: 2 } }}>
          {glance.map((key) => (
            <Box key={key} sx={{ ...card, p: { xs: 2, md: 2.5 }, borderTop: `3px solid ${theme.accent}` }}>
              <Typography sx={{ fontSize: "0.68rem", letterSpacing: "0.16em", fontWeight: 800, color: theme.accent, textTransform: "uppercase", mb: 0.5 }}>
                {L(FACT_LABELS[key])}
              </Typography>
              <Typography sx={{ fontWeight: 700, color: theme.ink, fontSize: { xs: "0.95rem", md: "1.05rem" }, lineHeight: 1.35 }}>
                {L(theme.facts[key])}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* ---------- Chronicle + presiding deity ---------- */}
        <Box sx={{ mt: { xs: 4, md: 6 }, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.7fr 1fr" }, gap: { xs: 3, md: 4 }, alignItems: "start" }}>
          <Box sx={{ ...card, p: { xs: 3, md: 5 } }}>
            {kicker(tr("land.sections.historicalChronicle", "Chronicle of the land"))}
            {descriptionParagraphs.length > 0 ? (
              descriptionParagraphs.map((para, idx) => (
                <Typography
                  key={idx}
                  sx={{
                    color: "#2E2A26",
                    lineHeight: 1.95,
                    fontSize: { xs: "1.02rem", md: "1.12rem" },
                    mb: idx === descriptionParagraphs.length - 1 ? 0 : 2,
                    ...(idx === 0 && {
                      "&::first-letter": { fontSize: "3.4rem", lineHeight: 0.85, float: "left", pr: 1, pt: 0.6, fontFamily: '"Playfair Display", "Noto Serif Tamil", serif', color: theme.accent, fontWeight: 800 },
                    }),
                  }}
                >
                  {para}
                </Typography>
              ))
            ) : (
              <Typography sx={{ color: "#888" }}>{tr("land.sections.noDescription", "No description available.")}</Typography>
            )}
          </Box>

          <Box sx={{ display: "grid", gap: 3 }}>
            <Box sx={{ p: { xs: 3, md: 3.5 }, color: "#fff", background: `linear-gradient(150deg, ${theme.accent} 0%, ${theme.ink} 100%)`, position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", border: `2px solid ${theme.accent2}55` }} />
              <Typography sx={{ fontSize: "0.7rem", letterSpacing: "0.2em", fontWeight: 800, opacity: 0.85, textTransform: "uppercase", mb: 1 }}>
                {tr("land.sections.presidingDeity", "Presiding deity")}
              </Typography>
              <Typography sx={{ fontFamily: '"Playfair Display", "Noto Serif Tamil", serif', fontSize: { xs: "1.8rem", md: "2.1rem" }, fontWeight: 800, lineHeight: 1.15 }}>
                {gods.join(" · ") || "—"}
              </Typography>
            </Box>
            <Box sx={{ ...card, p: { xs: 3, md: 3.5 } }}>
              {kicker(tr("land.sections.people", "People of the land"))}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {people.length ? people.map((p) => (
                  <Box key={p} sx={{ px: 1.75, py: 0.75, bgcolor: `${theme.accent}12`, color: theme.ink, fontWeight: 700, border: `1px solid ${theme.accent}33` }}>{p}</Box>
                )) : "—"}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ---------- Life of the land: flora & fauna ---------- */}
        <Box sx={{ mt: { xs: 4, md: 6 } }}>
          {kicker(tr("land.sections.lifeOfLand", "Life of the land"))}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 2, md: 3 } }}>
            {[
              [tr("land.sections.flora", "Flora"), flora],
              [tr("land.sections.fauna", "Fauna"), fauna],
            ].map(([title, items]) => (
              <Box key={title} sx={{ ...card, p: { xs: 2.5, md: 3.5 } }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 800, fontSize: "1.3rem", color: theme.ink, mb: 1.25 }}>{title}</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {items.length ? items.map((x) => (
                      <Box key={x} sx={{ px: 1.5, py: 0.5, borderRadius: 999, bgcolor: "#fff", border: `1px solid ${theme.accent}40`, color: theme.ink, fontSize: "0.92rem", fontWeight: 600 }}>{x}</Box>
                    )) : "—"}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ---------- Poetry ---------- */}
        {poetryLines.length > 0 && (
          <Box sx={{ mt: { xs: 4, md: 6 }, p: { xs: 4, md: 7 }, textAlign: "center", color: "#fff", position: "relative", overflow: "hidden", background: `radial-gradient(ellipse at top, ${theme.accent} 0%, ${theme.ink} 75%)` }}>
            <Typography aria-hidden sx={{ position: "absolute", top: { xs: -20, md: -40 }, left: "50%", transform: "translateX(-50%)", fontSize: { xs: "8rem", md: "12rem" }, lineHeight: 1, opacity: 0.12, fontFamily: "Georgia, serif" }}>“</Typography>
            <Typography sx={{ fontSize: "0.72rem", letterSpacing: "0.24em", fontWeight: 800, color: theme.accent2, textTransform: "uppercase", mb: 3, position: "relative" }}>
              {tr("land.sections.poeticMemory", "Poetic memory")}
            </Typography>
            {poetryLines.map((line, idx) => (
              <Typography key={idx} sx={{ position: "relative", fontFamily: isTamil(line) ? '"Noto Serif Tamil", serif' : '"Playfair Display", Georgia, serif', fontStyle: isTamil(line) ? "normal" : "italic", fontSize: { xs: idx === 0 ? "1.35rem" : "1.1rem", md: idx === 0 ? "1.9rem" : "1.35rem" }, lineHeight: 1.6, maxWidth: 820, mx: "auto", mb: idx === poetryLines.length - 1 ? 0 : 2, opacity: idx === 0 ? 1 : 0.85 }}>
                {line}
              </Typography>
            ))}
          </Box>
        )}

        {/* ---------- Extra sections added by the admin ---------- */}
        {sections.map((s, idx) => {
          const img = s.imageUrl || s.imageLink;
          return (
            <Box key={idx} sx={{ ...card, mt: { xs: 4, md: 6 }, p: { xs: 3, md: 5 }, display: "grid", gridTemplateColumns: { xs: "1fr", md: img ? "1fr 1fr" : "1fr" }, gap: { xs: 3, md: 5 }, alignItems: "center" }}>
              <Box sx={{ order: { md: idx % 2 ? 2 : 1 } }}>
                {L(s.subtitle) && (
                  <Typography component="h2" sx={{ fontFamily: '"Playfair Display", "Noto Serif Tamil", serif', fontWeight: 800, fontSize: { xs: "1.6rem", md: "2.1rem" }, color: theme.ink, mb: 2 }}>
                    {L(s.subtitle)}
                  </Typography>
                )}
                {L(s.content) && <Typography sx={{ color: "#2E2A26", lineHeight: 1.9, fontSize: "1.05rem", whiteSpace: "pre-line" }}>{L(s.content)}</Typography>}
                {s.videoUrl && (
                  <Button href={s.videoUrl} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<PlayCircleOutlineIcon />} sx={{ mt: 2.5, borderRadius: 0, color: theme.accent, borderColor: theme.accent }}>
                    {L(s.videoTitle) || tr("land.sections.watchVideo", "Watch video")}
                  </Button>
                )}
              </Box>
              {img && (
                <Box sx={{ order: { md: idx % 2 ? 1 : 2 } }}>
                  <OptimizedImage src={cldImg(img, 1000)} alt={L(s.subtitle) || name} sx={{ width: "100%", height: { xs: 240, md: 340 }, objectFit: "cover", display: "block" }} />
                </Box>
              )}
            </Box>
          );
        })}

        {/* ---------- Journey through the five tinai ---------- */}
        <Box sx={{ mt: { xs: 5, md: 8 } }}>
          {kicker(tr("land.sections.otherTinai", "Journey through the five tinai"))}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(5, 150px)", md: "repeat(5, 1fr)" }, gap: 1.5, overflowX: { xs: "auto", md: "visible" }, pb: 1 }}>
            {TINAI_ORDER.map((key) => {
              const o = TINAI_THEMES[key];
              const active = key === slug;
              return (
                <Box
                  key={key}
                  component={RouterLink}
                  to={`/explore/lands/${key}`}
                  aria-current={active ? "page" : undefined}
                  sx={{
                    position: "relative", height: { xs: 150, md: 190 }, overflow: "hidden", textDecoration: "none", color: "#fff",
                    outline: active ? `3px solid ${o.accent}` : "none", outlineOffset: 3,
                    "&:hover img": { transform: "scale(1.06)" },
                  }}
                >
                  <Box component="img" src={o.image} alt="" loading="lazy" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }} />
                  <Box sx={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 30%, ${o.ink}e6 100%)` }} />
                  <Box sx={{ position: "absolute", left: 14, right: 14, bottom: 12 }}>
                    <Typography sx={{ fontFamily: '"Noto Serif Tamil", serif', fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.2 }}>{o.ta}</Typography>
                    <Typography sx={{ fontSize: "0.72rem", letterSpacing: "0.14em", fontWeight: 700, opacity: 0.85, textTransform: "uppercase" }}>
                      {active ? tr("land.sections.youAreHere", "You are here") : o.en}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
        </>)}
      </Container>
    </Box>
  );
}
