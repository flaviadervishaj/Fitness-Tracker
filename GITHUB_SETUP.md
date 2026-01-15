# Udhezime per GitHub Setup

## Hapat për të ngarkuar projektin në GitHub:

1. **Krijo repository në GitHub:**
   - Shko në https://github.com
   - Kliko "+" → "New repository"
   - Emër: `Fitness-Tracker`
   - Zgjidh publik ose privat
   - **MOS** inicializo me README (projekti e ka tashmë)
   - Kliko "Create repository"

2. **Lidh repository-n lokal me GitHub:**
   
   Zëvendëso `YOUR_USERNAME` me username-in tënd të GitHub:

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/Fitness-Tracker.git
   git push -u origin main
   ```

3. **Nëse kërkon authentication:**
   - Do të kërkojë username dhe password (ose Personal Access Token)
   - Për GitHub, përdor Personal Access Token në vend të password-it

## Komanda të shpejta:

```bash
# Kontrollo status
git status

# Shiko remote repositories
git remote -v

# Push changes
git push

# Pull changes
git pull
```

