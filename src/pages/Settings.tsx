import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Building, FileText, Bell, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Pengaturan Disimpan",
      description: "Pengaturan aplikasi telah berhasil disimpan.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pengaturan</h1>
          <p className="text-muted-foreground">
            Kelola preferensi dan konfigurasi aplikasi Anda.
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary-hover">
          <Save className="mr-2 h-4 w-4" />
          Simpan Semua
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Settings */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Informasi Perusahaan
            </CardTitle>
            <CardDescription>
              Informasi ini akan muncul di semua dokumen yang dibuat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nama Perusahaan</Label>
              <Input
                id="companyName"
                placeholder="PT Contoh Perusahaan"
                defaultValue="PT Sejahtera Jaya"
              />
            </div>
            <div>
              <Label htmlFor="companyAddress">Alamat</Label>
              <Textarea
                id="companyAddress"
                placeholder="Alamat lengkap perusahaan"
                rows={3}
                defaultValue="Jl. Sudirman No. 123, Jakarta Pusat 10270"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="companyPhone">Telepon</Label>
                <Input
                  id="companyPhone"
                  placeholder="021-1234567"
                  defaultValue="021-5551234"
                />
              </div>
              <div>
                <Label htmlFor="companyEmail">Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  placeholder="info@perusahaan.com"
                  defaultValue="info@sejahtera.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="companyWebsite">Website</Label>
              <Input
                id="companyWebsite"
                placeholder="https://www.perusahaan.com"
                defaultValue="https://www.sejahtera.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Settings */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Pengaturan Dokumen
            </CardTitle>
            <CardDescription>
              Konfigurasi default untuk dokumen baru
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultTax">PPN Default (%)</Label>
              <Input
                id="defaultTax"
                type="number"
                min="0"
                max="100"
                placeholder="11"
                defaultValue="11"
              />
            </div>
            <div>
              <Label htmlFor="defaultDueDate">Jatuh Tempo Default (hari)</Label>
              <Input
                id="defaultDueDate"
                type="number"
                min="0"
                placeholder="30"
                defaultValue="30"
              />
            </div>
            <div>
              <Label htmlFor="currency">Mata Uang</Label>
              <Select defaultValue="idr">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idr">Rupiah (IDR)</SelectItem>
                  <SelectItem value="usd">Dollar (USD)</SelectItem>
                  <SelectItem value="eur">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="numberFormat">Format Nomor Dokumen</Label>
              <Select defaultValue="inv-yyyy-nnn">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inv-yyyy-nnn">INV-2024-001</SelectItem>
                  <SelectItem value="yyyy-mm-nnn">2024-01-001</SelectItem>
                  <SelectItem value="nnn-yyyy">001-2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifikasi
            </CardTitle>
            <CardDescription>
              Pengaturan pemberitahuan dan reminder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reminder Jatuh Tempo</Label>
                <p className="text-sm text-muted-foreground">
                  Kirim notifikasi sebelum invoice jatuh tempo
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifikasi Email</Label>
                <p className="text-sm text-muted-foreground">
                  Terima notifikasi melalui email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Backup otomatis data dokumen
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div>
              <Label htmlFor="reminderDays">Reminder (hari sebelum jatuh tempo)</Label>
              <Input
                id="reminderDays"
                type="number"
                min="1"
                max="30"
                placeholder="7"
                defaultValue="7"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Keamanan
            </CardTitle>
            <CardDescription>
              Pengaturan keamanan dan privasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Aktifkan autentikasi dua faktor
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Lock</Label>
                <p className="text-sm text-muted-foreground">
                  Kunci aplikasi saat tidak digunakan
                </p>
              </div>
              <Switch />
            </div>
            <div>
              <Label htmlFor="lockTimeout">Timeout (menit)</Label>
              <Input
                id="lockTimeout"
                type="number"
                min="1"
                max="120"
                placeholder="15"
                defaultValue="15"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Ubah Password
              </Button>
              <Button variant="outline" className="w-full">
                Export Data
              </Button>
              <Button variant="destructive" className="w-full">
                Reset Aplikasi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}