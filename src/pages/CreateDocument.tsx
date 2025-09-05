import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Eye, Download, Save, Calculator, Users, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Client {
  id: string;
  company: string;
  address: string;
  phone: string;
  email: string;
}

interface QuotationDocument {
  id: string;
  clientData: {
    company: string;
    address: string;
    phone: string;
    email: string;
  };
  items: DocumentItem[];
  date: string;
  notes: string;
}

const documentTypes = [
  { value: "invoice", label: "Invoice" },
  { value: "quotation", label: "Penawaran" },
  { value: "bast", label: "BAST" },
  { value: "receipt", label: "Kwitansi" },
];

export default function CreateDocument() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [documentType, setDocumentType] = useState(searchParams.get("type") || "invoice");
  const [clientData, setClientData] = useState({
    company: "",
    address: "",
    phone: "",
    email: "",
  });
  const [documentData, setDocumentData] = useState({
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    notes: "",
    discount: 0,
    tax: 11, // PPN 11%
  });
  const [items, setItems] = useState<DocumentItem[]>([
    { id: "1", name: "", quantity: 1, price: 0, total: 0 }
  ]);

  // Mock data for clients and quotations
  const [mockClients] = useState<Client[]>([
    {
      id: "1",
      company: "PT Contoh Perusahaan",
      address: "Jl. Sudirman No. 123, Jakarta Pusat",
      phone: "021-1234567",
      email: "contact@contohperusahaan.com"
    },
    {
      id: "2",
      company: "CV Maju Jaya",
      address: "Jl. Gatot Subroto No. 456, Bandung",
      phone: "022-7654321",
      email: "info@majujaya.com"
    }
  ]);

  const [mockQuotations] = useState<QuotationDocument[]>([
    {
      id: "Q001",
      clientData: {
        company: "PT Contoh Perusahaan",
        address: "Jl. Sudirman No. 123, Jakarta Pusat",
        phone: "021-1234567",
        email: "contact@contohperusahaan.com"
      },
      items: [
        { id: "1", name: "Konsultasi IT", quantity: 10, price: 500000, total: 5000000 },
        { id: "2", name: "Setup Server", quantity: 1, price: 2000000, total: 2000000 }
      ],
      date: "2024-01-15",
      notes: "Penawaran berlaku 30 hari"
    }
  ]);

  const addItem = () => {
    const newItem: DocumentItem = {
      id: Date.now().toString(),
      name: "",
      quantity: 1,
      price: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof DocumentItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.price);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * documentData.discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * documentData.tax) / 100;
  const grandTotal = afterDiscount + taxAmount;

  const selectClient = (client: Client) => {
    setClientData({
      company: client.company,
      address: client.address,
      phone: client.phone,
      email: client.email,
    });
  };

  const selectQuotation = (quotation: QuotationDocument) => {
    setClientData(quotation.clientData);
    setItems(quotation.items);
    setDocumentData({
      ...documentData,
      notes: `Berdasarkan penawaran #${quotation.id} tanggal ${new Date(quotation.date).toLocaleDateString('id-ID')}`
    });
  };

  const handleGenerateDocument = () => {
    if (!clientData.company || items.some(item => !item.name)) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Mohon lengkapi data klien dan item dokumen.",
      });
      return;
    }

    toast({
      title: "Dokumen Berhasil Dibuat",
      description: `${documentTypes.find(d => d.value === documentType)?.label} untuk ${clientData.company} telah dibuat.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Buat Dokumen</h1>
          <p className="text-muted-foreground">
            Buat dokumen bisnis profesional dengan mudah dan cepat.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Simpan Draft
          </Button>
          <Button onClick={handleGenerateDocument} className="bg-primary hover:bg-primary-hover">
            <Eye className="mr-2 h-4 w-4" />
            Generate & Preview
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Type */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Jenis Dokumen</CardTitle>
              <CardDescription>Pilih jenis dokumen yang ingin dibuat</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis dokumen" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Client Data */}
          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Data Klien</CardTitle>
                <CardDescription>Informasi perusahaan atau klien</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Users className="mr-2 h-4 w-4" />
                      Pilih Klien
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Pilih Klien</DialogTitle>
                      <DialogDescription>
                        Pilih klien dari daftar yang tersedia
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {mockClients.map((client) => (
                        <div
                          key={client.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                          onClick={() => selectClient(client)}
                        >
                          <p className="font-medium">{client.company}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                
                {documentType === "invoice" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Dari Penawaran
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pilih Penawaran</DialogTitle>
                        <DialogDescription>
                          Buat invoice berdasarkan penawaran yang sudah ada
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {mockQuotations.map((quotation) => (
                          <div
                            key={quotation.id}
                            className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                            onClick={() => selectQuotation(quotation)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">#{quotation.id}</p>
                                <p className="text-sm text-muted-foreground">{quotation.clientData.company}</p>
                              </div>
                              <Badge variant="outline">
                                {new Date(quotation.date).toLocaleDateString('id-ID')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="company">Nama Perusahaan/Klien</Label>
                  <Input
                    id="company"
                    value={clientData.company}
                    onChange={(e) => setClientData({ ...clientData, company: e.target.value })}
                    placeholder="PT Contoh Perusahaan"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">No. Telepon</Label>
                  <Input
                    id="phone"
                    value={clientData.phone}
                    onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                    placeholder="021-1234567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={clientData.address}
                  onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
                  placeholder="Jl. Contoh No. 123, Jakarta"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Document Details */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Detail Dokumen</CardTitle>
              <CardDescription>Tanggal dan informasi dokumen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="date">Tanggal Dokumen</Label>
                  <Input
                    id="date"
                    type="date"
                    value={documentData.date}
                    onChange={(e) => setDocumentData({ ...documentData, date: e.target.value })}
                  />
                </div>
                {(documentType === "invoice" || documentType === "quotation") && (
                  <div>
                    <Label htmlFor="dueDate">Jatuh Tempo (Opsional)</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={documentData.dueDate}
                      onChange={(e) => setDocumentData({ ...documentData, dueDate: e.target.value })}
                      placeholder="Kosongkan jika tidak ada jatuh tempo"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={documentData.notes}
                  onChange={(e) => setDocumentData({ ...documentData, notes: e.target.value })}
                  placeholder="Catatan atau syarat & ketentuan..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daftar Item</CardTitle>
                <CardDescription>Barang atau jasa yang akan ditagihkan</CardDescription>
              </div>
              <Button onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid gap-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Item {index + 1}</Badge>
                      {items.length > 1 && (
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-2 md:grid-cols-4">
                      <div className="md:col-span-2">
                        <Label>Nama Item</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          placeholder="Nama barang/jasa"
                        />
                      </div>
                      <div>
                        <Label>Jumlah</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Harga Satuan</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">Total: </span>
                      <span className="font-medium">
                        Rp {item.total.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Ringkasan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discount">Diskon (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={documentData.discount}
                    onChange={(e) => setDocumentData({ ...documentData, discount: Number(e.target.value) })}
                  />
                </div>
                
                {documentData.discount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Potongan ({documentData.discount}%):</span>
                    <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="tax">PPN (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    min="0"
                    max="100"
                    value={documentData.tax}
                    onChange={(e) => setDocumentData({ ...documentData, tax: Number(e.target.value) })}
                  />
                </div>
                
                {documentData.tax > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>PPN ({documentData.tax}%):</span>
                    <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="pt-4 space-y-2">
                <Button onClick={handleGenerateDocument} className="w-full bg-primary hover:bg-primary-hover">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Dokumen
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}