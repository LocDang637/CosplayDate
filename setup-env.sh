 
#!/bin/bash

# Script to help set up environment variables for production deployment

echo "=== CosplayDate Production Environment Setup ==="
echo ""

# Create .env file for local docker testing
cat > .env << EOF
# Supabase Configuration
SUPABASE_URL=https://yxwxauuoozpbltcdjkag.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3hhdXVvb3pwYmx0Y2Rqa2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDk5NzQsImV4cCI6MjA2NDMyNTk3NH0.Jhtky7v_oP19ZkZS4SzMScvgwHXcQaYB3CnFYyl8rkc
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3hhdXVvb3pwYmx0Y2Rqa2FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODc0OTk3NCwiZXhwIjoyMDY0MzI1OTc0fQ.oLkmlAqoIVfX_hlfe4mr7iG_9fiBEnQBh1cAmLEhfH8

# Database Configuration
DATABASE_CONNECTION_STRING=Server=tcp:locdang637server.database.windows.net,1433;Initial Catalog=CosplayDateDb;Persist Security Info=False;User ID=locdang;Password=S@a12345678;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;

# Email Configuration
EMAIL_FROM_ADDRESS=noreply@cosplaydate.com
EMAIL_USERNAME=locdang637@gmail.com
EMAIL_PASSWORD=klrr wfbk qkgt iebj

# App URLs (Update these with your production URLs)
BACKEND_URL=https://cosplaydate-production-aa2c.up.railway.app/api
FRONTEND_URL=cosplay-date.vercel.app

# PayOS Configuration
PAYOS_CLIENT_ID=99341a1e-20ad-4c6b-9b2b-7640bfeb1669
PAYOS_API_KEY=b7cc8230-e419-4ace-b301-2f2b2a2de235
PAYOS_CHECKSUM_KEY=47ba2fd784abb0f42e53c835e0ad293fa4b1063c4e9c33840e642c6fd313ec61
PAYOS_PARTNER_CODE=your-partner-code-optional

# JWT Configuration (Generate a new secure key for production)
JWT_SECRET_KEY=YourSuperSecretKeyThatShouldBeAtLeast32CharactersLongForSecurityPurposes123456789
EOF

echo "✅ Created .env file for local Docker testing"
echo ""

echo "🔧 GitHub Secrets to set up:"
echo "Repository Settings > Secrets and variables > Actions"
echo ""
echo "Required secrets:"
echo "- VERCEL_TOKEN (from Vercel dashboard)"
echo "- VERCEL_ORG_ID (from Vercel project settings)"
echo "- VERCEL_PROJECT_ID (from Vercel project settings)"
echo "- RAILWAY_TOKEN (from Railway dashboard)"
echo "- BACKEND_URL (your Railway/Render app URL)"
echo ""
echo "Plus all the environment variables from .env file above"
echo ""

echo "🚀 Next steps:"
echo "1. Set up Vercel project for frontend"
echo "2. Set up Railway account for backend (free tier)"
echo "3. Configure GitHub secrets"
echo "4. Push to main branch to trigger deployment"
echo ""

echo "📋 Free hosting options for backend:"
echo "- Railway (https://railway.app) - Recommended, 500 hours/month free"
echo "- Render (https://render.com) - Free tier with limitations"
echo "- Heroku (paid only now)"
echo "- Google Cloud Run (generous free tier)"
echo ""

echo "Done! Check the generated .env file and update the URLs accordingly."