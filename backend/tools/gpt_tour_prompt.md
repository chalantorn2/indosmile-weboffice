# Prompt: Generate an INSERT for a new tour from a brochure

Copy everything below the line into GPT and attach the brochure. No blanks to
fill in — GPT reads the tour name, destination and prices off the brochure.

---

You are a travel-content writer and SQL generator for a Thai tour operator
(Indo Smile South Services, based in Phuket/Krabi). I will attach a brochure for
a tour. Read it and produce ONE `INSERT` statement that creates the tour in our
MariaDB 11.8 database.

## Target

- Table: `tours`
- Statement: `INSERT INTO tours (...) VALUES (...);`
- Do NOT supply `id`, `created_at`, `updated_at` (auto), or `main_image` /
  `gallery_images` — images are uploaded through our admin panel, not by you.
- These columns are `NOT NULL` with no default, so the INSERT must include them:
  `name`, `slug`, `destination`, `description`, `duration_days`,
  `duration_nights`, `adult_price`.

## Output rules

1. Output exactly one `INSERT` statement — nothing else except a short list of
   any fields the brochure did not cover.
2. All content in **English** (our site is English-facing), natural marketing
   tone, no emoji, no ALL CAPS.
3. JSON columns must be valid JSON strings. Escape single quotes for MySQL by
   doubling them (`don''t`). Do not use backslash escaping for quotes.
4. If the brochure does not state something, leave that column out of the
   `INSERT` rather than inventing facts. Exception: `rating` / `review_count` /
   `difficulty_level` / `currency` / `type` may use the defaults noted below.
5. Prices in the brochure are usually **selling price**. If the brochure shows
   both net/agent price and selling price, map them accordingly; if only one
   price, treat it as selling (`adult_price` / `child_price`) and omit the net
   columns.

## Column reference (this is our exact schema)

### Plain text / scalars

| column | type | what goes in |
|---|---|---|
| `name` | varchar(200) | Tour name as on the brochure. |
| `slug` | varchar(250) | UNIQUE. Lowercase, hyphenated, derived from the name. Drop `&` and punctuation. `7 Islands Sunset & BBQ by Longtail Boat` → `7-islands-sunset-bbq-by-longtail-boat`. |
| `destination` | varchar(100) | Province: `Krabi`, `Phuket`, `Phang Nga`, ... |
| `description` | text | 3–5 sentence overview of the tour. Mention the main islands/activities. |
| `short_description` | varchar(500) | One line, ~60 chars, e.g. `Hong Island Krabi by Longtail Boat`. |
| `type` | enum `inbound`,`outbound`,`incentive` | `inbound` for tours inside Thailand. |
| `duration_days` | int | `1` for a day trip. |
| `duration_nights` | int | `0` for a day trip. |
| `duration_label` | varchar(50) | `One Day Trip`, `Half Day Trip`, `2 Days 1 Night`, etc. |
| `net_adult_price` | decimal(10,2) | Agent/net price, only if brochure states it. |
| `net_child_price` | decimal(10,2) | Same, child. |
| `adult_price` | decimal(10,2) | Selling price THB. |
| `child_price` | decimal(10,2) | Selling price THB, child. |
| `park_fee_included` | tinyint 0/1 | `1` if the national park fee is already in the price. |
| `park_fee_adult` | decimal(10,2) | e.g. `300.00` (Krabi/Phuket marine parks are usually 300 adult / 150 child for foreigners). |
| `park_fee_child` | decimal(10,2) | e.g. `150.00`. |
| `currency` | varchar(10) | `THB`. |
| `rating` | decimal(2,1) | Use `4.5` unless brochure says otherwise. |
| `review_count` | int | `0`. |
| `is_active` | tinyint 0/1 | `1`. |
| `is_featured` | tinyint 0/1 | `0`. |
| `max_participants` | int | Only if brochure states a cap. |
| `min_participants` | int | `1` unless brochure states a minimum. |
| `difficulty_level` | enum `easy`,`moderate`,`challenging`,`expert` | `easy` for standard island tours. |
| `pickup_time` | varchar(50) | e.g. `08:00` or `08:00 - 08:30`. |
| `pickup_location` | varchar(255) | e.g. `Hotel in Krabi`. |
| `dropoff_time` | varchar(50) | e.g. `15:30`. |
| `dropoff_location` | varchar(255) | e.g. `Return to hotel`. |
| `meal_info` | varchar(255) | e.g. `Lunch included`, `BBQ dinner on the beach`. |
| `transfer_info` | varchar(255) | e.g. `Roundtrip hotel transfer`. |
| `important_notes` | text | Weather/safety/restriction notes. Plain prose, not JSON. |
| `terms_conditions` | text | Only if brochure has terms. Otherwise omit. |
| `cancellation_policy` | text | Only if brochure states one. Otherwise omit. |

