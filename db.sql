-- Create courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration VARCHAR(100),
  fee DECIMAL(10,2),
  features TEXT[],
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admission_process table
CREATE TABLE admission_process (
  id SERIAL PRIMARY KEY,
  step_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create contact_info table
-- Table to store contact info
CREATE TABLE contact_info (
  id SERIAL PRIMARY KEY,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  office_hours TEXT,
  map_url TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  hours TEXT,
  image_url TEXT
);

-- Table to store social media links related to contact info
CREATE TABLE social_media (
  id bigint primary key generated always as identity,
  contact_info_id bigint NOT NULL REFERENCES contact_info(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT
);

-- Create about_us table
CREATE TABLE about_us (
  id SERIAL PRIMARY KEY,
  mission TEXT,
  vision TEXT,
  history TEXT,
  achievements TEXT[],
  faculty_count INTEGER,
  students_placed INTEGER,
  years_experience INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  course VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create faculty table
CREATE TABLE faculty (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(255),
  qualification TEXT,
  experience_years INTEGER,
  subjects TEXT[],
  image_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create hero_section table
CREATE TABLE hero_section (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  cta_text VARCHAR(100),
  cta_link VARCHAR(255),
  background_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create a user_profiles table to store additional user data
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create contact_submissions table
CREATE TABLE contact_submissions (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


-- Enable Row Level Security on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_process ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_us ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (clerk_user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update their own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (clerk_user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can insert their own profile"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (clerk_user_id = auth.jwt()->>'sub');

-- Create admin policies for content management
CREATE POLICY "Admins can manage all content"
ON courses
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE clerk_user_id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
);

CREATE POLICY "Everyone can view active courses"
ON courses
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Create policies for public content (readable by everyone)
CREATE POLICY "Everyone can view faculty"
ON faculty FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Everyone can view testimonials"
ON testimonials FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Everyone can view admission process"
ON admission_process FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Everyone can view contact info"
ON contact_info FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Everyone can view about us"
ON about_us FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Everyone can view hero section"
ON hero_section FOR SELECT TO anon, authenticated
USING (is_active = true);

-- Admin policies for content management
CREATE POLICY "Admins can manage faculty"
ON faculty FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE clerk_user_id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage testimonials"
ON testimonials FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE clerk_user_id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage admission process"
ON admission_process FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE clerk_user_id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage contact info"
ON contact_info FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE clerk_user_id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage about us"
ON about_us FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE clerk_user_id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage hero section"
ON hero_section FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE clerk_user_id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
);

-- Create policies for contact_submissions
CREATE POLICY "Admins can view all contact submissions"
ON contact_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE clerk_user_id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update contact submissions"
ON contact_submissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE clerk_user_id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
);

-- Allow anyone to insert contact submissions (public form)
CREATE POLICY "Anyone can submit contact form"
ON contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);