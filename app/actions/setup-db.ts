"use server";

import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

const sql = postgres(databaseUrl, { ssl: "require" });

export async function bootstrapDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY,
        role TEXT CHECK (role IN ('provider', 'patient')) NOT NULL,
        email TEXT NOT NULL,
        full_name TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS invitations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        provider_id UUID REFERENCES profiles(id) NOT NULL,
        patient_email TEXT NOT NULL,
        invite_code TEXT UNIQUE NOT NULL,
        status TEXT CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS care_team_relationships (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        provider_id UUID REFERENCES profiles(id) NOT NULL,
        patient_id UUID REFERENCES profiles(id) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(provider_id, patient_id)
      );
    `;

    await sql`ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE care_team_relationships ENABLE ROW LEVEL SECURITY;`;

    await sql`
      DO $$
      BEGIN
        CREATE POLICY "profiles_select_own"
          ON profiles
          FOR SELECT
          USING (auth.uid() = id);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$
      BEGIN
        CREATE POLICY "care_team_select_member"
          ON care_team_relationships
          FOR SELECT
          USING (auth.uid() = provider_id OR auth.uid() = patient_id);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$
      BEGIN
        CREATE POLICY "invitations_select_pending"
          ON invitations
          FOR SELECT
          USING (status = 'pending');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$
      BEGIN
        CREATE POLICY "invitations_select_provider"
          ON invitations
          FOR SELECT
          USING (auth.uid() = provider_id);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$
      BEGIN
        CREATE POLICY "invitations_insert_provider"
          ON invitations
          FOR INSERT
          WITH CHECK (auth.uid() = provider_id);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    return { success: true, message: "Database tables created successfully!" };
  } catch (error) {
    console.error("Database setup failed:", error);
    return { success: false, error: "Failed to create tables." } as const;
  }
}
