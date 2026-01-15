# Si të testosh aplikacionin në telefon

## Metoda 1: Përdorur IP Address Lokal (Më e thjeshta)

### Hapat:

1. **Sigurohu që telefoni dhe kompjuteri janë në të njëjtën rrjet WiFi**

2. **Starto backend dhe frontend:**
   ```bash
   npm start
   ```

3. **Gjej IP address-in e kompjuterit:**
   - Windows: Shiko në terminal output ose shko në Settings > Network
   - IP address juaj: **192.168.0.29**

4. **Në telefon, hap browser dhe shkruaj:**
   ```
   http://192.168.0.29:5173
   ```

5. **Nëse ka probleme me CORS ose connection:**
   - Sigurohu që firewall-i nuk po bllokon port-et 5000 dhe 5173
   - Në Windows Firewall, lejo "Python" dhe "Node.js" për private networks

---

## Metoda 2: Përdorur Chrome DevTools (Simulim)

1. **Hap Chrome në kompjuter**
2. **Shtyp F12** për të hapur DevTools
3. **Kliko ikonën e telefonit** (Toggle device toolbar) ose shtyp `Ctrl+Shift+M`
4. **Zgjidh një device** (iPhone, Samsung, etj.)
5. **Refresh faqen**

Kjo simulon një telefon, por nuk është e njëjta si testimi në telefon të vërtetë.

---

## Metoda 3: Përdorur ngrok (Për testim nga internet)

1. **Shkarko ngrok** nga https://ngrok.com/
2. **Starto backend dhe frontend:**
   ```bash
   npm start
   ```

3. **Në një terminal tjetër, starto ngrok:**
   ```bash
   ngrok http 5173
   ```

4. **Kopjo URL-në që jep ngrok** (p.sh. `https://abc123.ngrok.io`)
5. **Hap URL-në në telefon**

**Shënim:** Kjo metodë kërkon internet dhe ngrok account (free tier është i mjaftueshëm).

---

## Troubleshooting

### Nuk mund të lidhem nga telefon:
- ✅ Sigurohu që të dy pajisjet janë në të njëjtën WiFi
- ✅ Kontrollo firewall settings
- ✅ Provo të restart-osh backend dhe frontend
- ✅ Kontrollo që IP address është i saktë

### Backend nuk po përgjigjet:
- ✅ Kontrollo që backend po ekzekutohet në `http://0.0.0.0:5000`
- ✅ Provo `http://192.168.0.29:5000/api/health` në browser

### Frontend nuk po përgjigjet:
- ✅ Kontrollo që vite po ekzekutohet me `host: '0.0.0.0'`
- ✅ Provo `http://192.168.0.29:5173` në browser

---

## IP Address Aktual

IP address i kompjuterit tuaj: **192.168.0.29**

URL për telefon: **http://192.168.0.29:5173**

