-- VAMS เขต 10 — schema เริ่มต้น: branches, valves, pm_history, profiles
-- รันไฟล์นี้ทั้งหมดใน Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- 1. branches — 26 สาขาในเขต 10
-- ============================================================
create table branches (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  note text, -- เช่น "ไม่มีใช้งาน", "ยังไม่ส่งข้อมูล" จากไฟล์ต้นฉบับ
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. valves — ข้อมูล control valve ผูกกับสาขา
-- ============================================================
create table valves (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete restrict,
  seq_no int, -- ลำดับรายการในสาขา (ตามไฟล์ต้นฉบับ)

  valve_type text not null,
  brand text not null,
  model text,
  size_mm numeric,

  status text not null default 'ไม่ระบุ'
    check (status in ('ใช้งาน', 'ไม่ได้ใช้งาน', 'ไม่ระบุ')),
  inactive_reason text,

  location text,
  latitude double precision,
  longitude double precision,

  install_year_be int, -- ปี พ.ศ.
  asset_code text,
  remark text,

  pressure_in numeric,
  pressure_out numeric,
  flow_rate numeric,

  image_url text, -- path ใน Supabase Storage bucket "valve-images"

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index valves_branch_id_idx on valves(branch_id);
create index valves_status_idx on valves(status);

-- ============================================================
-- 3. pm_history — ประวัติการบำรุงรักษา (กรอกใหม่ผ่านระบบ)
-- ============================================================
create table pm_history (
  id uuid primary key default gen_random_uuid(),
  valve_id uuid not null references valves(id) on delete cascade,

  performed_at date not null,
  title text not null,
  description text,

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index pm_history_valve_id_idx on pm_history(valve_id);

-- ============================================================
-- 4. profiles — ผูกผู้ใช้ที่ login กับสาขา + สิทธิ์
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null, -- null = เขต 10 (เห็นทุกสาขา)
  role text not null default 'branch_staff'
    check (role in ('region_admin', 'branch_staff')),
  full_name text,
  created_at timestamptz not null default now()
);

-- สร้าง profile อัตโนมัติเมื่อมีผู้ใช้ใหม่สมัคร (ยังไม่ผูกสาขา รอ region_admin กำหนด)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 5. updated_at trigger สำหรับ valves
-- ============================================================
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger valves_set_updated_at
  before update on valves
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- 6. helper function สำหรับใช้ใน RLS policy (security definer
--    เพื่อไม่ให้เกิด recursive RLS เวลา query ตาราง profiles เอง)
-- ============================================================
create function public.current_profile()
returns table (role text, branch_id uuid)
language sql
security definer
stable
set search_path = public
as $$
  select role, branch_id from profiles where id = auth.uid();
$$;

-- ============================================================
-- 7. Row Level Security
-- ============================================================
alter table branches enable row level security;
alter table valves enable row level security;
alter table pm_history enable row level security;
alter table profiles enable row level security;

-- branches: ทุกคนที่ login แล้วอ่านได้หมด, แก้ได้เฉพาะ region_admin
create policy "branches_select" on branches
  for select to authenticated using (true);

create policy "branches_write" on branches
  for all to authenticated
  using ((select role from public.current_profile()) = 'region_admin')
  with check ((select role from public.current_profile()) = 'region_admin');

-- valves: ทุกคนที่ login แล้วอ่านได้หมด (ภาพรวมทั้งเขต)
-- แก้ไขได้เฉพาะสาขาตัวเอง หรือ region_admin
create policy "valves_select" on valves
  for select to authenticated using (true);

create policy "valves_write" on valves
  for all to authenticated
  using (
    (select role from public.current_profile()) = 'region_admin'
    or branch_id = (select branch_id from public.current_profile())
  )
  with check (
    (select role from public.current_profile()) = 'region_admin'
    or branch_id = (select branch_id from public.current_profile())
  );

-- pm_history: อ่านได้หมด, เขียนได้ถ้ามีสิทธิ์กับวาล์วตัวนั้น
create policy "pm_history_select" on pm_history
  for select to authenticated using (true);

create policy "pm_history_write" on pm_history
  for all to authenticated
  using (
    exists (
      select 1 from valves v
      where v.id = pm_history.valve_id
        and (
          (select role from public.current_profile()) = 'region_admin'
          or v.branch_id = (select branch_id from public.current_profile())
        )
    )
  )
  with check (
    exists (
      select 1 from valves v
      where v.id = pm_history.valve_id
        and (
          (select role from public.current_profile()) = 'region_admin'
          or v.branch_id = (select branch_id from public.current_profile())
        )
    )
  );

-- profiles: เห็นโปรไฟล์ตัวเอง, region_admin เห็นทุกคน
create policy "profiles_select_own" on profiles
  for select to authenticated using (id = auth.uid());

create policy "profiles_select_admin" on profiles
  for select to authenticated
  using ((select role from public.current_profile()) = 'region_admin');

create policy "profiles_update_own" on profiles
  for update to authenticated using (id = auth.uid());

create policy "profiles_admin_manage" on profiles
  for all to authenticated
  using ((select role from public.current_profile()) = 'region_admin')
  with check ((select role from public.current_profile()) = 'region_admin');

-- ============================================================
-- 8. Storage bucket สำหรับรูปวาล์ว
-- ============================================================
insert into storage.buckets (id, name, public)
values ('valve-images', 'valve-images', true);

create policy "valve_images_public_read" on storage.objects
  for select to public using (bucket_id = 'valve-images');

create policy "valve_images_authenticated_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'valve-images');

create policy "valve_images_authenticated_update" on storage.objects
  for update to authenticated using (bucket_id = 'valve-images');

create policy "valve_images_authenticated_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'valve-images');
