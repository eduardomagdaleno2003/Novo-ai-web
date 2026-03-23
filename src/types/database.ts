export type EstadoProyecto = 'draft' | 'in_progress' | 'completed'
export type EstadoAgente = 'active' | 'inactive'
export type TipoDocumento = 'word' | 'excel' | 'pdf' | 'ppt'

export interface Proyecto {
  id: string
  nombre: string
  descripcion: string | null
  estado: EstadoProyecto
  fecha_inicio: string | null
  fecha_fin: string | null
  created_at: string
}

export interface Agente {
  id: string
  nombre: string
  rol: string
  descripcion: string | null
  estado: EstadoAgente
  created_at: string
}

export interface Documento {
  id: string
  proyecto_id: string | null
  agente_id: string | null
  nombre: string
  titulo: string
  tipo: TipoDocumento
  contenido: string | null
  ruta: string | null
  created_at: string
  proyectos?: Pick<Proyecto, 'id' | 'nombre'>
  agentes?: Pick<Agente, 'id' | 'nombre'>
}

export interface Correo {
  id: string
  proyecto_id: string | null
  de: string
  para: string
  asunto: string
  mensaje: string | null
  created_at: string
}

export interface HistorialEvento {
  id: string
  proyecto_id: string | null
  tipo_evento: string
  descripcion: string
  metadata: Record<string, unknown> | null
  created_at: string
  proyectos?: Pick<Proyecto, 'id' | 'nombre'>
}

export interface Database {
  public: {
    Tables: {
      proyectos: {
        Row: Proyecto
        Insert: Omit<Proyecto, 'id' | 'created_at'>
        Update: Partial<Omit<Proyecto, 'id' | 'created_at'>>
      }
      agentes: {
        Row: Agente
        Insert: Omit<Agente, 'id' | 'created_at'>
        Update: Partial<Omit<Agente, 'id' | 'created_at'>>
      }
      documentos: {
        Row: Documento
        Insert: Omit<Documento, 'id' | 'created_at' | 'proyectos' | 'agentes'>
        Update: Partial<Omit<Documento, 'id' | 'created_at' | 'proyectos' | 'agentes'>>
      }
      historial: {
        Row: HistorialEvento
        Insert: Omit<HistorialEvento, 'id' | 'created_at' | 'proyectos'>
        Update: Partial<Omit<HistorialEvento, 'id' | 'created_at' | 'proyectos'>>
      }
    }
  }
}
