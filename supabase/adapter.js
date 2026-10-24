/**
 * Triprasa Supabase adapter — integration scaffold only.
 *
 * This module does not connect until supabase/config.js contains a project URL
 * and a publishable/anon key. It intentionally does not write order/payment data.
 */
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const configured = Boolean(
  SUPABASE_URL &&
  SUPABASE_PUBLISHABLE_KEY &&
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL)
);

let clientPromise;

async function getClient() {
  if (!configured) {
    throw new Error("Triprasa shared backend is not configured yet. Browser-local demo mode remains active.");
  }

  if (!clientPromise) {
    clientPromise = import("https://esm.sh/@supabase/supabase-js@2")
      .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }))
      .catch((error) => {
        clientPromise = undefined;
        throw new Error("Could not load the Supabase client. Check network access and the CDN dependency.", { cause: error });
      });
  }

  return clientPromise;
}

async function requireUser() {
  const client = await getClient();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Please sign in before continuing.");
  return { client, user: data.user };
}

async function requireAdmin() {
  const { client, user } = await requireUser();
  const { data: profile, error } = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  if (profile?.role !== "admin") {
    throw new Error("Admin access is required for this action.");
  }

  return { client, user };
}

function normaliseProduct(input) {
  const price = Number(input.price_inr);
  const stock = Number(input.stock_quantity ?? 0);
  if (!String(input.name ?? "").trim()) throw new Error("Product name is required.");
  if (!String(input.maker_name ?? "").trim()) throw new Error("Maker name is required.");
  if (!String(input.category ?? "").trim()) throw new Error("Product category is required.");
  if (!Number.isSafeInteger(price) || price < 0) throw new Error("Price must be a non-negative whole number in INR.");
  if (!Number.isSafeInteger(stock) || stock < 0) throw new Error("Stock must be a non-negative whole number.");

  return {
    slug: input.slug ? String(input.slug).trim() : null,
    name: String(input.name).trim(),
    maker_name: String(input.maker_name).trim(),
    category: String(input.category).trim(),
    description: String(input.description ?? "").trim(),
    price_inr: price,
    image_url: input.image_url ? String(input.image_url).trim() : null,
    status: ["draft", "published", "archived"].includes(input.status) ? input.status : "draft",
    stock_quantity: stock
  };
}

export const TriprasaBackend = Object.freeze({
  isConfigured: () => configured,

  async signInWithPassword({ email, password }) {
    const client = await getClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const client = await getClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const client = await getClient();
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    return data.user ?? null;
  },

  async listPublishedProducts() {
    const client = await getClient();
    const { data, error } = await client
      .from("products")
      .select("id, slug, name, maker_name, category, description, price_inr, image_url, stock_quantity, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async submitMakerApplication(input) {
    const { client, user } = await requireUser();
    if (input.consent_to_contact !== true) {
      throw new Error("Consent to be contacted is required before submitting.");
    }

    const row = {
      user_id: user.id,
      applicant_name: String(input.applicant_name ?? "").trim(),
      business_name: String(input.business_name ?? "").trim(),
      email: String(input.email ?? user.email ?? "").trim(),
      phone: String(input.phone ?? "").trim() || null,
      locality: String(input.locality ?? "").trim() || null,
      product_types: String(input.product_types ?? "").trim() || null,
      story: String(input.story ?? "").trim() || null,
      consent_to_contact: true
    };
    if (!row.applicant_name || !row.business_name || !row.email) {
      throw new Error("Applicant name, business name, and email are required.");
    }

    const { data, error } = await client
      .from("maker_applications")
      .insert(row)
      .select("id, status, created_at")
      .single();
    if (error) throw error;
    return data;
  },

  async listOwnMakerApplications() {
    const { client, user } = await requireUser();
    const { data, error } = await client
      .from("maker_applications")
      .select("id, business_name, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async adminListProducts() {
    const { client } = await requireAdmin();
    const { data, error } = await client
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async adminSaveProduct(input, id = null) {
    const { client, user } = await requireAdmin();
    const row = { ...normaliseProduct(input), updated_at: new Date().toISOString() };

    if (id) {
      const { data, error } = await client
        .from("products")
        .update(row)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await client
      .from("products")
      .insert({ ...row, created_by: user.id })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async adminDeleteProduct(id) {
    const { client } = await requireAdmin();
    const { error } = await client.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  async adminListMakerApplications() {
    const { client } = await requireAdmin();
    const { data, error } = await client
      .from("maker_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async adminReviewMakerApplication(id, status) {
    const { client, user } = await requireAdmin();
    if (!["reviewing", "approved", "declined"].includes(status)) {
      throw new Error("Unsupported maker application status.");
    }

    const { data, error } = await client
      .from("maker_applications")
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("id, status, reviewed_at")
      .single();
    if (error) throw error;
    return data;
  }
});

if (typeof window !== "undefined") {
  window.TriprasaBackend = TriprasaBackend;
}