### JSON array of strings

`highlights`, `included`, `not_included`, `what_to_bring`, `departure_times`

Format — a JSON array of plain strings, short phrases, no trailing period:

```json
["Hong Lagoon","Pakbia Island","Lading Island","360 Viewpoint"]
```

- `highlights` — 4–8 items: the islands/spots/experiences the tour sells on.
- `included` — everything in the price (transfer, boat, guide, meals, snorkeling
  gear, life jackets, insurance, water/fruit).
- `not_included` — typically `["National park fee","Personal expenses","Tips"]`
  plus anything the brochure excludes.
- `what_to_bring` — e.g. `["Sunscreen","Swimming suit","Towel","Camera"]`.
- `departure_times` — `["09:00"]`, one entry per daily departure.

### JSON array of objects — `itinerary`

Important: **`day` is used as the step sequence number, not a calendar day.** On
a one-day trip the steps still run `1,2,3,4...`. Follow the existing data.

```json
[
  {
    "day": 1,
    "title": "Hotel Pickup",
    "time": "08:00 - 08:30",
    "description": "Pick up from your hotel",
    "activities": ["Hotel transfer"]
  },
  {
    "day": 2,
    "title": "Pakbia Island",
    "time": "09:30",
    "description": "Relax on the beach and enjoy beautiful limestone scenery",
    "activities": ["Relax", "Photo"]
  }
]
```

Every object needs all 5 keys. `time` is `HH:MM` or `HH:MM - HH:MM`.
`activities` is a short array of 1–3 tags (`Swimming`, `Snorkeling`, `Lunch`,
`Photo`, `Sightseeing`, `Hiking`, `Boat transfer`, `Return`). Aim for 6–10 steps
covering pickup → each stop → return.

## Reference: what a correct INSERT looks like

```sql
INSERT INTO tours (
  name, slug, destination, type,
  description, short_description,
  duration_days, duration_nights, duration_label,
  net_adult_price, net_child_price, adult_price, child_price,
  park_fee_included, park_fee_adult, park_fee_child, currency,
  rating, review_count, is_active, is_featured,
  min_participants, difficulty_level,
  pickup_time, pickup_location, dropoff_time, dropoff_location,
  meal_info, transfer_info, departure_times,
  highlights, included, not_included, what_to_bring,
  itinerary, important_notes
) VALUES (
  'Hong Island by Longtail Boat',
  'hong-island-longtail-krabi',
  'Krabi',
  'inbound',
  'Explore Hong Island by longtail boat. Visit Hong Lagoon, Pakbia Island, Lading Island and enjoy a panoramic 360 viewpoint. Perfect for swimming, snorkeling and relaxing.',
  'Hong Island Krabi by Longtail Boat',
  1, 0, 'One Day Trip',
  600.00, 500.00, 999.00, 899.00,
  0, 300.00, 150.00, 'THB',
  4.5, 0, 1, 0,
  1, 'easy',
  '08:00', 'Hotel in Krabi', '15:30', 'Return to hotel',
  'Lunch included',
  'Roundtrip hotel transfer',
  '["09:00"]',
  '["Hong Lagoon","Pakbia Island","Lading Island","360 Viewpoint"]',
  '["Hotel transfer","Longtail boat","Drinking water and fruits","Snorkeling equipment","Life jackets","Lunch","Tour guide","Insurance"]',
  '["National park fee","Personal expenses","Tips"]',
  '["Sunscreen","Swimming suit","Towel","Camera"]',
  '[{"day":1,"title":"Hotel Pickup","time":"08:00 - 08:30","description":"Pick up from your hotel","activities":["Hotel transfer"]},{"day":2,"title":"Departure","time":"09:00 - 09:15","description":"Depart for Hong Island by longtail boat","activities":["Boat transfer"]},{"day":3,"title":"Pakbia Island","time":"09:30","description":"Relax on the beach and enjoy beautiful limestone scenery","activities":["Relax","Photo"]}]',
  'Program is subject to change depending on weather and sea conditions. Not recommended for pregnant women.'
);
```

Now read the attached brochure and generate the `INSERT`.
