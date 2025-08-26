import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Container,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Fade,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Rating,
} from "@mui/material";
import {
  AccessTime,
  People,
  LocationOn,
  Restaurant,
  Edit,
  Delete,
  Add,
} from "@mui/icons-material";
import API_BASE_URL from "../../utils/api";

export default function Foods({ user }) {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  // Removed filter-related state and methods
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    image: "",
  });

  // Rich Tamil cuisine data
  const dummyFoods = [
    {
      _id: "1",
      name: "Sambar",
      tamilName: "சாம்பார்",
      category: "Main Course",
      region: "All Tamil Regions",
      difficulty: "Medium",
      cookingTime: "45 minutes",
      servings: "4-6",
      rating: 4.8,
      description:
        "Traditional Tamil lentil curry with vegetables, tamarind, and aromatic spices. A staple dish served with rice, idli, or dosa.",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      ingredients: [
        "Toor dal - 1 cup",
        "Tamarind - lemon size",
        "Drumstick - 2 pieces",
        "Brinjal - 1 medium",
        "Tomato - 1 large",
        "Onion - 1 medium",
        "Sambar powder - 2 tbsp",
        "Turmeric powder - 1/2 tsp",
        "Curry leaves",
        "Coriander leaves",
        "Ghee - 2 tbsp",
      ],
      preparation: [
        "Cook toor dal with turmeric until soft",
        "Soak tamarind in water and extract juice",
        "Cut vegetables into medium pieces",
        "Heat ghee, add mustard seeds, curry leaves",
        "Add vegetables and cook until tender",
        "Add tamarind juice, sambar powder, salt",
        "Add cooked dal and simmer",
        "Garnish with coriander leaves",
      ],
      culturalSignificance:
        "Essential part of Tamil meals, represents the balance of six tastes in Ayurveda",
      nutritionalBenefits: [
        "High protein from lentils",
        "Rich in vitamins from vegetables",
        "Good source of fiber",
      ],
      occasions: [
        "Daily meals",
        "Festival celebrations",
        "Religious offerings",
      ],
      createdAt: new Date(),
    },
    {
      _id: "2",
      name: "Pongal",
      tamilName: "பொங்கல்",
      category: "Main Course",
      region: "Tamil Nadu",
      difficulty: "Easy",
      cookingTime: "30 minutes",
      servings: "4",
      rating: 4.9,
      description:
        "Traditional rice and lentil porridge, both sweet and savory versions. Especially significant during Pongal festival celebrations.",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      ingredients: [
        "Raw rice - 1 cup",
        "Moong dal - 1/4 cup",
        "Water - 4 cups",
        "Milk - 1 cup",
        "Ghee - 3 tbsp",
        "Cashews - 10",
        "Black pepper - 1 tsp",
        "Cumin seeds - 1 tsp",
        "Ginger - 1 inch",
        "Curry leaves",
        "Salt to taste",
      ],
      preparation: [
        "Wash rice and dal together",
        "Pressure cook with water until soft",
        "Heat ghee in pan, add cashews",
        "Add pepper, cumin, ginger, curry leaves",
        "Add cooked rice-dal mixture",
        "Add milk and mix well",
        "Season with salt",
        "Serve hot with ghee on top",
      ],
      culturalSignificance:
        "Sacred food offered to Sun God during Pongal festival, symbolizes prosperity",
      nutritionalBenefits: [
        "Complete protein",
        "Easy to digest",
        "Good for all ages",
      ],
      occasions: ["Pongal festival", "Temple offerings", "Recovery meals"],
      createdAt: new Date(),
    },
    {
      _id: "3",
      name: "Rasam",
      tamilName: "ரசம்",
      category: "Soup",
      region: "South Tamil Nadu",
      difficulty: "Medium",
      cookingTime: "25 minutes",
      servings: "4",
      rating: 4.7,
      description:
        "Tangy tamarind-based soup with aromatic spices, perfect for digestion. A comforting dish often served with rice.",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      ingredients: [
        "Tamarind - small lemon size",
        "Tomato - 2 medium",
        "Rasam powder - 1 tbsp",
        "Turmeric - 1/2 tsp",
        "Ghee - 2 tbsp",
        "Mustard seeds - 1 tsp",
        "Cumin seeds - 1 tsp",
        "Red chili - 2",
        "Asafoetida - pinch",
        "Curry leaves",
        "Coriander leaves",
        "Salt to taste",
      ],
      preparation: [
        "Extract thick tamarind juice",
        "Chop tomatoes finely",
        "Heat ghee, add mustard, cumin seeds",
        "Add red chili, asafoetida, curry leaves",
        "Add tomatoes, cook until soft",
        "Add tamarind juice, rasam powder",
        "Add turmeric, salt, and water",
        "Boil and garnish with coriander",
      ],
      culturalSignificance:
        "Traditional digestive aid, consumed at end of heavy meals",
      nutritionalBenefits: [
        "Aids digestion",
        "Rich in vitamin C",
        "Antioxidant properties",
      ],
      occasions: ["Daily meals", "During illness", "Monsoon season"],
      createdAt: new Date(),
    },
    {
      _id: "4",
      name: "Chettinad Chicken",
      tamilName: "செட்டிநாடு கோழி",
      category: "Non-Vegetarian",
      region: "Chettinad",
      difficulty: "Hard",
      cookingTime: "1 hour",
      servings: "4",
      rating: 4.9,
      description:
        "Spicy and flavorful chicken curry from Chettinad region, known for its unique blend of roasted spices and coconut.",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      ingredients: [
        "Chicken - 1 kg",
        "Coconut - 1 cup grated",
        "Dry red chili - 8-10",
        "Coriander seeds - 2 tbsp",
        "Fennel seeds - 1 tbsp",
        "Black pepper - 1 tsp",
        "Cinnamon - 2 inch",
        "Cardamom - 4",
        "Cloves - 6",
        "Star anise - 2",
        "Onion - 3 large",
        "Tomato - 2",
        "Ginger-garlic paste - 2 tbsp",
      ],
      preparation: [
        "Marinate chicken with turmeric, salt",
        "Dry roast all spices until fragrant",
        "Grind roasted spices with coconut",
        "Heat oil, fry chicken pieces",
        "Sauté onions until golden brown",
        "Add ginger-garlic paste, tomatoes",
        "Add ground spice paste, cook well",
        "Add fried chicken, simmer until done",
      ],
      culturalSignificance:
        "Pride of Chettinad cuisine, represents rich culinary heritage",
      nutritionalBenefits: [
        "High protein",
        "Rich in spices with medicinal properties",
        "Good iron content",
      ],
      occasions: [
        "Special occasions",
        "Wedding feasts",
        "Festival celebrations",
      ],
      createdAt: new Date(),
    },
    {
      _id: "5",
      name: "Payasam",
      tamilName: "பாயசம்",
      category: "Dessert",
      region: "Kerala-Tamil Border",
      difficulty: "Medium",
      cookingTime: "45 minutes",
      servings: "6",
      rating: 4.8,
      description:
        "Traditional sweet pudding made with rice, milk, and jaggery. A must-have dessert for festivals and celebrations.",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      ingredients: [
        "Raw rice - 1/2 cup",
        "Full fat milk - 1 liter",
        "Jaggery - 1/2 cup",
        "Ghee - 3 tbsp",
        "Cashews - 15",
        "Raisins - 2 tbsp",
        "Cardamom powder - 1 tsp",
        "Coconut milk - 1/2 cup",
        "Edible camphor - pinch",
      ],
      preparation: [
        "Wash and soak rice for 30 minutes",
        "Boil milk in heavy bottomed pan",
        "Add rice and cook until soft",
        "Dissolve jaggery in little water",
        "Add jaggery syrup to rice-milk",
        "Heat ghee, fry cashews and raisins",
        "Add fried nuts to payasam",
        "Add cardamom powder and coconut milk",
      ],
      culturalSignificance:
        "Sacred offering in temples, essential for all celebrations",
      nutritionalBenefits: [
        "Rich in calcium",
        "Good carbohydrates",
        "Natural sweetener",
      ],
      occasions: [
        "Festivals",
        "Weddings",
        "Temple offerings",
        "Birthday celebrations",
      ],
      createdAt: new Date(),
    },
    {
      _id: "6",
      name: "Idli",
      tamilName: "இட்லி",
      category: "Breakfast",
      region: "All Tamil Regions",
      difficulty: "Medium",
      cookingTime: "8 hours fermentation + 15 minutes cooking",
      servings: "20 pieces",
      rating: 4.9,
      description:
        "Steamed rice and lentil cakes, light and fluffy. A healthy breakfast staple served with sambar and chutney.",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      ingredients: [
        "Idli rice - 3 cups",
        "Urad dal - 1 cup",
        "Fenugreek seeds - 1 tsp",
        "Salt - 1 tsp",
        "Water as needed",
      ],
      preparation: [
        "Soak rice and dal separately for 4-5 hours",
        "Grind urad dal to fluffy batter",
        "Grind rice to slightly coarse batter",
        "Mix both batters with salt",
        "Ferment overnight in warm place",
        "Pour batter in idli moulds",
        "Steam for 12-15 minutes",
        "Serve hot with accompaniments",
      ],
      culturalSignificance:
        "Symbol of South Indian cuisine, represents healthy living",
      nutritionalBenefits: [
        "Probiotic benefits",
        "Easy to digest",
        "Low in calories",
      ],
      occasions: ["Daily breakfast", "Light dinner", "During illness"],
      createdAt: new Date(),
    },
  ];

  // Removed filter options
  // const categoryOptions = [
  //   "all",
  //   "Main Course",
  //   "Soup",
  //   "Non-Vegetarian",
  //   "Dessert",
  //   "Breakfast",
  //   "Snacks",
  // ];
  // const regionOptions = [
  //   "all",
  //   "All Tamil Regions",
  //   "Tamil Nadu",
  //   "South Tamil Nadu",
  //   "Chettinad",
  //   "Kerala-Tamil Border",
  //   "Kongu Nadu",
  // ];

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/foods`);
      if (!res.ok) throw new Error("Failed to fetch foods");
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error("Error fetching foods:", err);
      setFoods(dummyFoods); // Fallback to dummy data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Removed filteredFoods

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description,
      image: item.image,
    });
    setEditOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      image: "" 
    });
    setAddOpen(true);
  };

  const handleSave = () => {
    (async () => {
      try {
    if (editItem) {
          const res = await fetch(`${API_BASE_URL}/api/foods/${editItem._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              category: formData.category,
              description: formData.description,
              image: formData.image,
            }),
          });
          if (!res.ok) throw new Error("Update failed");
        } else {
          const res = await fetch(`${API_BASE_URL}/api/foods`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              category: formData.category,
              description: formData.description,
              image: formData.image,
            }),
          });
          if (!res.ok) throw new Error("Create failed");
        }
        await fetchFoods();
      setEditOpen(false);
      setAddOpen(false);
      } catch (err) {
        console.error(err);
        alert("Failed to save recipe");
    }
    })();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/foods/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) throw new Error("Delete failed");
          await fetchFoods();
        } catch (err) {
          console.error(err);
          alert("Failed to delete recipe");
        }
      })();
    }
  };

  const handleCardClick = (foodId) => {
    navigate(`/explore/foods/${foodId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#000" }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      {/* Unique Heading Section */}
      <Box 
        sx={{ 
          mb: 6, 
          textAlign: 'center', 
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 900, 
            color: "#000", 
            position: 'relative',
            display: 'inline-block',
            letterSpacing: -1,
            padding: '0 10px',
            transition: 'all 0.3s ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '-50px',
              width: '40px',
              height: '3px',
              backgroundColor: '#000',
              transform: 'translateY(-50%)',
              transition: 'all 0.3s ease',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              right: '-50px',
              width: '40px',
              height: '3px',
              backgroundColor: '#000',
              transform: 'translateY(-50%)',
              transition: 'all 0.3s ease',
            },
            '&:hover': {
              color: '#333',
              transform: 'scale(1.02)',
              '&::before': {
                width: '60px',
                left: '-70px',
                backgroundColor: '#666',
              },
              '&::after': {
                width: '60px',
                right: '-70px',
                backgroundColor: '#666',
              },
            },
          }}
        >
          Tamil Cuisine
        </Typography>
        
        {user && user.role === "admin" && (
          <Box 
            sx={{ 
              position: 'absolute', 
              right: 0, 
              top: '50%', 
              transform: 'translateY(-50%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-50%) scale(1.05)',
                '& button': {
                  boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                  transform: 'translateY(-3px)',
                }
              }
            }}
          >
            <Button
              onClick={handleAdd}
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: "#000",
                color: "#fff",
                transition: 'all 0.3s ease',
                "&:hover": { 
                  bgcolor: "#333",
                  boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                  transform: 'translateY(-3px)',
                },
                borderRadius: 0,
                px: 3,
              }}
            >
              Add Recipe
            </Button>
          </Box>
        )}
      </Box>

      <Grid 
        container 
        spacing={4} 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          perspective: '1000px', // 3D effect for cards
          transition: 'all 0.3s ease',
          '& > .MuiGrid-item': {
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)',
              zIndex: 10,
            }
          }
        }}
      >
        {foods.map((food, index) => (
          <Fade 
            in={true} 
            timeout={500 + index * 200} 
            key={food._id}
          >
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <Card
                sx={{
                  width: 350,  // Fixed width
                  height: 450, // Fixed height
                  display: 'flex',
                  flexDirection: 'column',
                  border: "3px solid #000",
                  borderRadius: 0,
                  bgcolor: "#fff",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  position: 'relative',
                  overflow: 'hidden',
                  "&::before": {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent, transparent 40%, rgba(255,255,255,0.1) 40%, transparent 60%)',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.6s ease',
                  },
                  "&:hover": {
                    transform: "translateY(-15px) rotate(1deg)",
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    "&::before": {
                      transform: 'translateX(100%)',
                    },
                    "& .card-content": {
                      transform: "scale(1.02)",
                      opacity: 0.95,
                    }
                  },
                }}
                onClick={() => navigate(`/explore/foods/${food._id}`)}
              >
                {(food.image || food.imageLink) ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={food.image || food.imageLink}
                    alt={food.name}
                    sx={{ 
                      objectFit: "contain",
                      width: '100%',
                      maxHeight: 200,
                      backgroundColor: '#f0f0f0',
                      padding: '10px',
                      boxSizing: 'border-box',
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', food.image || food.imageLink);
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E";
                      e.target.style.display = 'block';
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      width: '100%',
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '10px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      sx={{ textAlign: 'center' }}
                    >
                      No Image Available
                    </Typography>
                  </Box>
                )}
                <CardContent
                  className="card-content"
                  sx={{
                    p: 3,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: 'relative', // For absolute positioning of admin buttons
                    transition: 'all 0.3s ease',
                  }}
                >
                  {user && user.role === "admin" && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        display: "flex", 
                        gap: 1 
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(food);
                        }}
                        size="small"
                        sx={{
                          color: "#000",
                          bgcolor: 'rgba(255,255,255,0.7)',
                          "&:hover": { 
                            bgcolor: 'rgba(255,255,255,0.9)',
                            transform: 'scale(1.1)' 
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(food._id);
                        }}
                        size="small"
                        sx={{
                          color: "#000",
                          bgcolor: 'rgba(255,255,255,0.7)',
                          "&:hover": { 
                            bgcolor: 'rgba(255,255,255,0.9)',
                            transform: 'scale(1.1)' 
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700, 
                        color: "#000", 
                        mb: 1,
                        lineHeight: 1.3,
                        fontSize: '1.5rem',
                        textTransform: 'capitalize',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {food.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontStyle: "italic",
                        fontSize: "0.9rem",
                        mb: 2,
                        textTransform: 'capitalize',
                      }}
                    >
                      {food.category}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ 
                        color: "#000", 
                        lineHeight: 1.6, 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '4.8rem', // Ensures consistent height for 3 lines
                      }}
                    >
                      {food.description.length > 150 
                        ? `${food.description.substring(0, 150)}...` 
                        : food.description}
                    </Typography>
                  </Box>

                  <Button
                    component={Link}
                    to={`/explore/foods/${food._id}`}
                    variant="outlined"
                    fullWidth
                    sx={{
                      color: "#000",
                      borderColor: "#000",
                      borderRadius: 0,
                      mt: 'auto',
                      "&:hover": { bgcolor: "#f5f5f5", borderColor: "#000" },
                    }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Fade>
        ))}
      </Grid>

      {/* Edit/Add Dialog */}
      <Dialog
        open={editOpen || addOpen}
        onClose={() => {
          setEditOpen(false);
          setAddOpen(false);
        }}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 0,
            border: '3px solid #000',
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#000', 
            color: '#fff', 
            textAlign: 'center',
            fontWeight: 700 
          }}
        >
          {editItem ? "Edit Recipe" : "Add New Recipe"}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
              <TextField
                fullWidth
            label="Name"
                value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
            minRows={3}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
            label="Image URL"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                sx={{ mb: 2 }}
              />
        </DialogContent>
        <DialogActions
          sx={{ 
            p: 2, 
            justifyContent: 'space-between',
            bgcolor: '#f0f0f0' 
          }}
        >
          <Button
            onClick={() => {
              setEditOpen(false);
              setAddOpen(false);
            }}
            sx={{ color: '#000' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: '#000',
              color: '#fff',
              '&:hover': { bgcolor: '#333' },
              borderRadius: 0,
            }}
          >
            {editItem ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
