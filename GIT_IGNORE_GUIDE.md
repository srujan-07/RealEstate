# Git Ignore Reference Guide

## 🚫 What's Being Ignored

This project uses comprehensive `.gitignore` files to prevent sensitive and unnecessary files from being committed to the repository.

### 🔒 **CRITICAL - Never Commit These:**
- **Private Keys**: `*.key`, `*.pem`, `private-keys/`
- **Environment Variables**: `.env*` files
- **Wallet Files**: `wallet.dat`, `mnemonic.txt`, `seed.txt`
- **Sensitive Configs**: Files with `*secret*`, `*private*` in name

### 📁 **Development Files Ignored:**
- `node_modules/` - Dependencies (reinstall with `npm install`)
- `.next/`, `build/`, `dist/` - Build outputs
- `cache/`, `artifacts/` - Hardhat compilation files
- `coverage/` - Test coverage reports
- `*.log` - Log files

### 🖥️ **System Files Ignored:**
- `.DS_Store` (macOS)
- `Thumbs.db` (Windows)  
- `.vscode/`, `.idea/` - Editor settings
- `*.tmp`, `*.temp` - Temporary files

## 🔧 **Useful Git Commands**

### Check what's being ignored:
```bash
git status --ignored
```

### Force add a normally ignored file:
```bash
git add -f filename
```

### Temporarily ignore a tracked file:
```bash
git update-index --skip-worktree filename
```

### Stop temporarily ignoring:
```bash
git update-index --no-skip-worktree filename
```

### See what files are tracked:
```bash
git ls-files
```

## 📂 **Project Structure Ignored Files:**

```
RealEstate/
├── .gitignore                 # Root ignore file
├── node_modules/              # ❌ Ignored
├── real-estate/
│   ├── .gitignore            # Frontend ignore file
│   ├── node_modules/         # ❌ Ignored
│   ├── .next/                # ❌ Ignored
│   ├── .env.local            # ❌ Ignored (SENSITIVE!)
│   └── build/                # ❌ Ignored
├── backend/
│   ├── .gitignore            # Backend ignore file
│   ├── node_modules/         # ❌ Ignored
│   ├── cache/                # ❌ Ignored
│   ├── artifacts/            # ❌ Ignored
│   ├── .env                  # ❌ Ignored (SENSITIVE!)
│   └── *.key                 # ❌ Ignored (CRITICAL!)
└── contracts/
    └── .gitkeep              # ✅ Tracked (keeps empty dir)
```

## ⚠️ **Security Reminders:**

1. **Never commit `.env` files** - They contain sensitive configuration
2. **Never commit private keys** - Store them securely offline
3. **Never commit wallet files** - Keep backups separate from code
4. **Review commits** - Use `git diff --cached` before committing

## 🔄 **If You Accidentally Committed Sensitive Files:**

```bash
# Remove from Git but keep local copy
git rm --cached filename

# Remove from Git and delete local copy
git rm filename

# Remove from entire Git history (DANGEROUS!)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch filename' \
  --prune-empty --tag-name-filter cat -- --all
```

## 📝 **Adding New Ignore Patterns:**

Edit the appropriate `.gitignore` file and add your pattern:
```gitignore
# Comment explaining why
pattern-to-ignore/
*.extension
specific-file.txt
```

**Remember**: `.gitignore` only affects untracked files. If a file is already tracked, you need to untrack it first with `git rm --cached filename`.
