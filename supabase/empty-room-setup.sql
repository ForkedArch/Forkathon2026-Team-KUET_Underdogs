-- Empty Room: recorded Supabase migration baseline
-- Exported 2026-09-11. For a NEW, EMPTY Supabase project only.
-- Do not run against the existing working project.
-- Includes recorded migrations, not a full live schema/data backup.
-- No passwords, user records, or booking records are included.
-- Supabase Auth and the supabase_realtime publication must exist.
-- After setup, sign up through the app and assign the designated admin
-- through the SQL Editor (never through student-editable metadata).
-- This baseline defines check-in but does not schedule automatic
-- no-show, completed, or expired status transitions.
BEGIN;

-- Recorded migration 20260910144735: create_core_tables

create extension if not exists btree_gist;

create type public.user_role as enum ('student', 'admin');

create type public.space_category as enum (
  'classroom', 'study_space', 'meeting_room', 'laboratory', 'sports_facility'
);

create type public.space_operational_status as enum (
  'available', 'maintenance', 'restricted'
);

create type public.booking_purpose as enum (
  'group_study', 'project_work', 'meeting', 'laboratory_work',
  'presentation', 'sports_practice', 'club_activity'
);

create type public.booking_status as enum (
  'pending', 'approved', 'rejected', 'cancelled',
  'checked_in', 'completed', 'no_show', 'expired'
);

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (length(trim(full_name)) between 2 and 100),
  roll text unique,
  email text not null unique,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 120),
  category public.space_category not null,
  location text not null check (length(trim(location)) between 2 and 160),
  capacity integer not null check (capacity > 0),
  description text,
  projector boolean not null default false,
  equipment text[] not null default '{}',
  usage_rules text,
  permission_information text,
  access_instructions text,
  opening_time time not null default time '08:00',
  closing_time time not null default time '20:00',
  operational_status public.space_operational_status not null default 'available',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spaces_valid_hours check (closing_time > opening_time),
  constraint spaces_unique_name_location unique (name, location)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  space_id uuid not null,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  participants integer not null check (participants > 0),
  purpose public.booking_purpose not null,
  status public.booking_status not null default 'pending',
  rejection_reason text,
  approved_at timestamptz,
  rejected_at timestamptz,
  cancelled_at timestamptz,
  checked_in_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_student_id_fkey
    foreign key (student_id) references public.profiles(id) on delete restrict,
  constraint bookings_space_id_fkey
    foreign key (space_id) references public.spaces(id) on delete restrict,
  constraint bookings_valid_time check (end_time > start_time),
  constraint bookings_rejection_reason check (
    status <> 'rejected'
    or nullif(trim(rejection_reason), '') is not null
  ),
  constraint bookings_no_approved_overlap
    exclude using gist (
      space_id with =,
      tsrange(booking_date + start_time, booking_date + end_time, '[)') with &&
    )
    where (status in ('approved', 'checked_in'))
);

create index profiles_role_idx on public.profiles(role);
create index spaces_category_active_idx on public.spaces(category, is_active);
create index bookings_student_created_idx on public.bookings(student_id, created_at desc);
create index bookings_space_date_idx on public.bookings(space_id, booking_date, start_time, end_time);
create index bookings_status_idx on public.bookings(status);

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.bookings enable row level security;

revoke all on public.profiles, public.spaces, public.bookings from anon;
revoke all on public.profiles, public.spaces, public.bookings from authenticated;


-- Recorded migration 20260910144904: add_auth_rls_and_booking_rules

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger spaces_set_updated_at
before update on public.spaces
for each row execute function private.set_updated_at();

create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function private.set_updated_at();

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, roll, email, role)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ),
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'roll',
      new.raw_user_meta_data ->> 'student_id'
    )), ''),
    new.email,
    'student'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

insert into public.profiles (id, full_name, roll, email, role)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
    split_part(u.email, '@', 1)
  ),
  nullif(trim(coalesce(
    u.raw_user_meta_data ->> 'roll',
    u.raw_user_meta_data ->> 'student_id'
  )), ''),
  u.email,
  'student'
from auth.users u
where u.email is not null
on conflict (id) do nothing;

create or replace function private.validate_booking_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_space public.spaces%rowtype;
  v_start timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if new.student_id <> auth.uid() then
    raise exception 'You can only create a booking for yourself';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'student'
  ) then
    raise exception 'Only students can request bookings';
  end if;

  if new.status <> 'pending' then
    raise exception 'New bookings must start as pending';
  end if;

  if new.end_time <= new.start_time then
    raise exception 'End time must be later than start time';
  end if;

  if new.participants <= 0 then
    raise exception 'Participant count must be positive';
  end if;

  v_start := (new.booking_date + new.start_time) at time zone 'Asia/Dhaka';
  if v_start <= now() then
    raise exception 'Booking start time must be in the future';
  end if;

  select * into v_space
  from public.spaces
  where id = new.space_id;

  if not found or not v_space.is_active then
    raise exception 'Space is not accepting bookings';
  end if;

  if v_space.operational_status <> 'available' then
    raise exception 'Space is not currently usable';
  end if;

  if new.participants > v_space.capacity then
    raise exception 'Participant count exceeds space capacity';
  end if;

  if new.start_time < v_space.opening_time
     or new.end_time > v_space.closing_time then
    raise exception 'Requested time is outside opening hours';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_booking_insert() from public, anon, authenticated;

create trigger bookings_validate_insert
before insert on public.bookings
for each row execute function private.validate_booking_insert();

