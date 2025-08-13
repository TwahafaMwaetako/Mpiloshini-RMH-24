import { supabase } from '@/services/supabaseClient'

export type MachineRecord = {
  id?: string
  name: string
  type?: string | null
  location?: string | null
  commissioning_date?: string | null
  created_at?: string
}

function parseOrder(order?: string): { field: string; ascending: boolean } {
  const ascending = !(order || '').startsWith('-')
  const field = (order || 'created_at').replace(/^[-+]/, '')
  return { field, ascending }
}

export const Machine = {
  async list(order?: string): Promise<MachineRecord[]> {
    const { field, ascending } = parseOrder(order)
    const { data, error } = await supabase.from('machines').select('*').order(field, { ascending })
    if (error) throw error
    return data ?? []
  },

  async create(payload: Omit<MachineRecord, 'id' | 'created_at'>): Promise<MachineRecord> {
    const { data, error } = await supabase.from('machines').insert(payload).select('*').single()
    if (error) throw error
    return data as MachineRecord
  },

  async update(id: string, payload: Partial<MachineRecord>): Promise<void> {
    const { error } = await supabase.from('machines').update(payload).eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('machines').delete().eq('id', id)
    if (error) throw error
  },
}

