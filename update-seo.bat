@echo off
REM Quick script to update sitemaps after adding gallery content

echo 🚀 Generating SEO Sitemaps...

cd server
node scripts/generate-sitemap.js

echo.
echo ✅ Sitemaps generated successfully!
echo.
echo 📋 Next steps:
echo 1. Commit the updated sitemap files
echo 2. Deploy to production
echo 3. Submit to Google Search Console:
echo    - https://www.meenkodi.com/sitemap.xml
echo    - https://www.meenkodi.com/sitemap-images.xml
echo.

pause
