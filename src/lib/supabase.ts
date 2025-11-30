// Mock Supabase client for local storage only
const supabaseUrl = '';
const supabaseAnonKey = '';

// Create a mock client that doesn't do anything
export const supabase = {
    from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null })
    }),
    channel: () => ({
        on: () => ({
            subscribe: () => ({})
        })
    })
};