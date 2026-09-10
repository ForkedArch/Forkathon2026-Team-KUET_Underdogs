import { supabase } from "../lib/supabase";

// Get all available spaces
export async function getSpaces() {
  const { data, error } = await supabase
    .from("spaces")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}

// Create a booking request
export async function createBooking(bookingData) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("You must log in first.");

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      student_id: user.id,
      space_id: bookingData.spaceId,
      booking_date: bookingData.bookingDate,
      start_time: bookingData.startTime,
      end_time: bookingData.endTime,
      participants: Number(bookingData.participants),
      purpose: bookingData.purpose,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get the logged-in student's bookings
export async function getMyBookings() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("You must log in first.");

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      spaces (
        id,
        name,
        category,
        location,
        capacity
      )
    `)
    .eq("student_id", user.id)
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) throw error;
  return data;
}

// Cancel one of the student's bookings
export async function cancelBooking(bookingId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("You must log in first.");

  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("student_id", user.id)
    .in("status", ["pending", "approved"])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get every booking for the admin
export async function getAllBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      spaces (
        id,
        name,
        category,
        location
      ),
      profiles!bookings_student_id_fkey (
        id,
        full_name,
        roll,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Approve a booking
export async function approveBooking(bookingId) {
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", bookingId)
    .eq("status", "pending")
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Reject a booking
export async function rejectBooking(bookingId, reason) {
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "rejected",
      rejection_reason: reason,
      rejected_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("status", "pending")
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Check in for an approved booking
export async function checkInBooking(bookingId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("You must log in first.");

  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "checked_in",
      checked_in_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("student_id", user.id)
    .eq("status", "approved")
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Listen for real-time booking changes
export function subscribeToBookings(onChange) {
  const channel = supabase
    .channel("booking-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookings",
      },
      onChange
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}