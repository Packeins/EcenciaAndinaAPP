import { useState, useEffect } from 'react';
import { Convenio, Client } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Users, Building2, Mail, Phone, CalendarDays, Trash2, Search, UserPlus, ArrowLeft, FileDown, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Convenios() {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConvenio, setEditingConvenio] = useState<Convenio | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [convenioToToggle, setConvenioToToggle] = useState<Convenio | null>(null);

  const [formData, setFormData] = useState({
    ruc: '',
    nombre_empresa: '',
    representante: '',
    telefono: '',
    email: '',
    fecha_inicio: '',
    fecha_caducidad: '',
    cupo_maximo: 0,
  });

  // --- GESTIÓN DE COLABORADORES ---
  const [associatedClients, setAssociatedClients] = useState<any[]>([]);
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: ''
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    fetchConvenios();
  }, []);

  const fetchConvenios = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('http://localhost:3001/api/convenios');
      const data = await response.json();
      if (response.ok) setConvenios(data);
    } catch (err) { toast.error('Error de conexión'); }
    finally { setIsLoading(false); }
  };

  const fetchAssociatedClients = async (id: string) => {
    setIsLoadingClients(true);
    try {
      const response = await apiFetch(`http://localhost:3001/api/convenios/${id}/clientes`);
      if (response.ok) setAssociatedClients(await response.json());
    } finally { setIsLoadingClients(false); }
  };

  const fetchAllClientsForSelection = async () => {
    try {
      const response = await apiFetch('http://localhost:3001/api/clientes');
      if (response.ok) setAvailableClients(await response.json());
    } catch (err) { console.error(err); }
  };

  const handleOpenNew = () => {
    setEditingConvenio(null);
    setFormData({ ruc: '', nombre_empresa: '', representante: '', telefono: '', email: '', fecha_inicio: '', fecha_caducidad: '', cupo_maximo: 0 });
    setAssociatedClients([]);
    setDialogOpen(true);
    setShowCreateForm(false);
  };

  const handleEdit = (convenio: Convenio) => {
    setEditingConvenio(convenio);
    setFormData({
      ruc: convenio.ruc,
      nombre_empresa: convenio.nombre_empresa,
      representante: convenio.representante,
      telefono: convenio.telefono,
      email: convenio.email,
      fecha_inicio: convenio.fecha_inicio,
      fecha_caducidad: convenio.fecha_caducidad,
      cupo_maximo: convenio.cupo_maximo,
    });
    fetchAssociatedClients(convenio.id);
    fetchAllClientsForSelection();
    setDialogOpen(true);
    setShowCreateForm(false);
  };

  const handleSave = async () => {
    if (!formData.ruc || !formData.nombre_empresa || !formData.fecha_inicio || !formData.fecha_caducidad) {
      toast.error('Campos obligatorios faltantes'); return;
    }
    setIsSaving(true);
    try {
      const url = editingConvenio ? `http://localhost:3001/api/convenios/${editingConvenio.id}` : 'http://localhost:3001/api/convenios';
      const method = editingConvenio ? 'PUT' : 'POST';
      const response = await apiFetch(url, { method, body: JSON.stringify(formData) });
      const data = await response.json();
      if (response.ok) {
        if (editingConvenio) setConvenios(convenios.map(c => c.id === editingConvenio.id ? data : c));
        else setConvenios([data, ...convenios]);
        toast.success(editingConvenio ? 'Actualizado' : 'Creado');
        setDialogOpen(false);
      } else toast.error(data.error);
    } finally { setIsSaving(false); }
  };

  const handleAddClient = async (clientId: string) => {
    if (!editingConvenio) return;
    try {
      const response = await apiFetch(`http://localhost:3001/api/convenios/${editingConvenio.id}/clientes`, {
        method: 'POST', body: JSON.stringify({ id_cliente: clientId })
      });
      if (response.ok) {
        toast.success('Cliente agregado');
        fetchAssociatedClients(editingConvenio.id);
        fetchConvenios();
      } else {
        const data = await response.json();
        toast.error(data.error);
      }
    } catch (err) { toast.error('Error de conexión'); }
  };

  const handleCreateAndAddClient = async () => {
    if (!newClientData.cedula || !newClientData.nombre || !newClientData.apellido) {
      toast.error('Cédula, nombre y apellido son obligatorios'); return;
    }
    if (!editingConvenio) return;
    setIsSaving(true);
    try {
      const response = await apiFetch(`http://localhost:3001/api/convenios/${editingConvenio.id}/clientes/nuevo`, {
        method: 'POST',
        body: JSON.stringify(newClientData)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Cliente creado y vinculado');
        setAssociatedClients([...associatedClients, data]);
        setShowCreateForm(false);
        setNewClientData({ cedula: '', nombre: '', apellido: '', telefono: '' });
        fetchConvenios();
      } else toast.error(data.error);
    } finally { setIsSaving(false); }
  };

  const handleRemoveClient = async (clientId: string) => {
    if (!editingConvenio) return;
    try {
      const response = await apiFetch(`http://localhost:3001/api/convenios/${editingConvenio.id}/clientes/${clientId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Retirado');
        setAssociatedClients(associatedClients.filter(c => c.id !== clientId));
        fetchConvenios();
      }
    } catch (err) { toast.error('Error de conexión'); }
  };

  const handleToggleClick = (convenio: Convenio) => {
    if (convenio.activo) { setConvenioToToggle(convenio); setIsAlertOpen(true); }
    else confirmToggle(convenio.id, true);
  };

  const confirmToggle = async (id: string, newState: boolean) => {
    try {
      const response = await apiFetch(`http://localhost:3001/api/convenios/${id}`, { method: 'PUT', body: JSON.stringify({ activo: newState }) });
      if (response.ok) {
        const data = await response.json();
        setConvenios(convenios.map(c => c.id === id ? data : c));
      }
    } finally { setIsAlertOpen(false); setConvenioToToggle(null); }
  };

  const handleExportPDF = (convenio: Convenio) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Ventana emergente bloqueada');
        return;
      }

      const inicio = convenio.fecha_inicio || '';
      const fin = convenio.fecha_caducidad || '';
      
      // Cálculo de años simple
      let años = 1;
      if (inicio && fin) {
        const d1 = new Date(inicio);
        const d2 = new Date(fin);
        años = Math.round(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 365));
      }

      const contenido = `
        <html>
          <head>
            <title>Contrato ${convenio.nombre_empresa}</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px 60px; line-height: 1.6; text-align: justify; }
              .header { text-align: center; border-bottom: 2px solid #000; margin-bottom: 30px; padding-bottom: 10px; }
              .titulo { text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 30px; }
              .firma { margin-top: 60px; display: flex; justify-content: space-between; }
              .linea { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; }
              .dato { font-weight: bold; border-bottom: 1px solid #ccc; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 style="margin:0">ECENCIA ANDINA</h2>
              <p style="margin:0; font-size:12px">CONVENIOS DE ALIMENTACIÓN</p>
            </div>
            <div class="titulo">CONTRATO DE SERVICIO DE ALIMENTACIÓN</div>
            
            <p>Se celebra el presente convenio con fecha <span class="dato">${new Date().toLocaleDateString()}</span> para brindar servicios de almuerzos a la empresa <span class="dato">${convenio.nombre_empresa}</span> con RUC <span class="dato">${convenio.ruc}</span>.</p>
            
            <p>El convenio contempla un máximo de <span class="dato">${convenio.cupo_maximo}</span> colaboradores debidamente registrados en el sistema.</p>
            
            <p>La duración del contrato será de <span class="dato">${años} año(s)</span>, iniciando el día <span class="dato">${inicio}</span> y finalizando el día <span class="dato">${fin}</span>.</p>
            
            <p>Representante legal: <span class="dato">${convenio.representante || '________________'}</span><br>
               Contacto: <span class="dato">${convenio.email || convenio.telefono || '________________'}</span></p>

            <div class="firma">
              <div class="linea">Por ECencia Andina</div>
              <div class="linea">Por ${convenio.nombre_empresa}</div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(contenido);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error('Error al generar el documento');
    }
  };

  const filteredAvailableClients = availableClients.filter(c => 
    c.id_tipo_cliente === 1 &&
    !associatedClients.find(ac => ac.id === c.id) &&
    (clientSearch === '' || c.nombre.toLowerCase().includes(clientSearch.toLowerCase()) || c.cedula.includes(clientSearch))
  ).slice(0, 10);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Convenios</h1><p className="text-muted-foreground">Gestión de convenios empresariales</p></div>
        <Button onClick={handleOpenNew} className="gap-2"><Plus className="h-4 w-4" /> Nuevo Convenio</Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {convenios.map((convenio) => (
            <Card key={convenio.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
                    <div><CardTitle className="text-lg">{convenio.nombre_empresa}</CardTitle><CardDescription>RUC: {convenio.ruc}</CardDescription></div>
                  </div>
                  <Badge variant={convenio.activo ? 'default' : 'secondary'}>{convenio.activo ? 'Activo' : 'Inactivo'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                   <div className="flex items-center gap-2 text-foreground"><Users className="h-4 w-4 text-muted-foreground" /> {convenio.representante || '—'}</div>
                   <div className="flex items-center gap-2 text-foreground"><CalendarDays className="h-4 w-4 text-muted-foreground" /> {formatDate(convenio.fecha_inicio)} — {formatDate(convenio.fecha_caducidad)}</div>
                </div>
                <div className="space-y-3 py-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Máximo de Colaboradores</span>
                    <span className={`px-2 py-0.5 rounded-full ${convenio.totalColaboradores >= convenio.cupo_maximo ? "bg-destructive/10 text-destructive font-bold" : "bg-primary/10 text-primary font-bold"}`}>
                      {convenio.totalColaboradores} / {convenio.cupo_maximo}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${convenio.totalColaboradores >= convenio.cupo_maximo ? 'bg-destructive' : 'bg-primary'}`}
                      style={{ width: `${Math.min((convenio.totalColaboradores / (convenio.cupo_maximo || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={convenio.activo} onCheckedChange={() => handleToggleClick(convenio)} />
                    <Button variant="ghost" size="icon" onClick={() => handleExportPDF(convenio)} title="Exportar PDF">
                      <FileDown className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(convenio)}><Pencil className="mr-1 h-4 w-4" /> Editar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingConvenio ? 'Editar Convenio' : 'Nuevo Convenio'}</DialogTitle>
            <DialogDescription>Gestione la información y los colaboradores del convenio.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Información General</TabsTrigger>
              <TabsTrigger value="clients" disabled={!editingConvenio}>Colaboradores ({associatedClients.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4 py-4">
               <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>RUC *</Label><Input value={formData.ruc} onChange={e => setFormData({...formData, ruc: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Empresa *</Label><Input value={formData.nombre_empresa} onChange={e => setFormData({...formData, nombre_empresa: e.target.value})} /></div>
               </div>
               <div className="space-y-2"><Label>Representante</Label><Input value={formData.representante} onChange={e => setFormData({...formData, representante: e.target.value})} /></div>
               <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Teléfono</Label><Input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
               </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2"><Label>Fecha Inicio *</Label><Input type="date" value={formData.fecha_inicio} onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Fecha Caducidad *</Label><Input type="date" value={formData.fecha_caducidad} onChange={e => setFormData({...formData, fecha_caducidad: e.target.value})} /></div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Máximo de Colaboradores *</Label>
                      <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <Input 
                      type="number" 
                      min="0"
                      value={formData.cupo_maximo} 
                      onChange={e => setFormData({...formData, cupo_maximo: Math.max(0, parseInt(e.target.value) || 0)})} 
                    />
                  </div>
                </div>
               <DialogFooter className="pt-4"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar Datos'}</Button></DialogFooter>
            </TabsContent>

            <TabsContent value="clients" className="space-y-4 py-4">
              {!showCreateForm ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder="Buscar por nombre o cédula..." 
                        className="pl-10" 
                        value={clientSearch} 
                        onChange={e => setClientSearch(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                      />
                      {(clientSearch || isSearchFocused) && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[250px] overflow-y-auto">
                          <div className="p-2 border-b bg-accent/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {clientSearch ? 'Resultados de búsqueda' : 'Sugerencias de clientes'}
                          </div>
                          {filteredAvailableClients.length > 0 ? (
                            filteredAvailableClients.map(c => (
                              <div key={c.id} className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer" onClick={() => { handleAddClient(c.id); setClientSearch(''); }}>
                                <div><p className="text-sm font-medium">{c.nombre} {c.apellido}</p><p className="text-xs text-muted-foreground">{c.cedula}</p></div>
                                <UserPlus className="h-4 w-4 text-primary" />
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center space-y-2">
                              <p className="text-sm text-muted-foreground">No se encontró al cliente.</p>
                              <Button size="sm" variant="outline" onClick={() => setShowCreateForm(true)} className="gap-2"><Plus className="h-4 w-4" /> Registrar nuevo colaborador</Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => setShowCreateForm(true)} title="Registrar nuevo"><UserPlus className="h-4 w-4" /></Button>
                  </div>

                  <div className="rounded-md border max-h-[300px] overflow-y-auto">
                    {isLoadingClients ? <p className="p-4 text-center text-sm">Cargando...</p> : associatedClients.length === 0 ? <p className="p-4 text-center text-sm text-muted-foreground">No hay colaboradores asignados.</p> :
                      associatedClients.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 border-b last:border-0">
                          <div><p className="text-sm font-medium">{c.nombre} {c.apellido}</p><p className="text-xs text-muted-foreground">{c.cedula}</p></div>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveClient(c.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)} className="h-8 w-8 p-0"><ArrowLeft className="h-4 w-4" /></Button>
                    <h3 className="font-semibold">Nuevo Colaborador</h3>
                  </div>
                  <div className="space-y-2"><Label>Cédula *</Label><Input value={newClientData.cedula} onChange={e => setNewClientData({...newClientData, cedula: e.target.value})} maxLength={13} /></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Nombre *</Label><Input value={newClientData.nombre} onChange={e => setNewClientData({...newClientData, nombre: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Apellido *</Label><Input value={newClientData.apellido} onChange={e => setNewClientData({...newClientData, apellido: e.target.value})} /></div>
                  </div>
                  <div className="space-y-2"><Label>Teléfono</Label><Input value={newClientData.telefono} onChange={e => setNewClientData({...newClientData, telefono: e.target.value})} /></div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setShowCreateForm(false)}>Cancelar</Button>
                    <Button className="flex-1" onClick={handleCreateAndAddClient} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Crear y Vincular'}</Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Desactivar convenio?</AlertDialogTitle><AlertDialogDescription>El convenio quedará inactivo hasta que se reactive manualmente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setConvenioToToggle(null)}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => convenioToToggle && confirmToggle(convenioToToggle.id, false)} className="bg-destructive text-destructive-foreground">Sí, desactivar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
