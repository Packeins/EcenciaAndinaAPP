import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockConvenios } from '@/data/mockData';
import { FileDown, Calendar, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReportRow {
  colaborador: string;
  cantidadAlmuerzos: number;
  totalConsumo: number;
}

const mockReportData: ReportRow[] = [
  { colaborador: 'Carlos Pérez', cantidadAlmuerzos: 22, totalConsumo: 88.00 },
  { colaborador: 'Ana Martínez', cantidadAlmuerzos: 20, totalConsumo: 80.00 },
  { colaborador: 'Luis Fernández', cantidadAlmuerzos: 18, totalConsumo: 72.00 },
  { colaborador: 'Patricia Ruiz', cantidadAlmuerzos: 21, totalConsumo: 84.00 },
  { colaborador: 'Diana López', cantidadAlmuerzos: 19, totalConsumo: 76.00 },
  { colaborador: 'Eduardo Castro', cantidadAlmuerzos: 17, totalConsumo: 68.00 },
];

export default function Reportes() {
  const [fechaInicio, setFechaInicio] = useState('2026-01-01');
  const [fechaFin, setFechaFin] = useState('2026-01-19');
  const [convenioId, setConvenioId] = useState('all');
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [showReport, setShowReport] = useState(false);

  const handleGenerateReport = () => {
    // Simulate report generation
    setReportData(mockReportData);
    setShowReport(true);
    toast.success('Reporte generado correctamente');
  };

  const handleExport = () => {
    toast.success('Reporte exportado a Excel');
  };

  const totalAlmuerzos = reportData.reduce((sum, r) => sum + r.cantidadAlmuerzos, 0);
  const totalConsumo = reportData.reduce((sum, r) => sum + r.totalConsumo, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground">
          Generación de reportes de consumo
        </p>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Filtros de Reporte</CardTitle>
          <CardDescription>
            Seleccione el rango de fechas y convenio para generar el reporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha Inicio
              </Label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha Fin
              </Label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Convenio
              </Label>
              <Select value={convenioId} onValueChange={setConvenioId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar convenio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los convenios</SelectItem>
                  {mockConvenios.filter(c => c.activo).map((convenio) => (
                    <SelectItem key={convenio.id} value={convenio.id}>
                      {convenio.nombre_empresa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerateReport} className="w-full">
                Generar Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {showReport && (
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Resultados del Reporte</CardTitle>
              <CardDescription>
                Período: {fechaInicio} al {fechaFin}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <FileDown className="h-4 w-4" />
              Exportar Excel
            </Button>
          </CardHeader>
          <CardContent>
            {/* Summary Cards */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-sm text-muted-foreground">Total Almuerzos</p>
                <p className="text-3xl font-bold text-foreground">{totalAlmuerzos}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-sm text-muted-foreground">Total Consumido</p>
                <p className="text-3xl font-bold text-foreground">${totalConsumo.toFixed(2)}</p>
              </div>
            </div>

            {/* Results Table */}
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-accent/50">
                    <TableHead>Colaborador</TableHead>
                    <TableHead className="text-center">Cantidad de Almuerzos</TableHead>
                    <TableHead className="text-right">Total Consumido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-foreground">
                        {row.colaborador}
                      </TableCell>
                      <TableCell className="text-center text-foreground">
                        {row.cantidadAlmuerzos}
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        ${row.totalConsumo.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-accent/30 font-bold">
                    <TableCell className="text-foreground">TOTAL</TableCell>
                    <TableCell className="text-center text-foreground">{totalAlmuerzos}</TableCell>
                    <TableCell className="text-right text-foreground">${totalConsumo.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
