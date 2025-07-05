# GitHub Setup Guide for GreenGhost Tech

## Step 1: Create GitHub Account (if needed)

1. Go to [github.com](https://github.com)
2. Click "Sign up" if you don't have an account
3. Choose username, email, and password
4. Verify your email address

## Step 2: Create New Repository

1. **Log into GitHub**
2. **Click the "+" icon** in top right corner
3. **Select "New repository"**
4. **Fill in repository details:**
   - Repository name: `greenghosttech-website`
   - Description: `GreenGhost Tech - Automated Lawn Care Platform`
   - Set to **Public** (required for free Netlify/Render)
   - **DO NOT** check "Add a README file"
   - **DO NOT** check "Add .gitignore"
   - **DO NOT** check "Choose a license"
5. **Click "Create repository"**

## Step 3: Prepare Your Local Project

1. **Open terminal in your project folder** (where your files are)
2. **Initialize git repository:**
   ```bash
   git init
   ```

3. **Add all your files:**
   ```bash
   git add .
   ```

4. **Create first commit:**
   ```bash
   git commit -m "Initial commit - GreenGhost Tech website"
   ```

## Step 4: Connect Local Project to GitHub

1. **Copy the repository URL** from GitHub (looks like: `https://github.com/YOUR_USERNAME/greenghosttech-website.git`)

2. **Add GitHub as remote origin:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/greenghosttech-website.git
   ```

3. **Set main branch:**
   ```bash
   git branch -M main
   ```

4. **Push your code to GitHub:**
   ```bash
   git push -u origin main
   ```

## Step 5: Verify Upload

1. **Refresh your GitHub repository page**
2. **You should see all your project files:**
   - client/ folder
   - server/ folder
   - db/ folder
   - package.json
   - All other project files

## Step 6: Create .gitignore (Important)

1. **In your project root, create `.gitignore` file:**
   ```
   # Dependencies
   node_modules/
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*

   # Environment variables
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local

   # Build outputs
   dist/
   build/

   # IDE
   .vscode/
   .idea/

   # OS
   .DS_Store
   Thumbs.db

   # Logs
   *.log
   logs/

   # Runtime data
   pids/
   *.pid
   *.seed

   # Coverage
   coverage/
   .nyc_output/

   # Replit specific
   .replit
   replit.nix
   ```

2. **Add and commit the .gitignore:**
   ```bash
   git add .gitignore
   git commit -m "Add .gitignore file"
   git push
   ```

## Troubleshooting Common Issues

### Authentication Problems
If you get authentication errors:
1. **Use GitHub Personal Access Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate new token with "repo" permissions
   - Use token as password when prompted

### Large File Warnings
If you get warnings about large files:
1. **Remove node_modules if accidentally added:**
   ```bash
   git rm -r --cached node_modules/
   git commit -m "Remove node_modules"
   git push
   ```

### Permission Denied
If you get permission errors:
1. **Check repository is public**
2. **Verify you're the owner of the repository**
3. **Try using HTTPS instead of SSH**

## Verify Success

Your repository should now contain:
- All your project files
- Commit history
- Proper .gitignore
- Public visibility

Once this is complete, you'll be ready to connect it to Render for backend hosting and Netlify for frontend hosting.

## Next Steps After GitHub Setup

1. Connect repository to Render (backend hosting)
2. Connect repository to Netlify (frontend hosting)
3. Configure environment variables
4. Deploy and test

Your code is now safely backed up on GitHub and ready for deployment!