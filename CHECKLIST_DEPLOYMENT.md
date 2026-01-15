# ✅ Checklist për Deployment

## HAPI 1: SUPABASE (Database)

- [ ] Krijo account në https://supabase.com
- [ ] Krijo project: `fitness-tracker`
- [ ] **RUAJ PASSWORD** e database
- [ ] Shko te SQL Editor
- [ ] Kopjo dhe ekzekuto `supabase_setup.sql`
- [ ] Shko te Settings → Database
- [ ] Kopjo Connection String (URI)
- [ ] **RUAJ CONNECTION STRING**

**URL Supabase:** _________________________________

**Connection String:** _________________________________

---

## HAPI 2: RENDER (Backend)

- [ ] Krijo account në https://render.com
- [ ] New + → Web Service
- [ ] Connect GitHub repo: `Fitness-Tracker`
- [ ] Name: `fitness-tracker-backend`
- [ ] Environment: `Python 3`
- [ ] Build Command: `pip install -r backend/requirements.txt`
- [ ] Start Command: `cd backend && gunicorn app:app`
- [ ] Environment Variable: `DATABASE_URL` = (connection string nga Supabase)
- [ ] Environment Variable: `SECRET_KEY` = (random string)
- [ ] Environment Variable: `FLASK_ENV` = `production`
- [ ] Kliko "Create Web Service"
- [ ] **RUAJ BACKEND URL**

**Backend URL:** _________________________________

---

## HAPI 3: VERCEL (Frontend)

- [ ] Krijo account në https://vercel.com
- [ ] Add New → Project
- [ ] Import GitHub repo: `Fitness-Tracker`
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Environment Variable: `VITE_API_URL` = (backend URL + `/api`)
- [ ] Kliko "Deploy"
- [ ] **RUAJ FRONTEND URL**

**Frontend URL:** _________________________________

---

## ✅ TESTO

- [ ] Hap frontend URL në browser
- [ ] Krijo account të ri
- [ ] Login
- [ ] Testo Dashboard
- [ ] Testo Workout
- [ ] Testo Exercises
- [ ] Testo Progress

---

## 🎉 GATI!

**Aplikacioni yt është online!**

**Frontend:** https://____________________.vercel.app
**Backend:** https://____________________.onrender.com
**Database:** Supabase Dashboard

---

## 📚 Dokumentacion:

- **Guide i plotë:** `HAPAT_E_THJESHTE.md`
- **SQL Script:** `supabase_setup.sql`
- **Arkitektura:** `ARKITEKTURA_DEPLOYMENT.md`

