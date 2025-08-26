import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Home,
  AccountBalance,
  MenuBook,
  SportsKabaddi,
  RestaurantMenu,
  Science,
  Celebration,
  Checkroom,
} from "@mui/icons-material";

function Explore() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/explore/${category.toLowerCase()}`);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 900,
          color: "#000",
          textAlign: "center",
          mb: 6,
          fontSize: { xs: "2rem", md: "3rem" },
        }}
      >
        Explore Everything
      </Typography>

      {/* Categories Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Temples */}
        <Box
          onClick={() => handleCategoryClick("temples")}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "2px solid #f5f5f5",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              borderColor: "#000",
            },
          }}
        >
          <Home
            sx={{
              fontSize: 48,
              color: "#000",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#000", textAlign: "center" }}
          >
            Temples
          </Typography>
        </Box>

        {/* Kings */}
        <Box
          onClick={() => handleCategoryClick("kings")}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "2px solid #f5f5f5",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              borderColor: "#000",
            },
          }}
        >
          <AccountBalance
            sx={{
              fontSize: 48,
              color: "#000",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#000", textAlign: "center" }}
          >
            Kings
          </Typography>
        </Box>

        {/* Literature */}
        <Box
          onClick={() => handleCategoryClick("literature")}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "2px solid #f5f5f5",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              borderColor: "#000",
            },
          }}
        >
          <MenuBook
            sx={{
              fontSize: 48,
              color: "#000",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#000", textAlign: "center" }}
          >
            Literature
          </Typography>
        </Box>

        {/* Dance */}
        <Box
          onClick={() => handleCategoryClick("dance")}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "2px solid #f5f5f5",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              borderColor: "#000",
            },
          }}
        >
          <SportsKabaddi
            sx={{
              fontSize: 48,
              color: "#000",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#000", textAlign: "center" }}
          >
            Dance
          </Typography>
        </Box>

        {/* Foods */}
        <Box
          onClick={() => handleCategoryClick("foods")}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "2px solid #f5f5f5",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              borderColor: "#000",
            },
          }}
        >
          <RestaurantMenu
            sx={{
              fontSize: 48,
              color: "#000",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#000", textAlign: "center" }}
          >
            Foods
          </Typography>
        </Box>

        {/* Festivals */}
        <Box
          onClick={() => handleCategoryClick("festivals")}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "2px solid #f5f5f5",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              borderColor: "#000",
            },
          }}
        >
          <Celebration
            sx={{
              fontSize: 48,
              color: "#000",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#000", textAlign: "center" }}
          >
            Festivals
          </Typography>
        </Box>

        {/* Clothing */}
        <Box
          onClick={() => handleCategoryClick("clothing")}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "2px solid #f5f5f5",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              borderColor: "#000",
            },
          }}
        >
          <Checkroom
            sx={{
              fontSize: 48,
              color: "#000",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#000", textAlign: "center" }}
          >
            Clothing
          </Typography>
        </Box>

        {/* Ancient Science */}
        <Box
          onClick={() => handleCategoryClick("ancientscience")}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "2px solid #f5f5f5",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              borderColor: "#000",
            },
          }}
        >
          <Science
            sx={{
              fontSize: 48,
              color: "#000",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#000", textAlign: "center" }}
          >
            Ancient Science
          </Typography>
        </Box>
      </div>
    </Box>
  );
}

export default Explore;
