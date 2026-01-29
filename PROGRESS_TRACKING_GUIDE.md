# Dashboard Progress Tracking - Implementatie Guide

## Wat is er veranderd?

Het dashboard toont nu **werkende** groei-voortgang op basis van:
- **Zaai-datum** (planting_date): Wanneer is het gewas geplant?
- **Groeperiode** (growth_days): Hoeveel dagen duurt het gewas om volgroeid te zijn?

### Formule:
```
Progress (%) = (Dagen sinds zaaien / Totale groeperiode) * 100
Maximaal 100% (automatisch afgekapt)
```

## Database Schema Wijzigingen

### Fields tabel - Nieuwe kolommen:
- `planting_date` (Date): Zaaidatum van het huidige gewas
- `growth_days` (Integer): Verwachte groeperiode in dagen

### Crops tabel - Nieuwe kolom:
- `growth_days` (Integer): Standaard groeperiode voor het gewas

## Stappen om te implementeren:

### 1. Database Migratie Uitvoeren
```bash
cd backend
alembic upgrade head
```

Dit voert de migration uit: `2026_01_29_1400-add_planting_date_and_growth_tracking.py`

### 2. Crop Data Bijwerken (met groeperiodes)
```bash
docker exec -it digital-farm-api-dev python /app/app/scripts/seed_crops.py
```

Dit seeded alle crops met `growth_days` waarden.

### 3. Test Velden Aanmaken (met zaaidatums)
```bash
# Eerst user_id opzoeken
docker exec -it digital-farm-api-dev python /app/app/scripts/create_user.py \
  --email testuser@example.com \
  --password TestPass123 \
  --full-name "Test Boer"

# Dan velden aanmaken met user_id=<jouw_user_id>
docker exec -it digital-farm-api-dev python /app/app/scripts/seed_fields.py --user-id 1
```

## Hoe het werkt:

### Backend (API):
1. **Voortgang berekening** (`calculate_progress()` functie):
   - Berekent dagen sinds zaaidatum tot vandaag
   - Deelt door groeiperiode
   - Returnt percentage (0-100%)

2. **Endpoints** die voortgang returnen:
   - `GET /fields/` - Alle velden van user met voortgang
   - `GET /fields/{field_id}` - Specifiek veld met voortgang
   - `POST /fields/{field_id}/crops` - Bij toevoegen van gewas, zet automatisch groeperiode

### Frontend (Dashboard):
1. **Voortgangsbalken**: Visueel percentage weergegeven
2. **Alert System**: Waarschuwingen als veld bijna volgroeid is (>80%)
3. **Real-time berekening**: Wordt opnieuw berekend bij elke API-call

## Test Velden Data:

De `seed_fields.py` script maakt deze test velden aan:

| Veld | Gewas | Zaai-datum | Groeperiode | Huidige Progress |
|------|-------|------------|------------|------------------|
| Noord Veld A | Aardappelen | 45 dagen geleden | 120 dagen | ~37% |
| Zuid Veld B | Maïs | 30 dagen geleden | 90 dagen | ~33% |
| Oost Veld C | Spinazie | 20 dagen geleden | 45 dagen | ~44% |
| West Veld D | Uien | 5 dagen geleden | 150 dagen | ~3% |

## Voorbeeld API Response:

```json
{
  "id": 1,
  "name": "Noord Veld A",
  "planting_date": "2026-01-14",
  "growth_days": 120,
  "progress": 37,
  "last_crop": "Aardappelen",
  "status": "actief",
  ...
}
```

## Frontend Dashboard Aanpassing

Het dashboard gebruikt nu de `progress` waarde voor:
1. ✅ Voortgangsbalken (visueel)
2. ✅ Alert-waarschuwingen (>80% = oogstvoorbereiding nodig)
3. ✅ Statistiek: "Gemiddelde Groei %"

## Troubleshooting

### Progress toont 0%?
- Controleer of veld een `planting_date` heeft
- Controleer of veld `growth_days` > 0 heeft

### Progress gaat niet over 100%?
- Dit is normaal - automatisch afgekapt op 100%

### Gewas voegt geen growth_days toe?
- Controleer of crop `growth_days` ingesteld is
- Run seed_crops.py opnieuw
