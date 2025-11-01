# Configuración de Supabase para Gestión de Invitados

## Tabla: guests (invitados)

Ejecuta el siguiente SQL en tu consola de Supabase:

```sql
-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  nickname VARCHAR(100),
  guest_code VARCHAR(50) UNIQUE NOT NULL,
  cost_per_person DECIMAL(10, 2) DEFAULT 0,
  confirmed BOOLEAN DEFAULT false,
  num_companions INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster searches
CREATE INDEX idx_guests_code ON guests(guest_code);
CREATE INDEX idx_guests_first_name ON guests(first_name);
CREATE INDEX idx_guests_last_name ON guests(last_name);
CREATE INDEX idx_guests_confirmed ON guests(confirmed);

-- Enable Row Level Security (RLS)
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Policy to allow read access for all users (for invitations)
CREATE POLICY "Enable read access for all users" ON guests
  FOR SELECT USING (true);

-- Policy to allow insert/update/delete only with service_role (admin)
CREATE POLICY "Enable all access for service role" ON guests
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample guests (optional)
INSERT INTO guests (first_name, last_name, nickname, guest_code, cost_per_person, confirmed, num_companions) VALUES
  ('Juan', 'Pérez', 'Juancho', 'INV001', 50000, true, 2),
  ('María', 'González', 'Mari', 'INV002', 50000, false, 1),
  ('Carlos', 'Rodríguez', 'Carlitos', 'INV003', 50000, true, 0);
```

## Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env`:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_APP_ADMIN_PASSWORD=tu_password_admin
VITE_APP_TABLE_NAME=wishes
```

## Notes

- **guest_code**: Unique code for each guest (e.g., INV001, INV002)
- **cost_per_person**: Cost per person in Argentine pesos
- **confirmed**: Whether the guest confirmed attendance
- **num_companions**: Number of people accompanying the guest
- **notes**: Free field for additional admin notes
