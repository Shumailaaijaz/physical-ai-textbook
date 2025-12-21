#!/bin/bash

# Physical AI Website Deployment Script
# This script helps deploy both backend and frontend

echo "=========================================="
echo "Physical AI Website Deployment Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Error: Must run from the website root directory"
    exit 1
fi

echo "What would you like to deploy?"
echo "1) Backend to Vercel"
echo "2) Frontend to GitHub Pages"
echo "3) Both (Backend first, then Frontend)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "=========================================="
        echo "Deploying Backend to Vercel"
        echo "=========================================="
        cd backend

        # Check if Vercel is installed
        if [ ! -d "node_modules/vercel" ]; then
            print_warning "Installing Vercel CLI..."
            npm install
        fi

        print_warning "Make sure you're logged in to Vercel"
        npx vercel login

        echo ""
        print_warning "Deploying to Vercel..."
        npx vercel

        echo ""
        read -p "Do you want to deploy to production? (y/n): " deploy_prod
        if [ "$deploy_prod" = "y" ]; then
            npx vercel --prod
            echo ""
            print_success "Backend deployed to production!"
            print_warning "IMPORTANT: Copy the deployment URL and update src/components/ChatWidget.js"
        fi

        cd ..
        ;;

    2)
        echo ""
        echo "=========================================="
        echo "Deploying Frontend to GitHub Pages"
        echo "=========================================="

        print_warning "Building production version..."
        npm run build

        if [ $? -eq 0 ]; then
            print_success "Build completed successfully!"

            echo ""
            read -p "Commit and push to GitHub? (y/n): " do_push
            if [ "$do_push" = "y" ]; then
                git add .
                read -p "Enter commit message: " commit_msg
                git commit -m "$commit_msg"
                git push origin main

                print_success "Pushed to GitHub!"
                print_warning "GitHub Actions will deploy automatically"
                echo "Check progress at: https://github.com/Shumailaaijaz/physical-ai-textbook/actions"
            fi
        else
            print_error "Build failed! Check errors above."
            exit 1
        fi
        ;;

    3)
        echo ""
        echo "=========================================="
        echo "Full Deployment: Backend + Frontend"
        echo "=========================================="

        # Deploy backend first
        echo ""
        echo "Step 1: Deploying Backend..."
        cd backend

        if [ ! -d "node_modules/vercel" ]; then
            print_warning "Installing Vercel CLI..."
            npm install
        fi

        print_warning "Make sure you're logged in to Vercel"
        npx vercel login

        echo ""
        npx vercel --prod

        if [ $? -ne 0 ]; then
            print_error "Backend deployment failed!"
            exit 1
        fi

        cd ..

        print_success "Backend deployed!"
        echo ""
        print_warning "IMPORTANT: Update the backend URL in src/components/ChatWidget.js"
        read -p "Press Enter after updating ChatWidget.js..."

        # Deploy frontend
        echo ""
        echo "Step 2: Deploying Frontend..."
        npm run build

        if [ $? -eq 0 ]; then
            git add .
            git commit -m "Update backend URL and deploy"
            git push origin main

            print_success "Deployment complete!"
            echo ""
            echo "Your site will be live at:"
            echo "https://shumailaaijaz.github.io/physical-ai-textbook/"
        else
            print_error "Frontend build failed!"
            exit 1
        fi
        ;;

    *)
        print_error "Invalid choice!"
        exit 1
        ;;
esac

echo ""
print_success "Deployment process completed!"
echo ""
echo "Next steps:"
echo "1. Test your backend: curl https://YOUR-URL.vercel.app/health"
echo "2. Visit your site: https://shumailaaijaz.github.io/physical-ai-textbook/"
echo "3. Test the chatbot by clicking the floating button"
