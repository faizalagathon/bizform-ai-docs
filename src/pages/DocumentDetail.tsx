import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2, Save, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Document {
  id: string;
  type: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  date: string;
  dueDate?: string;
  notes: string;
  items: DocumentItem[];
  discount: number;
  tax: number;
  subtotal: number;
  grandTotal: number;
  createdAt: string;
}

const documentTypes = [
  { value: "invoice", label: "Invoice" },
  { value: "quotation", label: "Penawaran" },
  { value: "bast", label: "BAST" },
  { value: "receipt", label: "Kwitansi" },
];

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    // Mock data - in real app this would fetch from backend
    const mockDocument: Document = {
      id: id || "1",
      type: "invoice",
      clientName: "PT Contoh Perusahaan",
      clientAddress: "Jl. Sudirman No. 123, Jakarta Pusat",
      clientPhone: "021-1234567",
      clientEmail: "contact@contohperusahaan.com",
      date: "2024-01-15",
      dueDate: "2024-02-15",
      notes: "Pembayaran dapat dilakukan melalui transfer bank",
      items: [
        { id: "1", name: "Konsultasi IT", quantity: 10, price: 500000, total: 5000000 },
        { id: "2", name: "Setup Server", quantity: 1, price: 2000000, total: 2000000 }
      ],
      discount: 5,
      tax: 11,
      subtotal: 7000000,
      grandTotal: 7336500,
      createdAt: "2024-01-15T10:30:00Z"
    };
    setDocument(mockDocument);
  }, [id]);

  const handleSave = () => {
    if (!document) return;
    
    // Calculate totals
    const subtotal = document.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * document.discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * document.tax) / 100;
    const grandTotal = afterDiscount + taxAmount;

    setDocument({
      ...document,
      subtotal,
      grandTotal
    });

    setIsEditing(false);
    toast({
      title: "Dokumen Berhasil Disimpan",
      description: "Perubahan dokumen telah disimpan.",
    });
  };

  const handleDelete = () => {
    toast({
      title: "Dokumen Berhasil Dihapus",
      description: "Dokumen telah dihapus dari sistem.",
    });
    navigate("/history");
  };

  const updateItem = (id: string, field: keyof DocumentItem, value: string | number) => {
    if (!document) return;
    
    setDocument({
      ...document,
      items: document.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'price') {
            updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.price);
          }
          return updatedItem;
        }
        return item;
      })
    });
  };

  if (!document) {
    return <div>Loading...</div>;
  }

  const discountAmount = (document.subtotal * document.discount) / 100;
  const afterDiscount = document.subtotal - discountAmount;
  const taxAmount = (afterDiscount * document.tax) / 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/history")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {documentTypes.find(d => d.value === document.type)?.label} #{document.id}
            </h1>
            <p className="text-muted-foreground">
              Dibuat pada {new Date(document.createdAt).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Dokumen akan dihapus secara permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Batal
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Simpan
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Data */}
          <Card>
            <CardHeader>
              <CardTitle>Data Klien</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nama Perusahaan/Klien</Label>
                  {isEditing ? (
                    <Input
                      value={document.clientName}
                      onChange={(e) => setDocument({ ...document, clientName: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{document.clientName}</p>
                  )}
                </div>
                <div>
                  <Label>No. Telepon</Label>
                  {isEditing ? (
                    <Input
                      value={document.clientPhone}
                      onChange={(e) => setDocument({ ...document, clientPhone: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground">{document.clientPhone}</p>
                  )}
                </div>
              </div>
              <div>
                <Label>Alamat</Label>
                {isEditing ? (
                  <Textarea
                    value={document.clientAddress}
                    onChange={(e) => setDocument({ ...document, clientAddress: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-foreground">{document.clientAddress}</p>
                )}
              </div>
              <div>
                <Label>Email</Label>
                {isEditing ? (
                  <Input
                    value={document.clientEmail}
                    onChange={(e) => setDocument({ ...document, clientEmail: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground">{document.clientEmail}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Document Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Dokumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Tanggal Dokumen</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={document.date}
                      onChange={(e) => setDocument({ ...document, date: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground">{new Date(document.date).toLocaleDateString('id-ID')}</p>
                  )}
                </div>
                {(document.type === "invoice" || document.type === "quotation") && (
                  <div>
                    <Label>Jatuh Tempo</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={document.dueDate || ""}
                        onChange={(e) => setDocument({ ...document, dueDate: e.target.value || undefined })}
                      />
                    ) : (
                      <p className="text-foreground">
                        {document.dueDate ? new Date(document.dueDate).toLocaleDateString('id-ID') : "Tidak ditentukan"}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label>Catatan</Label>
                {isEditing ? (
                  <Textarea
                    value={document.notes}
                    onChange={(e) => setDocument({ ...document, notes: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-foreground">{document.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {document.items.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <Badge variant="outline" className="mb-2">Item {index + 1}</Badge>
                    <div className="grid gap-2 md:grid-cols-4">
                      <div className="md:col-span-2">
                        <Label>Nama Item</Label>
                        {isEditing ? (
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          />
                        ) : (
                          <p className="text-foreground font-medium">{item.name}</p>
                        )}
                      </div>
                      <div>
                        <Label>Jumlah</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          />
                        ) : (
                          <p className="text-foreground">{item.quantity}</p>
                        )}
                      </div>
                      <div>
                        <Label>Harga Satuan</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                          />
                        ) : (
                          <p className="text-foreground">Rp {item.price.toLocaleString('id-ID')}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right mt-2">
                      <span className="text-sm text-muted-foreground">Total: </span>
                      <span className="font-medium">Rp {item.total.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rp {document.subtotal.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Diskon ({document.discount}%):</span>
                  <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>PPN ({document.tax}%):</span>
                  <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>Rp {document.grandTotal.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="pt-4 space-y-2">
                <Button className="w-full">
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