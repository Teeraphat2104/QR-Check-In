import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  getSessionSync() {
    return this.supabase.auth.getSession();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async signInAnonymously() {
    const { data, error } = await this.supabase.auth.signInAnonymously();
    if (error) throw error;
    return data;
  }
}