create or replace function private.validate_booking_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_start timestamptz;
begin
  if new.student_id is distinct from old.student_id
     or new.space_id is distinct from old.space_id
     or new.booking_date is distinct from old.booking_date
     or new.start_time is distinct from old.start_time
     or new.end_time is distinct from old.end_time
     or new.participants is distinct from old.participants
     or new.purpose is distinct from old.purpose then
    raise exception 'Booking details cannot be changed after submission';
  end if;

  v_start := (old.booking_date + old.start_time) at time zone 'Asia/Dhaka';

  if private.is_admin() then
    if old.status <> 'pending' or new.status not in ('approved', 'rejected') then
      raise exception 'Admin can only approve or reject a pending booking';
    end if;

    if new.status = 'approved' then
      if v_start <= now() then
        raise exception 'A booking cannot be approved after its start time';
      end if;
      new.rejection_reason := null;
      new.approved_at := now();
      new.rejected_at := null;
    else
      if nullif(trim(new.rejection_reason), '') is null then
        raise exception 'A rejection reason is required';
      end if;
      new.rejection_reason := trim(new.rejection_reason);
      new.rejected_at := now();
      new.approved_at := null;
    end if;

    return new;
  end if;

  if auth.uid() is null or old.student_id <> auth.uid() then
    raise exception 'You cannot update this booking';
  end if;

  if new.status = 'cancelled' and old.status in ('pending', 'approved') then
    if v_start <= now() then
      raise exception 'A booking cannot be cancelled after it starts';
    end if;
    new.rejection_reason := old.rejection_reason;
    new.cancelled_at := now();
    return new;
  end if;

  if new.status = 'checked_in' and old.status = 'approved' then
    if now() < v_start or now() > v_start + interval '15 minutes' then
      raise exception 'Check-in is allowed from the start time for 15 minutes';
    end if;
    new.rejection_reason := old.rejection_reason;
    new.checked_in_at := now();
    return new;
  end if;

  raise exception 'This booking status change is not allowed';
end;
$$;

revoke all on function private.validate_booking_update() from public, anon, authenticated;

create trigger bookings_validate_update
before update on public.bookings
for each row execute function private.validate_booking_update();

create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
);

create policy spaces_select_active_or_admin
on public.spaces
for select
to authenticated
using (
  is_active
  or (select private.is_admin())
);

create policy spaces_admin_insert
on public.spaces
for insert
to authenticated
with check ((select private.is_admin()));

create policy spaces_admin_update
on public.spaces
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy bookings_select_own_or_admin
on public.bookings
for select
to authenticated
using (
  student_id = (select auth.uid())
  or (select private.is_admin())
);

create policy bookings_student_insert
on public.bookings
for insert
to authenticated
with check (
  student_id = (select auth.uid())
  and status = 'pending'
);

create policy bookings_owner_or_admin_update
on public.bookings
for update
to authenticated
using (
  student_id = (select auth.uid())
  or (select private.is_admin())
)
with check (
  student_id = (select auth.uid())
  or (select private.is_admin())
);

grant select on public.profiles to authenticated;
grant select, insert, update on public.spaces to authenticated;
grant select, insert, update on public.bookings to authenticated;


-- Recorded migration 20260910144956: add_booking_api_and_realtime

create or replace function public.create_booking(
  p_space_id uuid,
  p_booking_date date,
  p_start_time time,
  p_end_time time,
  p_participants integer,
  p_purpose public.booking_purpose
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.bookings (
    student_id, space_id, booking_date, start_time,
    end_time, participants, purpose, status
  )
  values (
    auth.uid(), p_space_id, p_booking_date, p_start_time,
    p_end_time, p_participants, p_purpose, 'pending'
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.bookings
  set status = 'cancelled'
  where id = p_booking_id
    and student_id = auth.uid();

  if not found then
    raise exception 'Booking not found';
  end if;

  return true;
end;
$$;

create or replace function public.check_in_booking(p_booking_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.bookings
  set status = 'checked_in'
  where id = p_booking_id
    and student_id = auth.uid();

  if not found then
    raise exception 'Booking not found';
  end if;

  return true;
end;
$$;

create or replace function public.review_booking(
  p_booking_id uuid,
  p_decision text,
  p_rejection_reason text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only the admin can review bookings';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  update public.bookings
  set
    status = p_decision::public.booking_status,
    rejection_reason = case
      when p_decision = 'rejected' then p_rejection_reason
      else null
    end
  where id = p_booking_id;

  if not found then
    raise exception 'Booking not found';
  end if;

  return true;
end;
$$;

revoke all on function public.create_booking(uuid, date, time, time, integer, public.booking_purpose)
from public, anon, authenticated;
revoke all on function public.cancel_booking(uuid)
from public, anon, authenticated;
revoke all on function public.check_in_booking(uuid)
from public, anon, authenticated;
revoke all on function public.review_booking(uuid, text, text)
from public, anon, authenticated;

grant execute on function public.create_booking(uuid, date, time, time, integer, public.booking_purpose)
to authenticated;
grant execute on function public.cancel_booking(uuid)
to authenticated;
grant execute on function public.check_in_booking(uuid)
to authenticated;
grant execute on function public.review_booking(uuid, text, text)
to authenticated;

alter table public.bookings replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end $$;


-- Recorded migration 20260910145123: move_btree_gist_to_private_schema
alter extension btree_gist set schema private;
COMMIT;

